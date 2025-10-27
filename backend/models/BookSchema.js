import mongoose from "mongoose";
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    ISBN: {
        type: String,
        unique: true,
        sparse: true,
    },
    publishedYear: {
        type: Number,
    },
    rentPrice: {
        type: Number,
        required: true,
        default: 0
    },
    image: {
        type: String,
        default: null
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rentedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        enum: ['available', 'rented', 'reserved'],  
        default: 'available'
    },
    available:{
        type:Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
},
{timestamps: true}
);
const Book = mongoose.model("Book", bookSchema);
export default Book;