import User from '../models/User.js';
export const getUsers = async (req, res) => {
    try{
        // Populate ownedBooks so admin can see which owner uploaded which books
        const users = await User.find().select('-password').populate('ownedBooks', 'title totalCopies approved approvalRequested');
        res.status(200).json(users);
    }catch(error){
        res.status(500).json({message: "Failed to fetch users", error: error.message});
  }
};

// Approve or reject an owner-uploaded book
export const approveBook = async (req, res) => {
    try {
        const { id } = req.params; // book id
        const { approved } = req.body; // boolean
        const Book = (await import('../models/BookSchema.js')).default;
        const book = await Book.findById(id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        book.approved = !!approved;
        await book.save();
        res.status(200).json({ message: `Book ${approved ? 'approved' : 'unapproved'}`, book });
    } catch (error) {
        console.error('Error approving book:', error);
        res.status(500).json({ message: 'Failed to set book approval', error: error.message });
    }
};

// Admin endpoint to list unapproved owner uploads
export const listUnapprovedBooks = async (req, res) => {
    try {
        const Book = (await import('../models/BookSchema.js')).default;
        const books = await Book.find({ approved: false }).populate('owner', 'name email');
        res.status(200).json(books);
    } catch (error) {
        console.error('Error listing unapproved books:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const updateUserRole= async (req, res) => {
    try{
        const {id} = req.params;
        const {role} = req.body;
        const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
        if(!user)
            return res.status(404).json({message: "User not found"});
        res.status(200).json({message: "User role updated successfully", user});
    }catch(error){
        res.status(500).json({message: "Failed to update user role", error: error.message});
    }
};
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expected "active" or "disabled"
    if (!["active", "disabled"].includes(status)) return res.status(400).json({ message: "Invalid status" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = status;
    await user.save();

    res.status(200).json({ message: `User ${status} successfully`, user: await User.findById(id).select("-password") });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user status", error: error.message });
  }
};
export const deleteUser = async (req, res) => {
    try{
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id);
        if(!user)
            return res.status(404).json({message: "User not found"});
        res.status(200).json({message: "User deleted successfully", user});
    }catch(error){
        res.status(500).json({message: "Failed to delete user", error: error.message});
    }
}
// Approve or unapprove an owner account
export const approveOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const { approved } = req.body;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isApproved = !!approved;
        // if approving, clear approvalRequested flag and set role to 'owner'
        if (approved) {
            user.approvalRequested = false;
            user.role = 'owner';
        }
        await user.save();
        res.status(200).json({ message: `User ${approved ? 'approved' : 'unapproved'}`, user });
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ message: 'Failed to set user approval', error: error.message });
    }
};

// List all approval requests (owners and books)
export const getApprovalRequests = async (req, res) => {
    try {
        const Book = (await import('../models/BookSchema.js')).default;
        const Contact = (await import('../models/Contact.js')).default;
        const userRequests = await User.find({ approvalRequested: true }).select('-password');
        const bookRequests = await Book.find({ approvalRequested: true }).populate('owner', 'name email');
        const contactRequests = await Contact.find({ status: 'pending' }).select('name email message status');
        res.status(200).json({ users: userRequests, books: bookRequests, contacts: contactRequests });
    } catch (error) {
        console.error('Error fetching approval requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Bulk approve/unapprove users (expects { ids: [id], approved: true/false })
export const approveUsersBulk = async (req, res) => {
    try {
        const { ids, approved } = req.body;
        if (!Array.isArray(ids)) return res.status(400).json({ message: 'ids must be an array' });
        const result = await User.updateMany({ _id: { $in: ids } }, { $set: { isApproved: !!approved, approvalRequested: false } });
        res.status(200).json({ message: 'Users updated', result });
    } catch (error) {
        console.error('Error bulk approving users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Bulk approve/unapprove books (expects { ids: [id], approved: true/false })
export const approveBooksBulk = async (req, res) => {
    try {
        const { ids, approved } = req.body;
        const Book = (await import('../models/BookSchema.js')).default;
        if (!Array.isArray(ids)) return res.status(400).json({ message: 'ids must be an array' });
        const result = await Book.updateMany({ _id: { $in: ids } }, { $set: { approved: !!approved, approvalRequested: false } });
        res.status(200).json({ message: 'Books updated', result });
    } catch (error) {
        console.error('Error bulk approving books:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const markContactAsSeen = async(req, res) =>{
    try {
    const { id } = req.params;
    const Contact = (await import('../models/Contact.js')).default;
    const updated = await Contact.findByIdAndUpdate(id, { status: 'seen' }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Message not found' });
    res.status(200).json({ message: 'Marked as seen' });
  } catch (error) {
    console.error('Error marking contact as seen:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
