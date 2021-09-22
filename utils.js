// const { MessageEmbed } = require("discord.js");
const ytsr = require("ytsr");

function splitCommand(commandStr) {
    return commandStr.slice(process.env.PREFIX.length).split(" ");
}

// function getEmbedFromVideo(title, url) {
//     return new MessageEmbed()
//         .setColor("#ff0000")
//         .setTitle(title)
//         .setURL(url);
// }

function getURLsFromYTPlaylist(ytPlaylist) {
    const items = ytPlaylist.items;
    const urls = [];

    items.forEach(itemObj => {
        const { title, url } = itemObj;
        urls.push({ title, url });
    });
    return urls;
}

async function getYTUrlFromQuery(queryStr) {
    const searchObj = await ytsr(queryStr, { limit: 10 });
    
    const results = searchObj.items;
    while (results[0].type !== "video") {
        results.shift();
    }

    const { title, url } = results[0];
    return { title, url };
}

module.exports = {
    splitCommand,
    getURLsFromYTPlaylist,
    getYTUrlFromQuery,
};
