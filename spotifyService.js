const axios = require("axios");

const { 
    spotify_client_id: clientId,
    spotify_client_secret: clientSecret,
} = require("./config.json");

const base64Creds = 
    Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

function retrieveSpotifyToken(servers) {
    const axiosOptions = {
        url: "https://accounts.spotify.com/api/token",
        method: "POST",
        headers: {
            "Authorization": "Basic " + base64Creds,
        },
        params: {
            grant_type: "client_credentials",
        },
    };
    return axios(axiosOptions)
        .then(res => {
            servers.accessToken = res.data["access_token"];
            setTimeout(() => retrieveSpotifyToken(servers), 3500 * 1000);
        })
        .catch(err => console.log(err.stack));
}

function getTrackNamesFromSpotifyPlaylist(playlistUrl, token) {
    const playlistId = playlistUrl.split("/")[4].split("?")[0];

    const axiosOptions = {
        url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    };
    return axios(axiosOptions)
        .then(res => {
            const trackNames = [];
            res.data.items.forEach(trackObj => {
                const trackName = trackObj.track.name;
                const primaryArtist = trackObj.track.artists[0].name;
                trackNames.push(`${primaryArtist} - ${trackName}`);
            });
            return trackNames;
        })
        .catch(err => {
            console.log(err.stack);
            return [];
        });
}

module.exports = {
    retrieveSpotifyToken,
    getTrackNamesFromSpotifyPlaylist,
};
