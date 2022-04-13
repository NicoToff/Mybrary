const express = require("express");
const router = express.Router();
const Book = require("../models/book");

router.get("/", async (req, res) => {
    let recentBooks;
    try {
        recentBooks = await Book.find().sort({ createdAt: "desc" }).limit(10).exec();
        res.render("index", { books: recentBooks });
    } catch (error) {
        recentBooks = [];
        console.error("Error Finding Books \n" + error);
    }
});

module.exports = router;
