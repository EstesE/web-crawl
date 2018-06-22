const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: false })
const cheerio = require('cheerio');
const chalk = require('chalk');
const fs = require('fs-extra');
const { URL } = require('url');
const psl = require('psl');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/lyrics');

const Song = mongoose.model('Song', {
    artist: String,
    title: String,
    lyrics: String
});

let urls = [];
let visitedUrls = [];

let targetUrl = 'https://lyrics.wikia.com/wiki/LyricWiki';
let rootUrl = new URL(targetUrl);
rootUrl.psl = psl.parse(rootUrl.hostname);
if (rootUrl.psl.error) {
    console.log(rootUrl.psl.error.message);
} else {
    removeFile(rootUrl);
}

function isUsable(href) {
    // debugger;
    if (typeof href === 'object') {
        if (href.host.indexOf('lyrics.wikia.com') > -1) {
            return true;
        }
        return false;
        // return true;
    } else if (typeof href === 'string') {
        if (href.indexOf('tel:') > -1) { return false };
        if (href.indexOf('mailto://') > -1) { return false };
        if (href.indexOf('@') > -1) { return false; }
        // if (href.indexOf('#') > -1) { return false; }
        if (href === '#') {
            return false;
        }
        if (href.indexOf('void(0)') > -1 || href.indexOf('()') > -1 || href.indexOf('javascript:') > -1) { return false; }
        
        // if (href.indexOf('lyrics.wikia.com') === -1) {
        //     return false;
        // }
        if (href.indexOf('diff=') > -1) {
            return false;
        }
        if (href.indexOf('register') > -1) {
            return false;
        }
        if (href.indexOf('signin') > -1) {
            return false;
        }
        if (href.indexOf('Special:') > -1) {
            return false;
        }
        if (href.indexOf('Talk:') > -1) {
            return false;
        }
        if (href.indexOf('.jpg') > -1) {
            return false;
        }
        if (href.indexOf('User:') > -1) {
            return false;
        }
        if (href.indexOf('User_blog:') > -1) {
            return false;
        }
        if (href.indexOf('action=') > -1) {
            return false;
        }
        if (href.indexOf('lyrics.wikia.com/wiki/LyricWiki/lyrics.wikia.com') > -1) {
            return false;
        }
        if (href.indexOf('//fandom.wikia.com') > -1) {
            return false;
        }
        if (href.indexOf('//community.wikia.com') > -1) {
            return false;
        }
        if (href.indexOf('/wiki/') === -1) {
            return false;
        }
        if (href.indexOf('//bighero6') > -1) {
            return false;
        }
        if (href.indexOf('//cloverfield') > -1) {
            return false;
        }
        if (href.indexOf('//tardis') > -1) {
            return false;
        }
        if (href.indexOf('//projectsalt.') > -1) {
            return false;
        }
        if (href.indexOf('//wowsb.') > -1) {
            return false;
        }
        if (href.indexOf('//studio-ghibli.') > -1) {
            return false;
        }
        if (href.indexOf('//gineipaedia.') > -1) {
            return false;
        }
        if (href.indexOf('//anime.') > -1) {
            return false;
        }
        if (href.indexOf('//en.wikipedia') > -1) {
            return false;
        }
        if (href.indexOf('//.ghibli.') > -1) {
            return false;
        }
        if (href.indexOf('.studioghibli.') > -1) {
            return false;
        }
        if (href.indexOf('//megaman.') > -1) {
            return false;
        }
        if (href.indexOf('//pact-web-serial.') > -1) {
            return false;
        }
        if (href.indexOf('//worm.') > -1) {
            return false;
        }
        if (href.indexOf('//onepunchman.') > -1) {
            return false;
        }
        if (href.indexOf('//kingdomhearts.') > -1) {
            return false;
        }
        if (href.indexOf('User_talk:') > -1) {
            return false;
        }
        if (href.indexOf('Category_talk:') > -1) {
            return false;
        }
        if (href.indexOf('Template_talk:') > -1) {
            return false;
        }
        if (href.indexOf('Template:Deletion') > -1) {
            return false;
        }
        if (href.indexOf('Template:Stub') > -1) {
            return false;
        }
        if (href.indexOf('Template:Split') > -1) {
            return false;
        }
        if (href.indexOf('Template:Instrumental') > -1) {
            return false;
        }
        if (href.indexOf('Template:Partial') > -1) {
            return false;
        }
        if (href.indexOf('Category:Label') > -1) {
            return false;
        }
        if (href.indexOf('Category:Templates') > -1) {
            return false;
        }
        if (href.indexOf('Category:Split') > -1) {
            return false;
        }
        if (href.indexOf('Help:Contents') > -1) {
            return false;
        }
        if (href.indexOf('miitopia-fanon.') > -1) {
            return false;
        }
        if (href.indexOf('Miitopia_Fanon_Wiki:') > -1) {
            return false;
        }
        if (href.indexOf('Category:') > -1) {
            return false;
        }
        if (href.indexOf('File:') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_De') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_El') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_Es') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_Fi') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_Fr') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_It') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_Ja') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_Ko') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_Nl') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_No') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_Pl') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_Pt') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_Ru') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_Sv') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_Tl') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_Tr') > -1) {
            return false;
        }
        if (href.indexOf('Main_Page_Zh') > -1) {
            return false;
        }
        // Breakers?
        if (href.indexOf('?direction=') > -1) {
            return false;
        }
        if (href.indexOf('?oldid=') > -1) {
            return false;
        }
        
        if ((href.indexOf('lyrics.wikia.com') === -1 && (href.indexOf('https://') === -1 || href.indexOf('http://') === -1))) {
            if (href.indexOf('/wiki/') > -1) {
                if (href.indexOf('//') === -1) {
                    href = 'https://lyrics.wikia.com' + href;
                }
                if (href.indexOf('https://') === -1 && href.indexOf('http://') === -1) {
                    href = 'https:' + href;
                }
            }
            // debugger; // good
            // href = 'https://' + href;
            // console.log('hmm');
        } else if ((href.indexOf('lyrics.wikia.com') > -1 && (href.indexOf('https://' === -1) || href.indexOf('http://') === -1))) {
            // debugger; // bad ???
            // href = 'https:' + href; // This one
        }
        if ((href.indexOf('https:') === -1 && href.indexOf('http:')) === -1) {
            href = 'https:' + href;
        //     if (href.indexOf(`www.${rootUrl.psl.domain}`) > -1 || href.indexOf(rootUrl.psl.domain) > -1) {
        //         if (href.indexOf(`.${rootUrl.psl.domain}`) > -1) {// && href.indexOf(`www.${rootUrl.psl.domain}`) === -1) {
        //             return true;
        //         }
        //         return true;
        //     }
        //     return false;
            return true;
        }

        // if (href.indexOf('//') > -1) {
        //     return false;
        // }
        
        // if (href.indexOf(rootUrl) > -1) {
        //     return true;
        // }
        return true;
    } else {
        // debugger; // Undefined
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
        // links.each(function(index) {
        //     console.log(this.attribs.href);
        // });
        // let href = $(link).attr('href');
        // debugger;
        // console.log('old: ' + $(link).attr('href'));
        // console.log('new: ' + link.attribs.href);
        let href = link.attribs.href;
        // console.log('isUsable: ' + isUsable(href));
        if (href) {
            if (isUsable(href)) {
                // debugger;
                if (urls.indexOf(targetUrl + $(link).attr('href')) === -1) {
                    let l = $(link).attr('href');
                    let x = '';
                    if (typeof l !== 'undefined') {
                        if (l.indexOf('https://') === -1 && l.indexOf('http://') === -1) {
                            if (l !== '/') {
                                // x = rootUrl.href + l.replace('/', '');
                                // debugger;
                                if (l.indexOf('//lyrics.wikia.com') > -1) {
                                    // debugger;
                                    x = 'https:' + l;
                                } else {
                                    // debugger;
                                    x = rootUrl.href.replace('/wiki/LyricWiki', '') + l;
                                }
                                // x = 'https:' + l;
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
        }/* else {
            debugger;
        }*/
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
            // debugger;
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
            .wait(1)
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
                var lyrics = $('.lyricbox');
                if (lyrics.length > 0) {
                    // console.log('**** ' + lyrics);
                    var title = $('.page-header__title');
                    if (title.length > 0) {
                        // console.log('**** ' + title);
                        var title_parts = title[0].children[0].data.split(':');
                        console.log(`Artist: ${title_parts[0]}`);
                        console.log(`Song: ${title_parts[1].replace(' Lyrics', '')}`);
                        console.log(`Lyrics: ${lyrics.eq(0).clone().html()}`);
                        // debugger;
                        let mySong = new Song({
                            artist: title_parts[0],
                            title: title_parts[1].replace('Lyrics', '').trim(),
                            lyrics: lyrics.eq(0).clone().html().replace('<div class="lyricsbreak"></div>', '')
                        });
                        
                        Song.find({ 'artist': mySong.artist, 'title': mySong.title }, function(err, docs) {
                            // debugger;
                            if (err) {
                                debugger;
                            }
                            // if (mySong.lyrics.indexOf('<span ') === -1) {
                            if (mySong.lyrics.indexOf('Unfortunately, we are not licensed') === -1) {
                                if (docs.length === 0) {
                                    mySong.save().then(() => {
                                        console.log('saved');
                                    });
                                } else {
                                    // debugger;
                                }
                            }
                        });
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
