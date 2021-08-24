const ytdl = require("ytdl-core");
const ytpl = require("ytpl");


const utils = require("./utils");
const spotify = require("./spotifyService");

const constants = {
    YOUTUBE_VIDEO_PREFIX: "https://www.youtube.com/watch?v=",
    YOUTUBE_PLAYLIST_PREFIX: "https://www.youtube.com/playlist?list=",
    SPOTIFY_TRACK_PREFIX: "https://open.spotify.com/track/",
    SPOTIFY_ALBUM_PREFIX: "https://open.spotify.com/album/",
    SPOTIFY_PLAYLIST_PREFIX: "https://open.spotify.com/playlist/",
};

async function findAndExecuteCommands(message, servers) {
    if (!servers[message.guild.id]) {
        servers[message.guild.id] = { queue: [] };
    }
    const server = servers[message.guild.id];

    const command = utils.splitCommand(message.content)[0];
    switch(command.toLowerCase()) {
    case "play":
        onPlay(message, server, servers.accessToken);
        break;

    case "vol":
    case "volume":
        onVolume(message, server);
        break;
    
    case "pause":
        onPause(message, server);
        break;
    
    case "resume":
        onResume(message, server);
        break;
    
    case "stop":
        onStop(message, server);
        break;
    
    case "skip":
        onSkip(message, server);
        break;
    
    default:
        break;
    }
}

async function onPlay(message, server, spotifyToken) {
    function addToQueue(item) {
        if (Array.isArray(item)) {
            server.queue = [...server.queue, ...item];
        }

        if (typeof item === "string") {
            server.queue.push(item);
        }
    }

    async function playQueue(connection) {
        server.dispatcher = connection.play(ytdl(server.queue[0], {filter: "audioonly"}), {volume: 0.7})
            .on("error", () => message.channel.send("Error playing song!"));
        
        server.dispatcher.on("finish", () => {
            server.queue.shift();

            if (server.queue[0]) {
                setTimeout(() => playQueue(connection), 3000);
            }
        });
    }

    const tokens = utils.splitCommand(message.content);

    if (message.member.voice.channel) {
        const connection = await message.member.voice.channel.join();

        if (tokens[1].startsWith(constants.YOUTUBE_VIDEO_PREFIX)) {
            let videoId;
            try {
                videoId = ytdl.getURLVideoID(tokens[1]);
            } catch (e) {
                message.channel.send("Invalid video URL.");
            }

            addToQueue(videoId);
            playQueue(connection);
        } else if (tokens[1].startsWith(constants.YOUTUBE_PLAYLIST_PREFIX)) {
            let playlistId;
            try {
                playlistId = await ytpl.getPlaylistID(tokens[1]);
            } catch (e) {
                message.channel.send("Invalid Playlist URL.");
                return;
            }
            const playlist = await ytpl(playlistId, { pages: 1 });
            server.queue = [...server.queue, ...utils.getURLsFromYTPlaylist(playlist)];

            playQueue(connection);
        } else if (tokens[1].startsWith(constants.SPOTIFY_PLAYLIST_PREFIX)) {
            const tracks = await spotify.getTrackNamesFromSpotifyPlaylist(tokens[1], spotifyToken);

            const results = [];
            for await (let trackName of tracks) {
                let url = await utils.getYTUrlFromQuery(trackName);
                results.push(url);
            }
            console.log("results", results);
            addToQueue(results);
            playQueue(connection);
        } else if (tokens.length > 1) {
            const queryStr = tokens.slice(1).join(" ");

            const result = await utils.getYTUrlFromQuery(queryStr);

            addToQueue(result);
            playQueue(connection);
        } else {
            message.channel.send("FAIL: provide a full and correct YouTube URL");
        }
    } else {
        message.channel.send("Join a voice channel first!");
    }
}

async function onVolume(message, server) {
    const tokens = message.content.split(" ");
    if (tokens.length !== 2) {
        message.channel.send("enter a volume between 0 and 150 after the command (e.g. !volume 50)");
        return;
    }

    const volume = Number(tokens[1]);
    if (!isNaN(Number(volume) && Number.isInteger(volume))) {
        if (server.dispatcher) {
            server.dispatcher.setVolume(volume / 100);
        } else {
            message.channel.send("FAIL: there's nothing playing");
        }
    }
}

async function onPause(message, server) {
    if (!server.dispatcher.paused) {
        server.dispatcher.pause();
    } else {
        message.channel.send("FAIL: there's nothing playing");
    }
}

async function onResume(message, server) {
    message.channel.send("resuming");
    if (server.dispatcher.paused) {
        server.dispatcher.resume();
    } else {
        message.channel.send("FAIL: there's nothing playing");
    }
}

async function onStop(message, server) {
    if (server.dispatcher) {
        server.dispatcher.destroy();
        message.member.voice.channel.leave();
        server.queue = [];
    }
}

async function onSkip(message, server) {
    if (server.dispatcher) {
        server.dispatcher.destroy();
    }
}

module.exports = { 
    findAndExecuteCommands,
};
