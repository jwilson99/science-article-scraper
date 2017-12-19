var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");


var PORT = 3000;

// Initialize Express
var app = express();
var router = express.Router();

// Configure middleware

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/scienceScraper", {
    useMongoClient: true
});

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Routes
// Import routes and give the server access to them.
var routes = require("./controller/routes.js");

app.use("/", routes);


// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
