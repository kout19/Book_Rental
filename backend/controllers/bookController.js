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
                totalCopies: 1,
                rentedCount: 0,
                approved: true, // admin-imported books are pre-approved
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
        // By default we'll query for books that are approved and have available copies
        // but allow admins to query all books.
        let query = { approved: true };

        // If the authenticated user is an admin (or has manage all ability), allow unfiltered queries
        if (req.user && req.user.role === 'admin') {
            query = {}; // admin can filter through all books
        }

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

        // Find and populate owner info; then filter out books whose owner is disabled
        const booksRaw = await Book.find(query)
            .populate('owner', 'name email status isApproved')
            .select('-__v');

        const books = booksRaw.filter((b) => {
            const owner = b.owner;
            if (!owner) return false;
            // Owner must be active and (if role owner) approved
            if (owner.status === 'disabled') return false;
            if (owner.role === 'owner' && owner.isApproved === false) return false;
            // Must have at least one available copy
            const availableCopies = (b.totalCopies || 1) - (b.rentedCount || 0);
            return availableCopies > 0;
        });

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
        if (!req.user) {
            console.warn('getMyRentals: no req.user present');
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const renterId = req.user.id;
        console.debug('getMyRentals: renterId=', renterId);
        const rentals = await Book.find({ rentedBy: { $in: [renterId] } })
            .populate('owner', 'name email')
            .populate('rentedBy', 'name email')
            .select('-__v');
        console.debug('getMyRentals: found', rentals.length, 'rentals for', renterId);
        res.status(200).json(rentals);
    } catch (error) {
        console.error('Error fetching my rentals:', error && (error.stack || error.message || error));
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single book by ID
export const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id)
            .populate('owner', 'name email status isApproved role')
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

// Get books for the authenticated owner
export const getOwnerBooks = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
        const ownerId = req.user.id;
        const books = await Book.find({ owner: ownerId })
            .populate('owner', 'name email status isApproved')
            .select('-__v');
        res.status(200).json(books);
    } catch (err) {
        console.error('Error fetching owner books:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a book (owner or admin)
export const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};
        const book = await Book.findById(id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        // Only owner or admin can update
        if (req.user.role !== 'admin' && book.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        // Prevent changing owner via this route
        delete updates.owner;
        Object.assign(book, updates);
        await book.save();
        res.status(200).json({ message: 'Book updated', book });
    } catch (err) {
        console.error('Error updating book:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a book (owner or admin)
export const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        if (req.user.role !== 'admin' && book.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await Book.findByIdAndDelete(id);
        // Also remove from owner's ownedBooks
        await User.findByIdAndUpdate(book.owner, { $pull: { ownedBooks: book._id } });
        res.status(200).json({ message: 'Book deleted' });
    } catch (err) {
        console.error('Error deleting book:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Owner requests admin approval for one of their books
export const requestBookApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        // Only owner or admin can request approval
        if (req.user.role !== 'admin' && String(book.owner) !== String(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (book.approved) return res.status(400).json({ message: 'Book already approved' });
        if (book.approvalRequested) return res.status(400).json({ message: 'Approval already requested' });

        book.approvalRequested = true;
        await book.save();

        res.status(200).json({ message: 'Approval requested', book });
    } catch (err) {
        console.error('Error requesting book approval:', err && (err.stack || err.message || err));
        res.status(500).json({ message: 'Server error' });
    }
};

// Add a new book
export const addBook = async (req, res) => {
    try {
        const { title, author, description, category, ISBN, publishedYear, totalCopies } = req.body;
        const ownerId = req.user.id;
        const book = await Book.create({
            title,
            author,
            description,
            category,
            ISBN,
            publishedYear,
            owner: ownerId,
            totalCopies: totalCopies || 1,
            rentedCount: 0,
            approved: false, // owner uploaded books must be approved by admin
            status: 'available',
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
        const book = await Book.findById(bookId).populate('owner');
        if(!book) return res.status(404).json({message: "Book not found"});
        // Ensure book and owner are approved and owner active
        if (!book.approved) return res.status(400).json({ message: 'Book not approved for rent' });
        if (!book.owner) return res.status(400).json({ message: 'Book has no owner' });
        if (book.owner.status === 'disabled') return res.status(403).json({ message: 'Owner disabled, book cannot be rented' });
        if (book.owner.role === 'owner' && book.owner.isApproved === false) return res.status(403).json({ message: 'Owner not approved by admin' });

        const availableCopies = (book.totalCopies || 1) - (book.rentedCount || 0);
        if (availableCopies <= 0) return res.status(400).json({ message: 'No available copies' });

        // Add renter to rentedBy array and increment rentedCount
        book.rentedBy = book.rentedBy || [];
        book.rentedBy.push(renterId);
        book.rentedCount = (book.rentedCount || 0) + 1;
        // If all copies now rented mark status as rented
        if ((book.rentedCount || 0) >= (book.totalCopies || 1)) {
            book.status = 'rented';
            book.available = false;
        }
        await book.save();
        console.debug('borrowBook: book', bookId, 'rentedBy set (added) to', renterId);

        // Add book to renter's rentedBooks
        await User.findByIdAndUpdate(renterId, { $push: { rentedBooks: book._id } });
        console.debug('borrowBook: user', renterId, 'rentedBooks updated with', book._id);

        // Update owner's wallet by rentPrice
        try {
            const owner = await User.findById(book.owner._id || book.owner);
            if (owner) {
                owner.wallet = (owner.wallet || 0) + (book.rentPrice || 0);
                await owner.save();
                console.debug('borrowBook: owner', owner._id, 'wallet updated by', book.rentPrice);
            }
        } catch (wErr) {
            console.error('Failed to update owner wallet:', wErr && (wErr.stack || wErr.message || wErr));
        }

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
        // Ensure renter had rented this book
        if (!book.rentedBy || !book.rentedBy.find((r) => r.toString() === renterId)) {
            return res.status(403).json({message: "You did not rent this book"});
        }
        // Remove renter from rentedBy array and decrement rentedCount
        book.rentedBy = book.rentedBy.filter((r) => r.toString() !== renterId);
        book.rentedCount = Math.max(0, (book.rentedCount || 1) - 1);
        // If there are now available copies, mark available
        if ((book.totalCopies || 1) - (book.rentedCount || 0) > 0) {
            book.status = 'available';
            book.available = true;
        }
        await book.save();
        await User.findByIdAndUpdate(renterId, { $pull: { rentedBooks: book._id } });
        res.status(200).json({message: "Book returned successfully", book });

    }catch (error){
        console.error("Error returning book:", error);
        res.status(500).json({ message: "Server error" });
    }
};

