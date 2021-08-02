const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config.json");
const commands = require("./commands");

client.login(config["discord_token"]);

client.once("ready", () => {
    console.log(`Logged in as: ${client.user.tag}`);
});

const voiceState = {
    message: null,
    connection: null,
    dispatcher: null,
};

client.on("message", async message => {
    voiceState.message = message;

    commands.runOnCommand("!play", commands.onPlay, voiceState);

    commands.runOnCommand("!volume", commands.onVolume, voiceState);

    commands.runOnCommand("!pause", commands.onPause, voiceState);

    commands.runOnCommand("!resume", commands.onResume, voiceState);

    commands.runOnCommand("!stop", commands.onStop, voiceState);
});