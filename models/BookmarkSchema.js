const mongoose = require('mongoose');

const { Schema } = mongoose
const bookmarkSchema = new mongoose.Schema({

    userId: {
        type: String
    },
    postId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "blogCard"
    }]
    ,
    postIDString:
        { type: Array }



});


module.exports = mongoose.model('Bookmark', bookmarkSchema)