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

// a GET route for scraping the science magazine website
// stores scraped articles
var results = [];
router.get("/scrape", function (req, res) {

    // url of site being scraped
    var url = "http://www.sciencemag.org/";

    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);

            // resets results to empty for new scrape
            results = [];

            // grabs every h2 within an article tag
            $("div h2.media__headline").each(function (i, element) {
                // saves an empty result object
                var result = {};

                // adds the text and href of every link, and save them as properties of the result object
                result.title = $(this)
                    .children("a")
                    .text();
                result.link = $(this)
                    .children("a")
                    .attr("href");

                // checks for and excludes blank entries
                if (result.title !== "" && result.link !== "") {
                    results.push(result);
                }

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


// route for getting all Articles from the db
router.get("/articles", function (req, res) {
    // grabs every document in the Articles collection
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

// route for grabbing a specific Article by id, populates it with it's notes
router.get("/articles/:id", function (req, res) {

    db.Article
        .findOne({_id: req.params.id})
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

// route for saving/updating an Article's associated Note
router.post("/articles/:id", function (req, res) {
    // creates a new note and pass the req.body to the entry
    db.Note
        .create(req.body)
        .then(function (dbNote) {
            // updates articles with new notes
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