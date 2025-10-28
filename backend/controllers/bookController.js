import User from "../models/User.js";
import Book from "../models/BookSchema.js";
import fetch from "node-fetch";

export const importBooks = async (req, res) => {
  try {
     console.log("Request body received:", req.body);
    const { books } = req.body;
    
    // 🧠 You can later replace this with your logged-in admin ID
    const adminUser = await User.findOne(); 
    if (!adminUser) {
      return res.status(400).json({ error: "No admin user found. Please create a user first." });
    }

    const currentYear = new Date().getFullYear();

    const booksToSave = books.map((doc, index) => {
      const year = parseInt(doc.publish_year?.[0]) || currentYear;
      const age = currentYear - year;
      const price = age < 5 ? 10 : age < 20 ? 5 : 10;
      const isbn = doc.isbn || `NO-ISBN-${Date.now()}-${index}`;

      return {
        title: doc.title || "Untitled",
        author: doc.author || "Unknown",
        category: doc.category || "Imported",
        ISBN: doc.isbn || isbn,
        publishedYear: year,
        image: doc.cover || null,
        rentPrice: price,
        owner: adminUser._id, // ✅ required
        available: true,
        status: "available",
      };
    });

    const savedBooks = await Book.insertMany(booksToSave);
    res.status(201).json({ message: "Books added successfully", savedBooks });
  } catch (err) {
    console.error("Error importing books:", err);
    res.status(500).json({ error: err.message });
  }
};
// Get all books with optional filtering
export const getBooks = async (req, res) => {
    try {
        const { search, category, author } = req.query;
        let query = { status: "available" }; // Only show available books
        
        // Add search filters
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (category) {
            query.category = { $regex: category, $options: 'i' };
        }
        
        if (author) {
            query.author = { $regex: author, $options: 'i' };
        }
        
        const books = await Book.find(query)
            .populate('owner', 'name email')
            .select('-__v');
            
        res.status(200).json(books);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get distinct categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Book.distinct('category');
        const cleaned = categories.filter(Boolean).map((c) => c.toString());
        res.status(200).json(cleaned);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get rentals for the authenticated user
export const getMyRentals = async (req, res) => {
    try {
        const renterId = req.user.id;
        const rentals = await Book.find({ rentedBy: renterId })
            .populate('owner', 'name email')
            .populate('rentedBy', 'name email')
            .select('-__v');
        res.status(200).json(rentals);
    } catch (error) {
        console.error('Error fetching my rentals:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single book by ID
export const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id)
            .populate('owner', 'name email')
            .populate('rentedBy', 'name email');
            
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        
        res.status(200).json(book);
    } catch (error) {
        console.error("Error fetching book:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Add a new book
export const addBook = async (req, res) => {
    try {
        const { title, author, description, category, ISBN, publishedYear } = req.body;
        const ownerId = req.user.id;    
        const book = await Book.create({
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
        const book = await Book.findById(bookId);
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

