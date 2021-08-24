const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config.json");
const commands = require("./commands");
const spotify = require("./spotifyService");

client.login(config["discord_token"]);

const servers = {};
spotify.retrieveSpotifyToken(servers)
    .then(() => {
        console.log("Spotify token set.");
        // spotify.getTrackNamesFromSpotifyPlaylist("https://open.spotify.com/playlist/7whao0mclC4HJl8FaeywyJ", servers.accessToken);
    });


client.once("ready", () => {
    console.log(`Logged in as: ${client.user.tag}`);
});

client.on("message", async message => {
    if (message.content.startsWith(config.prefix)) {
        commands.findAndExecuteCommands(message, servers);
    }
});
