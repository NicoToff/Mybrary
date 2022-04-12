const express = require("express");
const author = require("../models/author");
const router = express.Router();
const Author = require("../models/author");

// All authors route
router.get("/", async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name !== "") {
        searchOptions.name = new RegExp(req.query.name, "i");
    }
    try {
        const allAuthors = await Author.find(searchOptions);
        res.render("authors/index", {
            authors: allAuthors,
            searchOptions: req.query,
        });
    } catch (error) {
        res.redirect("/");
        console.error("Couldn't fetch authors");
    }
});

// New author route
router.get("/new", (req, res) => {
    res.render("authors/new", { author: new Author() });
});

// Create author route
router.post("/", async (req, res) => {
    const author = new Author({
        name: req.body.name,
    });

    try {
        const newAuthor = await author.save();
        //    res.redirect(`authors/${newAthor.id}`);
        res.redirect("authors");
    } catch (error) {
        res.render("authors/new", {
            author: author,
            errorMessage: "Error creating author",
        });
    }
});

module.exports = router;
