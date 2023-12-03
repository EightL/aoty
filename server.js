require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const btoa = require('btoa');
const open = require('open');

const app = express();
const client_id = process.env.SPOTIFY_CLIENT_ID; // Set as environment variable
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Set as environment variable
const redirect_uri = 'http://localhost:5500/callback'; // Your redirect URI

app.get('/login', (req, res) => {
    const scopes = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + client_id +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(redirect_uri));
});

app.get('/callback', async (req, res) => {
    const code = req.query.code || null;

    if (code) {
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
                },
                body: new URLSearchParams({
                    code: code,
                    redirect_uri: redirect_uri,
                    grant_type: 'authorization_code'
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const accessToken = data.access_token;
            // Here you should handle the access token securely
            // For now, we redirect to the homepage with the token for demonstration
            res.redirect(`/?access_token=${accessToken}`);
        } catch (error) {
            console.error('Error during token exchange:', error);
            res.status(500).send('Authentication error.');
        }
    } else {
        res.redirect('/?error=access_denied');
    }
});

app.use(express.static('public'));

app.listen(5500, () => {
    console.log('Server started on http://localhost:5500');
    // open('http://localhost:5500/login'); // Commented out for security
});
