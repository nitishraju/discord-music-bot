const ytdl = require("ytdl-core");

const utils = require("./utils");

const constants = {
    YOUTUBE_VIDEO_PREFIX: "https://www.youtube.com/watch?v=",
    YOUTUBE_PLAYLIST_PREFIX: "https://www.youtube.com/playlist?list=",
    SPOTIFY_TRACK_PREFIX: "https://open.spotify.com/track/",
    SPOTIFY_ALBUM_PREFIX: "https://open.spotify.com/album/",
    SPOTIFY_PLAYLIST_PREFIX: "https://open.spotify.com/playlist/",
};

async function findAndExecuteCommands(message, servers) {
    const command = utils.splitCommand(message.content)[0];

    switch(command.toLowerCase()) {
    case "play":
        onPlay(message, servers);
        break;

    case "volume":
        onVolume();
        break;
    
    case "pause":
        onPause();
        break;
    
    case "resume":
        onResume();
        break;
    
    case "stop":
        onStop();
        break;
    
    default:
        break;
    }
}

async function onPlay(message, servers) { 
    const tokens = utils.splitCommand(message.content);    

    const server = servers[message.guild.id];

    if (message.member.voice.channel) {
        if (tokens.length !== 2) {
            message.channel.send("EPIC FAIL: provide a full and correct YouTube URL");
            return;
        }

        const connection = await message.member.voice.channel.join();

        if (tokens[1].startsWith(constants.YOUTUBE_VIDEO_PREFIX)) {
            server.dispatcher = connection.play(ytdl(tokens[1], {filter: "audioonly"}), {volume: 0.5,})
                .on("error", () => {
                    message.channel.send("EPIC FAIL: error playing that song");
                });
        } else if (tokens[1].startsWith()) {

        } else {
            message.channel.send("EPIC FAIL: provide a full and correct YouTube URL");
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
            message.channel.send("EPIC FAIL: there's nothing playing");
        }
    }
}

async function onPause(message, voiceState) {
    if (!voiceState.dispatcher.paused) {
        voiceState.dispatcher.pause();
    } else {
        message.channel.send("EPIC FAIL: there's nothing playing");
    }
}

async function onResume(message, voiceState) {
    message.channel.send("resuming");
    if (voiceState.dispatcher.paused) {
        voiceState.dispatcher.resume();
    } else {
        message.channel.send("EPIC FAIL: there's nothing playing");
    }
}

async function onStop(message, voiceState) {
    if (voiceState.dispatcher !== null) {
        voiceState.dispatcher.destroy();
        message.member.voice.channel.leave();
    }
}

module.exports = { 
    findAndExecuteCommands, 
    onPlay, 
    onVolume, 
    onPause,
    onResume,
    onStop,
};