const mongoose = require("mongoose");
const path = require("path");

const coverImageBasePath = "upload/bookCovers";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    publishDate: {
        type: Date,
        required: true,
    },
    pageCount: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    coverImageName: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Author",
    },
});

bookSchema.virtual("coverImagePath").get(function () {
    let coverImageName = this.coverImageName;
    if (coverImageName != null) {
        const thePath = path.join("/", coverImageBasePath, coverImageName);
        //    console.log(thePath);
        return thePath;
    }
});

module.exports = mongoose.model("Book", bookSchema);
module.exports.coverImageBasePath = coverImageBasePath;
