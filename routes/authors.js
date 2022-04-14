const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");

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
        res.redirect(`authors/${newAuthor.id}`);
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

// :ID SECTION ---------------------------------- NEEDS TO BE AT THE BOTTOM OF OTHER ROUTES -------------------------
// Show Author page
router.get("/:id", async (req, res) => {
    try {
        const foundAuthor = await Author.findById(req.params.id);
        const foundBooks = await Book.find({ author: foundAuthor.id }).limit(6).exec();
        res.render("authors/show", {
            author: foundAuthor,
            booksByAuthor: foundBooks,
        });
    } catch (error) {
        console.error(error);
        res.redirect("/");
    }
});

// Edit Author route
router.get("/:id/edit", async (req, res) => {
    try {
        const editAuthor = await Author.findById(req.params.id);
        res.render("authors/edit", { author: editAuthor });
    } catch (error) {
        res.redirect("/authors");
    }
});

// Update Author route
router.put("/:id", async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
        res.redirect(`/authors/${author.id}`);
        console.log(`Author updated: ${author.name}`);
    } catch (error) {
        if (author == null) {
            res.redirect("/");
        } else {
            const errorText = "Error Updating Author";
            res.render("authors/new", {
                author: author,
                errorMessage: errorText,
            });
            console.error(`[ERROR: ${errorText}] ${error.errors.name.properties.message}`);
        }
    }
});

router.delete("/:id", async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        const authorName = author.name;
        await author.remove();
        res.redirect(`/authors`);
        console.log(`Author Deleted: ${authorName}`);
    } catch (error) {
        if (author == null) {
            res.redirect("/");
        } else {
            const errorText = "Error Deleting Author";
            res.redirect(`/authors/${author.id}`);
            console.error(`[ERROR: ${errorText}] ${error}`);
        }
    }
});

module.exports = router;
