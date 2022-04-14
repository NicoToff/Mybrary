const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
const imageMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

// All books route
router.get("/", async (req, res) => {
    let query = Book.find();
    const inputTitle = req.query.title;
    const inputPublishedBefore = req.query.publishedBefore; // These are strings :-o
    const inputPublishedAfter = req.query.publishedAfter;
    if (inputTitle != null && inputTitle !== "") {
        query = query.regex("title", new RegExp(inputTitle, "i"));
    }
    if (inputPublishedBefore != null && inputPublishedBefore !== "") {
        query = query.lte("publishDate", inputPublishedBefore);
    }
    if (inputPublishedAfter != null && inputPublishedAfter !== "") {
        query = query.gte("publishDate", inputPublishedAfter);
    }
    try {
        const searchedBooks = await query.exec();
        res.render("books/index", {
            books: searchedBooks,
            searchOptions: req.query,
        });
    } catch (error) {
        res.redirect("/");
    }
});

// New book route
router.get("/new", async (req, res) => {
    renderNewPage(res, new Book());
});

// Create book route
router.post("/", async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    });
    saveCover(book, req.body.cover);
    try {
        const newBook = await book.save();

        // res.redirect(`authors/${newBook.id}`);
        res.redirect("/books");
    } catch (error) {
        renderNewPage(res, book, true);
    }
});

module.exports = router;

async function renderNewPage(res, newBook, hasError = false) {
    try {
        const searchedAuthors = await Author.find({});
        const params = {
            authors: searchedAuthors,
            book: newBook,
        };
        if (hasError) {
            params.errorMessage = "Error Creating Book";
            // It IS possible to dynamically add a new field to a JS object like this!
        }
        res.render("books/new", params);
    } catch (error) {
        res.redirect("/books");
        console.error("Error while creating book");
    }
}

// See this JSON : https://pqina.nl/filepond/docs/api/plugins/file-encode/
function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return;
    const cover = JSON.parse(coverEncoded);
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, "base64");
        book.coverImageType = cover.type;
    }
}
