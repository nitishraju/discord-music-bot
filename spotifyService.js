const axios = require("axios");

const { 
    spotify_client_id: clientId,
    spotify_client_secret: clientSecret,
} = require("./config.json");

let accessToken;

const base64Creds = 
    Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

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
        accessToken = res.data["access_token"];
    })
    .catch(err => console.log(err.stack))
    .then(() => {
        console.log(accessToken);
        if (accessToken) {
            const axiosOptions = {
                url: "https://api.spotify.com/v1/playlists/7zx6dQKciDbBuO501S4gdE/tracks",
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + accessToken
                }
            };
            axios(axiosOptions)
                .then(res => console.log(res.data))
                .catch(err => console.log(err.stack));
        }
    });
