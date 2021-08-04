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
    axios(axiosOptions)
        .then(res => {
            servers.accessToken = res.data["access_token"];
        })
        .then(() => {
            console.log(servers.accessToken);
            // const axiosOptions = {
            //     url: "https://api.spotify.com/v1/playlists/7zx6dQKciDbBuO501S4gdE/tracks",
            //     method: "GET",
            //     headers: {
            //         "Authorization": "Bearer " + servers.accessToken
            //     }
            // };
            setTimeout(() => retrieveSpotifyToken(servers), 3500 * 1000);
        })
        .catch(err => console.log(err.stack));
        
}

module.exports = {
    retrieveSpotifyToken,
};
