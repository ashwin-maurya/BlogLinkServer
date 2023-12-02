const mongoose = require('mongoose');

const { Schema } = mongoose
const likeSchema = new mongoose.Schema({

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


module.exports = mongoose.model('Like', likeSchema)