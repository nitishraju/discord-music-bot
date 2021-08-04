const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config.json");
const commands = require("./commands");

client.login(config["discord_token"]);

const servers = {};

client.once("ready", () => {
    console.log(`Logged in as: ${client.user.tag}`);
});

client.on("message", async message => {
    if (message.content.startsWith(config.prefix)) {
        commands.findAndExecuteCommands(message, servers);
    }
});