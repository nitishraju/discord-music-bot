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

module.exports = {
    splitCommand,
    getURLsFromYTPlaylist,
};
