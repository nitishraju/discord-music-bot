const config = require("./config.json");

function splitCommand(commandStr) {
    return commandStr.slice(config.prefix.length).split(" ");
}

module.exports = { splitCommand };