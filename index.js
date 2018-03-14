const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true })
const cheerio = require('cheerio');
const chalk = require('chalk');
const fs = require('fs-extra');
const { URL } = require('url');
const psl = require('psl');

let urls = [];
let visitedUrls = [];

let targetUrl = 'https://www......com:443';
let rootUrl = new URL(targetUrl);
rootUrl.psl = psl.parse(rootUrl.hostname);
if (rootUrl.psl.error) {
    console.log(rootUrl.psl.error.message);
} else {
    removeFile(rootUrl);
}

function isUsable(href) {
    if (typeof href === 'object') {
        return true;
    } else if (typeof href === 'string') {
        if (href.indexOf('tel:') > -1) { return false };
        if (href.indexOf('mailto://') > -1) { return false };
        if (href.indexOf('@') > -1) { return false; }
        if (href.indexOf('#') > -1) { return false; }
        if (href.indexOf('void(0)') > -1 || href.indexOf('()') > -1 || href.indexOf('javascript:') > -1) { return false; }
        if ((href.indexOf('https://') > -1 || href.indexOf('http://')) > -1) {
            if (href.indexOf(`www.${rootUrl.psl.domain}`) > -1 || href.indexOf(rootUrl.psl.domain) > -1) {
                if (href.indexOf(`.${rootUrl.psl.domain}`) > -1 && href.indexOf(`www.${rootUrl.psl.domain}`) === -1) {
                    return false;
                }
                return true;
            }
            return false;
        }
        if (href.indexOf('//') > -1) {
            return false;
        }
        if (href.indexOf('.jpg') > -1) {
            return false;
        }
        // if (href.indexOf(rootUrl) > -1) {
        //     return true;
        // }
        return true;
    } else {
        debugger;
        return false;
    }
    return true;
}

function updateFile(link) {
    fs.ensureFile('./links.txt', err => {
        if (err) return console.log(err);
        fs.appendFile('./links.txt', link + '\n', err => {
            if (err) return console.log(err);
        });
    });
}

function addLinks(links) {
    let $ = cheerio.load(links);
    $(links).each((i, link) => {
        let href = $(link).attr('href');
        if (href) {
            if (isUsable(href)) {
                if (urls.indexOf(targetUrl + $(link).attr('href')) === -1) {
                    let l = $(link).attr('href');
                    let x = '';
                    if (typeof l !== 'undefined') {
                        if (l.indexOf('https://') === -1 && l.indexOf('http://') === -1) {
                            if (l !== '/') {
                                x = rootUrl.href + l.replace('/', '');
                            } else {
                                x = rootUrl.href;
                            }
                        } else {
                            // Just pass it along.
                            x = l;
                        }
                        if (urls.indexOf(x) === -1 && visitedUrls.indexOf(x) === -1) {
                            urls.push(x);
                            console.log(chalk.gray(`  ~ adding new link `) + x + chalk.gray(` to `) + chalk.yellow(`urls `) + `(` + chalk.green(urls.length) + `)`);
                        }
                    }
                } else {
                    let index = null;
                    let x = urls.map((x, i) => {
                        if (x === href) {
                            index = i;
                        }
                    })
                }
            }
        }
    });
}

function run(u) {
    const notifier = require('node-notifier');
    let urlPath = '';
    if (isUsable(u)) {
        if (typeof u === 'string') {
            if (visitedUrls.indexOf(u) === -1) {
                visitedUrls.push(u);
                updateFile(u);
                console.log(chalk.cyan(`+ `) + u + chalk.gray(` to `) + chalk.cyan(`visitedUrls `) + `(` + chalk.green(visitedUrls.length) + `)`);
                urls.pop();
                console.log(chalk.yellow(`- `) + u + chalk.gray(` from `) + chalk.yellow(`urls `) + `(` + chalk.green(urls.length) + `)`);
                urlPath = u;
            }
        } else if (typeof u === 'object') {
            debugger;
            if (visitedUrls.indexOf(u.hostname) === -1) {
                visitedUrls.push(u.hostname);
                updateFile(u.origin);
                console.log(chalk.cyan(`+ `) + u.hostname + chalk.gray(` to `) + chalk.cyan(`visitedUrls `) + `(` + chalk.green(visitedUrls.length) + `)`);
                urls.pop();
                console.log(chalk.yellow(`- `) + u.hostname + chalk.gray(` from `) + chalk.yellow(`urls `) + `(` + chalk.green(urls.length) + `)`);
                urlPath = u;
            }
        }
        
        nightmare
            .goto(urlPath)
            .wait(100)
            .evaluate(function () {
                return document.body.innerHTML;
            })
            .then(function (body) {
                var $ = cheerio.load(body);
                var links = $('a');
                if (links.length > 0) {
                    addLinks(links);
                    if (urls.length > 0) {
                        let u = urls[urls.length - 1];
                        run(u);
                    } else {
                        // Nothing left in urls array
                        notifier.notify({
                            title: 'Web-Crawl',
                            message: 'Finished crawling'
                        });
                        console.log('Finished crawling');
                    }
                } else {
                    // No links found on page
                    if (urls.length > 0) {
                        let u = urls[urls.length - 1];
                        run(u);
                    } else {
                        // Nothing left in urls array
                        notifier.notify({
                            title: 'Web-Crawl',
                            message: 'Finished crawling'
                        });
                        console.log('Finished crawling');
                    }
                }
            })
            .catch(error => {
                console.log(error.details + ' - ' + error.message)
            });
    } else {
        notifier.notify({
            title: 'Web-Crawl',
            message: 'Nothing to crawl'
        });
        console.log('Nothing to crawl');
    }
}

function removeFile(rootUrl) {
    fs.remove('./links.txt', err => {
        if (err) return console.log(err);
        run(rootUrl);
    });
}
