const Discord = require("discord.js");
const client = new Discord.Client();

const commands = require("./commands");
const spotify = require("./spotifyService");

client.login(process.env.DISCORD_TOKEN);

const servers = {};
spotify.retrieveSpotifyToken(servers)
    .then(() => {
        console.log("Spotify token set.");
    });


client.once("ready", () => {
    console.log(`Logged in as: ${client.user.tag}`);
});

client.on("message", async message => {
    if (message.content.startsWith(process.env.PREFIX)) {
        commands.findAndExecuteCommands(message, servers);
    }
});
