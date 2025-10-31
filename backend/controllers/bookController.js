import User from "../models/User.js";
import Book from "../models/BookSchema.js";
import Rental from "../models/Rental.js";
import fetch from "node-fetch";
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

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
        if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
        const renterId = req.user.id;
        // Return Rental records for the user, with populated book and owner info
        const rentals = await Rental.find({ renter: renterId }).populate('book').populate('owner', 'name email');
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
        const { title, author, description, category, ISBN, publishedYear, totalCopies, rentPrice } = req.body;
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
            rentPrice: rentPrice || 0,
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
    // Create a Rental record
    const rental = await Rental.create({ renter: renterId, book: book._id, owner: book.owner._id || book.owner, startDate: new Date(), returned: false });
    console.debug('borrowBook: created rental', rental._id);
        console.debug('borrowBook: book', bookId, 'rentedBy set (added) to', renterId);

        // Add book to renter's rentedBooks
        await User.findByIdAndUpdate(renterId, { $push: { rentedBooks: book._id } });
        console.debug('borrowBook: user', renterId, 'rentedBooks updated with', book._id);

        // Note: owner wallet credited on return when totalPrice is known
        res.status(200).json({ message: "Book borrowed successfully", book, rentalId: rental._id });
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

        // Find the active rental record and close it
        try {
            const rental = await Rental.findOne({ renter: renterId, book: book._id, returned: false });
            if (rental) {
                rental.endDate = new Date();
                // days: at least 1
                const ms = rental.endDate - rental.startDate;
                const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
                rental.days = days;
                rental.totalPrice = (book.rentPrice || 0) * days;
                rental.returned = true;
                await rental.save();

                // Credit owner wallet by totalPrice
                try {
                    const owner = await User.findById(book.owner._id || book.owner);
                    if (owner) {
                        owner.wallet = (owner.wallet || 0) + (rental.totalPrice || 0);
                        await owner.save();
                        console.debug('returnBook: credited owner', owner._id, 'by', rental.totalPrice);
                    }
                } catch (wErr) {
                    console.error('Failed to update owner wallet on return:', wErr && (wErr.stack || wErr.message || wErr));
                }
            }
        } catch (rErr) {
            console.error('Failed to finalize rental record:', rErr && (rErr.stack || rErr.message || rErr));
        }

        res.status(200).json({ message: "Book returned successfully", book });

    }catch (error){
        console.error("Error returning book:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Read-only viewer endpoint: only renter with active rental, owner, or admin can read
export const readBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id).populate('owner', 'name email role isApproved status');
        if (!book) return res.status(404).json({ message: 'Book not found' });

        const userId = req.user?.id;
        // allow admin or owner
        if (req.user && req.user.role === 'admin') return res.status(200).json({ content: book.description || '', title: book.title, image: book.image || null });
        if (String(book.owner._id || book.owner) === String(userId)) return res.status(200).json({ content: book.description || '', title: book.title, image: book.image || null });

        // check active rental
        const rental = await Rental.findOne({ renter: userId, book: book._id, returned: false });
        if (!rental) return res.status(403).json({ message: 'You do not have an active rental for this book' });

        // If the book has an uploaded file, and it's a text file, return its content.
        if (book.filePath && (book.fileMimeType || '').startsWith('text')) {
            try {
                const fileContent = fs.readFileSync(book.filePath, 'utf8');
                // allow caching by service worker
                res.set('x-cache-allow', '1');
                return res.status(200).json({ content: fileContent || book.description || '', title: book.title, image: book.image || null, rentalId: rental._id });
            } catch (fErr) {
                console.error('Failed to read uploaded file for readBook:', fErr);
            }
        }

        // For non-text files, indicate a file is available and frontend should fetch /file
        if (book.filePath) {
            res.set('x-cache-allow', '1');
            return res.status(200).json({ fileAvailable: true, fileType: book.fileMimeType || null, title: book.title, image: book.image || null, rentalId: rental._id });
        }

        // return read-only content (note: this is plain text fallback; further DRM not implemented)
        res.status(200).json({ content: book.description || '', title: book.title, image: book.image || null, rentalId: rental._id });
    } catch (err) {
        console.error('Error reading book:', err && (err.stack || err.message || err));
        res.status(500).json({ message: 'Server error' });
    }
};

// Serve uploaded file for a book (authorization required)
export const serveBookFile = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id).populate('owner', 'name email role isApproved status');
        if (!book) return res.status(404).json({ message: 'Book not found' });

        const userId = req.user?.id;
        if (req.user && req.user.role === 'admin') {
            // allow
        } else if (String(book.owner._id || book.owner) === String(userId)) {
            // owner allowed
        } else {
            const rental = await Rental.findOne({ renter: userId, book: book._id, returned: false });
            if (!rental) return res.status(403).json({ message: 'You do not have access to this file' });
        }

        if (!book.filePath) return res.status(404).json({ message: 'No file available for this book' });

        const filePath = book.filePath;
        if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing on server' });

        // Allow service worker to cache this response
        res.set('x-cache-allow', '1');
        res.setHeader('Content-Type', book.fileMimeType || 'application/octet-stream');
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    } catch (err) {
        console.error('Error serving book file:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Upload an owner file (base64 payload) and extract metadata (AI optional)
export const uploadBookFile = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { fileName, mimeType, size, data, title, author, category, rentPrice, description } = req.body;
        if (!fileName || !mimeType || !size || !data) return res.status(400).json({ message: 'Invalid payload' });
        const maxBytes = 10 * 1024 * 1024; // 10MB
        if (size > maxBytes) return res.status(400).json({ message: 'File too large. Max 10MB.' });

        const buffer = Buffer.from(data, 'base64');
        const safeName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.\-_]/g,'_')}`;
        const dest = path.join(UPLOAD_DIR, safeName);
        fs.writeFileSync(dest, buffer);

        // Basic metadata extraction for text files
        let extracted = { title: title || null, author: author || null, description: description || null, ISBN: null, category: category || 'Uploaded' };
        try {
            if ((mimeType || '').startsWith('text')) {
                const textSample = buffer.toString('utf8', 0, Math.min(buffer.length, 20000));
                // Try AI extraction if key present
                if (process.env.OPENAI_API_KEY) {
                    try {
                        const prompt = `Extract JSON with keys title, author, description, ISBN, category from the following text. If a key is absent, use null. Return only a JSON object.\n\nText:\n${textSample}`;
                        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
                            body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 300 })
                        });
                        const j = await resp.json();
                        const aiText = j?.choices?.[0]?.message?.content;
                        if (aiText) {
                            try {
                                const parsed = JSON.parse(aiText);
                                extracted = { ...extracted, ...parsed };
                            } catch (pe) {
                                console.debug('AI response not JSON, skipping parse');
                            }
                        }
                    } catch (aiErr) {
                        console.error('AI metadata extraction failed:', aiErr);
                    }
                }
                // simple fallback: first non-empty line -> title, second -> author
                if (!extracted.title || !extracted.author) {
                    const lines = textSample.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
                    if (!extracted.title && lines[0]) extracted.title = lines[0];
                    if (!extracted.author && lines[1]) extracted.author = lines[1];
                    if (!extracted.description) extracted.description = lines.slice(2).join('\n');
                }
            }
        } catch (metaErr) {
            console.error('Metadata extraction error', metaErr);
        }

        // Create book record
        const book = await Book.create({
            title: extracted.title || title || fileName,
            author: extracted.author || author || 'Unknown',
            description: extracted.description || description || '',
            category: extracted.category || category || 'Uploaded',
            owner: ownerId,
            totalCopies: 1,
            rentPrice: rentPrice || 0,
            rentedCount: 0,
            approved: false,
            approvalRequested: true,
            status: 'available',
            filePath: dest,
            fileMimeType: mimeType,
            fileSize: size,
        });

        await User.findByIdAndUpdate(ownerId, { $push: { ownedBooks: book._id } });

        res.status(201).json({ message: 'File uploaded and book created', book });
    } catch (err) {
        console.error('uploadBookFile error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

