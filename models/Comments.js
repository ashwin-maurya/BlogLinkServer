
const mongoose = require('mongoose')
const { Schema } = mongoose
const CommentSchema = new mongoose.Schema({

    text: {
        type: String,
    }
    ,


    parentId: {
        type: String,
    },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserDetail'
    },



    Date: {
        default: new Date().getTime() / 1000,
        type: Date

    }




});



module.exports = mongoose.model('Comment', CommentSchema)