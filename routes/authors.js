const express = require("express");
const author = require("../models/author");
const router = express.Router();
const Author = require("../models/author");

// All authors route
router.get("/", (req, res) => {
    res.render("authors/index");
});

// New author route
router.get("/new", (req, res) => {
    res.render("authors/new", { author: new Author() });
});

// Create author route
router.post("/", (req, res) => {
    const author = new Author({
        name: req.body.name,
    });
    author.save((err, newAthor) => {
        if (err) {
            res.render("authors/new", {
                author: author,
                error: "Error creating author",
            });
        } else {
            //    res.redirect(`authors/${newAthor.id}`);
            res.redirect(`authors`);
        }
    });
});

module.exports = router;
