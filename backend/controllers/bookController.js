import User from "../models/User.js";
import Book from "../models/BookSchema.js";

// Add a new book
export const addBook = async (req, res) => {
    try {
        const { title, author, description, category, ISBN, publishedYear } = req.body;
        const ownerId = req.user.id;    
        const book = await book.create({
            title,
            author,
            description,
            category,
            ISBN,
            publishedYear,
            owner: ownerId
        });
    await User.findByIdAndUpdate(ownerId, { $push: { ownedBooks: book._id } });
    res.status(201).json({message: "Book added successfully", book });

    } catch (error){
        console.error("Error adding book:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Boorow a book
export const borrowBook = async (req, res) => {
    try{
        const renterId= req.user.id;
        const {bookId} = req.params;
        const book = await Book.findById(bookId);
        if(!book) return res.status(404).json({message: "Book not found"});
        if(book.status === "rented")  return res.status(400).json({message: "Book already rented"});
        if(book.status ==="reserved") return res.status(400).json({message: "Book is reserved"});
        book.rentedBy = renterId;
        book.status = "rented";
        await book.save();
        await User.findByIdAndUpdate(renterId, { $push: { rentedBooks: book._id } });
        res.status(200).json({message: "Book borrowed successfully", book });
    }catch (error){
        console.error("Error borrowing book:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Return a book
export const returnBook = async (req, res) => {
    try{
        const renterId =req.user.id;
        const {bookId} = req.params;
        const book = await book.findById(bookId);
        if(!book) return res.status(404).json({message: "Book not found"});
        if(book.rentedBy?.toString() !== renterId) {
            return res.status(403).json({message: "You did not rent this book"});
        }
        book.rentedBy = null;
        book.status = "available";
        await book.save();
        await User.findByIdAndUpdate(renterId, { $pull: { rentedBooks: book._id } });
        res.status(200).json({message: "Book returned successfully", book });

    }catch (error){
        console.error("Error returning book:", error);
        res.status(500).json({ message: "Server error" });
    }
};

