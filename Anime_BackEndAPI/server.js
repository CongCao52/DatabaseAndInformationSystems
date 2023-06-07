const express = require('express');
const mysql      = require('mysql');
var cors = require('cors');

const routes = require('./server/route')
const config = require('./server/config.json')

const app = express();

// whitelist localhost 3000
app.use(cors({ credentials: true, origin: ['http://localhost:3000'] }));

// Route 1 - register as GET Home page_default display
app.get('/home', routes.home_display);

// Route 2 - register as GET Home Page- match keyword
app.get('/home/match', routes.home_search);

// Route 3: /search/animes Home Page- filer animes part
// Anime filtering page to filter in and out anime based on specified genre, airing date, episodes range, score, ranked range
app.get('/search/animes', routes.search_animes);

// Route 4: /anime Anime Page that shows detailed information about the anime, which is specified by anime_uid, such as synopsis, airing date, genre, episodes, reviews， user Name. 
app.get('/anime', routes.anime);

// Route 5: /recommendation User Page
// Recommendation page, it shows our anime recommendations based on the user’s current favorite anime information.
app.get('/recommendation', routes.recommendation);

// Round 6: favorite - User favorite list
// it shows the user favorite list with the maximum, minimum and average schedule of each anime
app.get('/favorite', routes.favorite);

app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`);
});

module.exports = app;
