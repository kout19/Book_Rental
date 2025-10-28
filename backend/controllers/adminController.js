import User from '../models/User.js';

export const getUsers = async (req, res) => {
    try{
        const users = await User.find().select('-password');
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
        // if approving, clear approvalRequested flag
        if (approved) user.approvalRequested = false;
        await user.save();
        res.status(200).json({ message: `User ${approved ? 'approved' : 'unapproved'}`, user });
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ message: 'Failed to set user approval', error: error.message });
    }
};
