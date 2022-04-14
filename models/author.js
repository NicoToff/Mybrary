const mongoose = require("mongoose");
const Book = require("./book");
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});

// "pre()" runs before a certain action
authorSchema.pre("remove", function (callback) {
    Book.find({ author: this.id }, (err, books) => {
        if (err) {
            callback(err); // Mongoose error; shouldn't happen, but still
        } else if (books.length > 0) {
            callback(new Error("This author has books still!")); // New Error
        } else {
            callback(); // All OK
        }
    });
});

module.exports = mongoose.model("Author", authorSchema);
