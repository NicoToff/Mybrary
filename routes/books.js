const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Book = require("../models/book");
const Author = require("../models/author");

const uploadPath = path.join("public", Book.coverImageBasePath);
const imageMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    },
});

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
router.post("/", upload.single("cover"), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description,
    });

    try {
        const newBook = await book.save();

        // res.redirect(`authors/${newBook.id}`);
        res.redirect("/books");
    } catch (error) {
        //   console.log(error);
        if (book.coverImageName != null) removeBookCover(book.coverImageName);
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

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err);
    });
}
