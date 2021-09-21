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

function addToQueue(item, server) {
    if (Array.isArray(item)) {
        server.queue = [...server.queue, ...item];
        return;
    }

    server.queue.push(item);
}

async function playQueue(message, server) {
    if (!server.queue[0] || !server.connection) {
        return;
    }

    if (!server.dispatcher || server.dispatcher.paused) {
        server.dispatcher = server.connection.play(ytdl(server.queue[0].url, {filter: "audioonly"}), {volume: 0.7})
            .on("error", () => message.channel.send("Error playing song!"));
        
        server.dispatcher.on("finish", () => {
            server.queue.shift();

            if (server.queue[0]) {
                setTimeout(() => playQueue(message, server), 2 * 1000);
            }
        });  
    }
}

async function onPlay(message, server, spotifyToken) {
    const tokens = utils.splitCommand(message.content);

    if (message.member.voice.channel) {
        const connection = await message.member.voice.channel.join();
        server.connection = connection;

        if (tokens[1].startsWith(constants.YOUTUBE_VIDEO_PREFIX)) {
            let videoId;
            try {
                videoId = ytdl.getURLVideoID(tokens[1]);
            } catch (e) {
                message.channel.send("Invalid video URL.");
            }

            addToQueue(videoId, server);
            playQueue(message, server);
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

            playQueue(message, server);
        } else if (tokens[1].startsWith(constants.SPOTIFY_PLAYLIST_PREFIX)
                || tokens[1].startsWith(constants.SPOTIFY_ALBUM_PREFIX)
                || tokens[1].startsWith(constants.SPOTIFY_TRACK_PREFIX))
        {
            let type;
            if (tokens[1].startsWith(constants.SPOTIFY_ALBUM_PREFIX)) {
                type = "album";
            } else if (tokens[1].startsWith(constants.SPOTIFY_PLAYLIST_PREFIX)) {
                type = "playlist";
            } else if (tokens[1].startsWith(constants.SPOTIFY_TRACK_PREFIX)) {
                type = "track";
            }
            const tracks = await spotify.getTrackNamesFromSpotifyCollection(tokens[1], spotifyToken, type);

            const results = [];
            for await (let trackName of tracks) {
                let url = await utils.getYTUrlFromQuery(trackName);
                results.push(url);
            }
            addToQueue(results, server);
            playQueue(message, server);
        } else if (tokens.length > 1) {
            const queryStr = tokens.slice(1).join(" ");

            const result = await utils.getYTUrlFromQuery(queryStr);

            addToQueue(result, server);
            playQueue(message, server);
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
    if (server.dispatcher && !server.dispatcher.paused) {
        server.dispatcher.pause();
    } else {
        message.channel.send("FAIL: there's nothing playing");
    }
}

async function onResume(message, server) {
    if (server.dispatcher && server.dispatcher.paused) {
        server.dispatcher.resume();
        message.channel.send("resuming");
    } else {
        message.channel.send("FAIL: there's nothing playing");
    }
}

async function onStop(message, server) {
    if (server.dispatcher) {
        server.dispatcher.destroy();
        server.dispatcher = undefined;
    }
    if (server.connection) {
        message.member.voice.channel.leave();
    }
    server.queue = [];
}

async function onSkip(message, server) {
    if (server.dispatcher) {
        server.dispatcher.destroy();
        server.dispatcher = undefined;
        server.queue.shift();
        playQueue(message, server);
    } else {
        message.channel.send("FAIL: there's nothing playing");
    }
}

module.exports = {
    findAndExecuteCommands,
};
