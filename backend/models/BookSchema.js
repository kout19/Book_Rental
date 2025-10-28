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
    // Support multiple concurrent renters when a book has multiple copies
    rentedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // total copies uploaded by owner and how many are currently rented
    totalCopies: {
        type: Number,
        default: 1,
        min: 1
    },
    rentedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    // Whether this uploaded book has been approved by a system admin
    approved: {
        type: Boolean,
        default: false
    },
    // Whether the owner has requested admin approval for this book
    approvalRequested: {
        type: Boolean,
        default: false
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