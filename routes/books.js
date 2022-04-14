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
        await book.save();
        res.redirect(`books/${book.id}`);
    } catch (error) {
        renderNewPage(res, book, true);
    }
});

// Show book route
router.get("/:id", async (req, res) => {
    try {
        const foundBook = await Book.findById(req.params.id).populate("author").exec();
        res.render("books/show", { book: foundBook });
    } catch (error) {
        req.redirect("/");
    }
});

// Edit book route
router.get("/:id/edit", async (req, res) => {
    try {
        const foundBook = await Book.findById(req.params.id);
        renderEditPage(res, foundBook);
    } catch (error) {
        res.redirect("/");
    }
});

// Update book route
router.put("/:id", async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;
        if (req.body.cover != null && req.body.cover !== "") {
            saveCover(book, req.body.cover);
        }
        await book.save();
        res.redirect(`/books/${book.id}`);
    } catch (error) {
        if (book != null) {
            renderEditPage(res, book, true);
        }
    }
});

// Delete Book route
router.delete("/:id", async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect("/books");
    } catch (error) {
        if (book != null) {
            res.render("books/show", {
                book: book,
                errorMessage: "Could not remove book",
            });
        } else {
            res.redirect("/");
        }
    }
});

async function renderNewPage(res, newBook, hasError = false) {
    renderFormPage(res, newBook, "new", hasError);
}

async function renderEditPage(res, newBook, hasError = false) {
    renderFormPage(res, newBook, "edit", hasError);
}

async function renderFormPage(res, newBook, form, hasError = false) {
    try {
        const searchedAuthors = await Author.find({});
        const params = {
            authors: searchedAuthors,
            book: newBook,
        };
        if (hasError) {
            if (form === "edit") {
                params.errorMessage = "Error Updating Book";
            } else {
                params.errorMessage = "Error Creating Book";
            }
            // It IS possible to dynamically add a new field to a JS object like this!
        }
        res.render(`books/${form}`, params);
    } catch (error) {
        res.redirect("/books");
        console.error("Error while creating book " + error);
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

module.exports = router;
