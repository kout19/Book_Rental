import mongoose from "mongoose";
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        Trim: true
    },
    author: {
        type: String,
        required: true,
        Trim: true
    },
    description: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: true,
        Trim: true
    },
    ISBN: {
        type: String,
        unique: true,
        sparse: true,
    },
    publishedYear: {
        type: Number,
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
    createdAt: {
        type: Date,
        default: Date.now
    },
},
{timestamps: true}
);
const Book = mongoose.model("Book", bookSchema);
export default Book;