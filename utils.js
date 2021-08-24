const ytsr = require("ytsr");

const config = require("./config.json");

function splitCommand(commandStr) {
    return commandStr.slice(config.prefix.length).split(" ");
}

function getURLsFromYTPlaylist(ytPlaylist) {
    const items = ytPlaylist.items;
    const urls = [];

    items.forEach(itemObj => {
        urls.push(itemObj.url);
    });
    return urls;
}

async function getYTUrlFromQuery(queryStr) {
    const searchObj = await ytsr(queryStr, { limit: 10 });
    
    const results = searchObj.items;
    while (results[0].type !== "video") {
        results.shift();
    }

    return results[0].url;
}

module.exports = {
    splitCommand,
    getURLsFromYTPlaylist,
    getYTUrlFromQuery,
};
