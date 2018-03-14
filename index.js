const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true })
const cheerio = require('cheerio');
const chalk = require('chalk');
const fs = require('fs-extra');

let urls = [];
let visitedUrls = [];

let targetUrl = 'https://..........';

function isArray(item) {
    return item.constructor === Array;
}

function extractHostname(url) {
    let hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

function extractRootDomain(url) {
    let domain = extractHostname(url);
    let splitArr = domain.split('.');
    let arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain 
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
            //this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}

function isUsable(href) {
    let rootUrl = extractRootDomain(targetUrl);
    if (href.indexOf('tel:') > -1) {
        return false;
    }
    if (href.indexOf('mailto://') > -1) {
        return false;
    }
    if (href.indexOf('#') > -1) {
        return false;
    }
    if (href.indexOf('@') > -1) {
        return false;
    }
    if (href.indexOf('void(0)') > -1 || href.indexOf('()') > -1 || href.indexOf('javascript:') > -1) {
        return false;
    }
    if ((href.indexOf('https://') > -1 || href.indexOf('http://')) > -1) {
        if (href.indexOf(`www.${rootUrl}`) > -1) {
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
    if (href.indexOf(rootUrl) > -1) {
        return true;
    }
    return true;
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
                            if (l.indexOf('/') === -1 && targetUrl.indexOf('/') !== -1) {
                                x = `${targetUrl}/${l}`;    
                            } else {
                                x = `${targetUrl}${l}`;
                            }                            
                        } else {
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

function updateFile(link) {
    fs.ensureFile('./links.txt', err => {
        if (err) return console.log(err);
        fs.appendFile('./links.txt', link + '\n', err => {
            if (err) return console.log(err);
        });
    });
}

function run(targetUrl) {
    const notifier = require('node-notifier');
    if (isUsable(targetUrl)) {
        if (visitedUrls.indexOf(targetUrl) === -1) {
            visitedUrls.push(targetUrl);
            updateFile(targetUrl);
            console.log(chalk.cyan(`+ `) + targetUrl + chalk.gray(` to `) + chalk.cyan(`visitedUrls `) + `(` + chalk.green(visitedUrls.length) + `)`);
            urls.pop();
            console.log(chalk.yellow(`- `) + targetUrl  + chalk.gray(` from `) + chalk.yellow(`urls `) + `(` + chalk.green(urls.length) + `)`);
        } else {
            console.log('Nothing to do');
        }
        nightmare
            .goto(targetUrl)
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
    } else {
        notifier.notify({
            title: 'Web-Crawl',
            message: 'Nothing to crawl'
        });
        console.log('Nothing to crawl');
    }
}

function removeFile(targetUrl) {
    fs.remove('./links.txt', err => {
        if (err) return console.log(err);
        run(targetUrl);
    });
}


removeFile(targetUrl);