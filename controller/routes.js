var express = require("express");
var router = express.Router();

// Require all models
var db = require("../models");
// Our scraping tools
var request = require("request-promise-native");
var cheerio = require("cheerio");

// routes
// A GET route for scraping the echojs website
var results = [];
router.get("/scrape", function (req, res) {

    var url = "http://www.echojs.com/";

    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            // Now, we grab every h2 within an article tag, and do the following:

            $("article h2").each(function (i, element) {
                // Save an empty result object
                var result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(this)
                    .children("a")
                    .text();
                result.link = $(this)
                    .children("a")
                    .attr("href");

                // Create a new Article using the `result` object built from scraping
                // db.Article
                //     .create(result)
                //     .then(function (dbArticle) {
                //         // If we were able to successfully scrape and save an Article, send a message to the client
                //         console.log("Scrape complete");
                //     })
                //     .catch(function (err) {
                //         // If an error occurred, send it to the client
                //         console.log(err);
                //     });

                results.push(result);
            })
        }
        else {
            console.log("Unable to request data from " + url);
        }
    }).then(function(){
        var scrapeObject = {
            scrapedArticles: results
        };
        console.log(scrapeObject);
        res.render("scrape", scrapeObject);
    });
});

// router.get("/", function (req, res) {
//     db.Article
//         .find({})
//         .then(function (dbArticle) {
//             // If we were able to successfully find Articles, send them back to the client
//             var hbsObject = {
//                 articles: dbArticle
//             };
//             console.log(hbsObject);
//             res.render("index", hbsObject);
//         })
//         .catch(function (err) {
//             // If an error occurred, send it to the client
//             res.json(err);
//         });
//
// });

// Route for getting all Articles from the db
router.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article
        .find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            var hbsObject = {
                articles: dbArticle
            };
            console.log(hbsObject);
            res.render("index", hbsObject);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article
        .findOne({_id: req.params.id})
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
            console.log(dbArticle.note);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note
        .create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({_id: req.params.id}, {$addToSet: {note: dbNote._id}}, {new: true});
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
router.post("/scrape/:title", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Article
        .create(req.body)
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

router.post("/scrape/:id", function(req, res) {
   db.Article
       .
});

// Export routes for server.js to use.
module.exports = router;