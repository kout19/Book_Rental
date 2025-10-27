import User from '../models/User.js';

export const getUsers = async (req, res) => {
    try{
        const users = await User.find().select('-password');
        res.status(200).json(users);
    }catch(error){
        res.status(500).json({message: "Failed to fetch users", error: error.message});
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
