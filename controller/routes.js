var express = require("express");
var router = express.Router();

// Require all models
var db = require("../models");
// Our scraping tools
var request = require("request-promise-native");
var cheerio = require("cheerio");

// routes
router.get("/", function (req, res) {
    var scrapeObject = {
        scrapedArticles: results
    };
    console.log(scrapeObject);
    res.render("scrape", scrapeObject);
});

// A GET route for scraping the echojs website
// stores scraped articles
var results = [];
router.get("/scrape", function (req, res) {

    // url of site being scraped
    var url = "http://www.echojs.com/";

    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            // Now, we grab every h2 within an article tag, and do the following:

            results = [];

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

                results.push(result);
            })
        }
        else {
            console.log("Unable to request data from " + url);
        }
    })
        .then(function () {
            var scrapeObject = {
                scrapedArticles: results
            };
            console.log(scrapeObject);
            res.render("scrape", scrapeObject);
        })
        .catch(function (err) {
            // if an error occurred, it is sent to the client
            res.json(err);
        });
});


// Route for getting all Articles from the db
router.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article
        .find({})
        .then(function (dbArticle) {
            // if Article is successfully updated, it is sent back to the client
            var hbsObject = {
                articles: dbArticle
            };
            console.log(hbsObject);
            res.render("index", hbsObject);
        })
        .catch(function (err) {
            // if an error occurred, it is sent to the client
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
            // if Article is successfully updated, it is sent back to the client
            res.json(dbArticle);
            console.log(dbArticle.note);
        })
        .catch(function (err) {
            // if an error occurred, it is sent to the client
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
            // if Article is successfully updated, it is sent back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // if an error occurred, it is sent to the client
            res.json(err);
        });
});

// route for saving/updating an Articles associated Note
router.post("/scrape/:title", function (req, res) {
    // creates a new note and pass the req.body to the entry
    db.Article
        .create(req.body)
        .then(function (dbArticle) {
            // if Article is successfully updated, it is sent back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // if an error occurred, it is sent to the client
            res.json(err);
        });
});

// deletes saved articles by id
router.post("/delete/:id", function (req, res) {
    db.Article
        .remove({"_id": req.params.id})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// deletes notes and instances in associated articles
router.post("/note/delete/:id", function(req, res){
    db.Note
        .remove({"_id":req.params.id})
        .then(function(dbNote){
            res.json(dbNote);
            return db.Article.findOneAndUpdate({_id: req.params.id}, { $pull: {note: {$in: [req.params.id]}}}, {new: true});
        })
        .catch(function(err){
            res.json(err);
        });
});

// exports routes for server.js to use
module.exports = router;