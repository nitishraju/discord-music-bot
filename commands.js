const ytdl = require("ytdl-core");

function runOnCommand(command, callback, voiceState) {
    if (voiceState.message.content.startsWith(command)) {
        callback(voiceState.message, voiceState);
    }
}

async function onPlay(message, voiceState) {
    const tokens = message.content.split(" ");
        
    if (message.member.voice.channel) {
        if (tokens.length !== 2) {
            message.channel.send("provide a full and correct YouTube URL");
            return;
        }

        if (tokens[1].startsWith("https://www.youtube.com/watch?v=")) {
            voiceState.connection = await message.member.voice.channel.join();
            voiceState.dispatcher = voiceState.connection.play(ytdl(tokens[1], {filter: "audioonly"}), {volume: 0.5,})
                .on("error", () => {
                    message.channel.send("error playing that song");
                });
        } else {
            message.channel.send("provide a full and correct YouTube URL");
        }
    } else {
        message.channel.send("join a voice channel first dumbass");
    }
}

async function onVolume(message, voiceState) {
    const tokens = message.content.split(" ");
    if (tokens.length !== 2) {
        message.channel.send("enter a volume between 0 and 150 after the command (e.g. !volume 50)");
        return;
    }

    const volume = Number(tokens[1]);
    if (!isNaN(Number(volume) && Number.isInteger(volume))) {
        if (voiceState.dispatcher !== null) {
            voiceState.dispatcher.setVolume(volume / 100);
        } else {
            message.channel.send("there's nothing playing");
        }
    }
}

async function onPause(message, voiceState) {
    if (voiceState.dispatcher !== null) {
        voiceState.dispatcher.pause();
    } else {
        message.channel.send("there's nothing playing");
    }
}

async function onResume(message, voiceState) {
    message.channel.send("resuming");
    if (voiceState.dispatcher !== null) {
        voiceState.dispatcher.resume();
        message.channel.send("resumed");
    } else {
        message.channel.send("there's nothing playing");
    }
}

async function onStop(message, voiceState) {
    if (voiceState.dispatcher !== null) {
        voiceState.dispatcher.destroy();
        message.member.voice.channel.leave();
    }
}

module.exports = { 
    runOnCommand, 
    onPlay, 
    onVolume, 
    onPause,
    onResume,
    onStop,
};