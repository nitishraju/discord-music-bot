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

function getTrackNamesFromSpotifyCollection(playlistUrl, token, type) {
    const collectionId = playlistUrl.split("/")[4].split("?")[0];

    const trackUrls = {
        "album": `https://api.spotify.com/v1/albums/${collectionId}/tracks`,
        "playlist": `https://api.spotify.com/v1/playlists/${collectionId}/tracks`,
        "track": `https://api.spotify.com/v1/tracks/${collectionId}`
    };

    if (!trackUrls[type]) {
        return [];
    }

    const axiosOptions = {
        url: trackUrls[type.toLowerCase()],
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    };
    return axios(axiosOptions)
        .then(res => {
            const trackNames = [];
            const items = 
                Object.prototype.hasOwnProperty.call(res.data, "items") 
                    ? res.data.items 
                    : [res.data];

            items.forEach(trackObj => {
                let trackName;
                let primaryArtist; 
                if (Object.prototype.hasOwnProperty.call(trackObj, "track")) {
                    trackName = trackObj.track.name;
                    primaryArtist = trackObj.track.artists[0].name;
                } else {
                    trackName = trackObj.name;
                    primaryArtist = trackObj.artists[0].name;
                }

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
    getTrackNamesFromSpotifyCollection,
};
