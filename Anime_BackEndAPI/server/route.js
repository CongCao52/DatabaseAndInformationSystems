const config = require('./config.json')
const mysql = require('mysql');
const e = require('express');

// TODO: fill in your connection details here
const connection = mysql.createConnection({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db
});

connection.connect();

// Route 1 (handler) Homepage that displays top 20 anime based on ranked by default. 

async function home_display(req, res) {
    var query_home_display = `Select Title, Episodes, Ranked, Score, Img_url, Link
    From Anime 
    Order BY Anime.Ranked
    Limit 20
    `;
    connection.query(query_home_display, function(error, results, fields) {
        if (error) {
            res.json({error: error})
        } else if (results) {
            res.json({ results: results})
        }
    }); 
}


// Route 2 (handler) Homepage
async function home_search(req, res) {
    // a GET Title, Episodes, Ranked, Score, Img_url, Link
    const keyword = req.query.keyword ? '%' + req.query.keyword + '%' : '%';
    
    
    connection.query(`Select Title, Episodes, Ranked, Score, Img_url, Link
    From Anime 
    Where Title LIKE '${keyword}'
    Order BY Anime.Ranked
    Limit 20`
    , function(error, results, fields) {
        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });
    
}

// Route 3: /search/animes Home page 
// filtering part to filter in and out anime based on specified genre,  episodes range, score, ranked range

async function search_animes (req, res) {
    const episodes_low = (req.query.episodes_low && !isNaN(req.query.episodes_low)) ? req.query.episodes_low : 0;
    const episodes_high = (req.query.episodes_high && !isNaN(req.query.episodes_high)) ? req.query.episodes_high : 1787;
    const popularity_low = (req.query.popularity_low && !isNaN(req.query.popularity_low)) ? req.query.popularity_low: 0;
    const popularity_high = (req.query.popularity_high && !isNaN(req.query.popularity_high)) ? req.query.popularity_high: 10000;
    const score = (req.query.score && !isNaN(req.query.score)) ? req.query.score : 0;
    const rankTop = (req.query.rankTop && !isNaN(req.query.rankTop)) ? req.query.rankTop : 0;
    const rankBottom = (req.query.rankBottom && !isNaN(req.query.rankBottom)) ? req.query.rankBottom : 8299;
    const genre = (req.query.genre) ? '%'+ req.query.genre +'%' : '%';

    var query_filer = `SELECT Title, Episodes, Ranked, Score, Img_url, Link
        FROM Anime Join Genre on Anime.Anime_uid = Genre.Anime_uid
        WHERE Episodes >= ${episodes_low} 
        AND Episodes >= ${episodes_high} 
        AND Popularity >= ${popularity_low}
        AND Popularity <= ${popularity_high}
        AND Score >= ${score}  
        AND Ranked >= ${rankTop} 
        AND Ranked <= ${rankBottom}
        AND Genre Like '${genre}'
        ORDER BY Popularity`;
    
    connection.query(query_filer, function(error, results, fields) {
        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });
     
}

// Route 4: /anime 
// Anime Page that shows detailed information about the anime, which is specified by anime_uid, 
//such as synopsis, airing date, genre, episodes, reviews， user Name. 

async function anime (req, res) {
    var anime_uid = (req.query.anime_uid && !isNaN(req.query.anime_uid)) ? req.query.anime_uid : 1;

    const query_anime = `SELECT Anime.Anime_uid, title, Synopsis, Aired, Episodes,
    Members, Popularity, Ranked, Anime.Score, Img_url, Anime.Link, R.Text, User.Name, R.Link, User.Link
    FROM Anime JOIN Reviews R on Anime.Anime_uid = R.Anime_uid
    JOIN User on R.Name = User.Name
    WHERE Anime.Anime_uid = ${anime_uid}`;

    connection.query(query_anime, function(error, results, fields) {
        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });

}

// Route 5: /recommendation
// Recommendation page, it shows our anime recommendations based on the user’s current favorite anime information.
async function recommendation (req, res) {
    const userName = (req.query.userName) ?'%'+ req.query.userName +'%' : '%';

    const query_recommend = `With Favorite_list
    AS
    (Select F.Anime_uid AS Anime_uid, G.genre AS genre
    From Favorites F JOIN Genre G ON F.Anime_uid = G.Anime_uid
    Where Name LIKE '${userName}')
    Select DISTINCT A.Title, A.Episodes, A.Ranked, A.Score, A.Img_url, A.Link
    From Anime A JOIN Genre G ON A.Anime_uid = G.Anime_uid
    Where G.genre IN (Select DISTINCT genre From Favorite_list) 
    AND
    A.Anime_uid NOT IN (Select DISTINCT Anime_uid From Favorite_list)
    Order BY A.Ranked
    LIMIT 20`;

    connection.query(query_recommend, function(error, results, fields) {
        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });
}

// Round 6: favorite - User favorite list
// it shows the user favorite list with the maximum, minimum and average schedule of each anime

async function favorite (req, res) {
    const userName = (req.query.userName) ?'%'+ req.query.userName +'%' : '%';

    const query_fav = `With Favorite_list
    AS
    (Select F.Anime_uid AS Anime_uid, Title, Episodes, Ranked, Img_url, Anime.Link
    From Favorites F JOIN Anime ON F.Anime_uid = Anime.Anime_uid
    Where Name LIKE '${userName}')
    Select R.anime_uid, Title, Episodes, Ranked, Img_url, Fl.Link,
    ROUND(MIN(R.score),2) AS MinScore,
    ROUND(MAX(R.score),2) AS MaxScore,
    ROUND(AVG(R.score),2) AS AvgScore
    From Reviews R join Favorite_list Fl on R.Anime_uid = Fl.Anime_uid
    Group BY anime_uid
    Order BY Anime_uid ASC`;

    connection.query(query_fav, function(error, results, fields) {
        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });

}

module.exports = {
    home_display,
    home_search, 
    search_animes, 
    anime,
    recommendation,
    favorite
}