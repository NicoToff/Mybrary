const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Book = require("../models/book");
const Author = require("../models/author");

const uploadPath = path.join("public", Book.coverImageBasePath);
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    },
});

// All books route
router.get("/", async (req, res) => {
    res.send("All books");
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
        res.redirect("books");
    } catch (error) {
        renderNewPage(res, new Book(), true);
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
            params.errorMessage = "Error Creating books";
        }
        res.render("books/new", {
            authors: searchedAuthors,
            book: newBook,
        });
    } catch (error) {
        res.redirect("/books");
        console.error("Error getting book");
    }
}
