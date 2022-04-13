const express = require("express");
const router = express.Router();
const Author = require("../models/author");

// All authors route
router.get("/", async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name !== "") {
        searchOptions.name = new RegExp(req.query.name, "i");
    }
    try {
        const searchedAuthors = await Author.find(searchOptions);
        res.render("authors/index", {
            authors: searchedAuthors,
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
        // res.redirect(`authors/${newAuthor.id}`);
        res.redirect("authors");
        console.log(`Author created: ${newAuthor.name}`);
    } catch (error) {
        const errorText = "Error Creating Author";
        res.render("authors/new", {
            author: author,
            errorMessage: errorText,
        });
        console.error(`[ERROR: ${errorText}] ${error.errors.name.properties.message}`);
    }
});

module.exports = router;
