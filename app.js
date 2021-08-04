const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config.json");
const commands = require("./commands");
const spotify = require("./spotifyService");

client.login(config["discord_token"]);

const servers = {};
spotify.retrieveSpotifyToken(servers);
console.log("Spotify token set.");

client.once("ready", () => {
    console.log(`Logged in as: ${client.user.tag}`);
});

client.on("message", async message => {
    if (message.content.startsWith(config.prefix)) {
        commands.findAndExecuteCommands(message, servers);
    }
});
