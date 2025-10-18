import User from '../models/User';

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
        const user = await User.findByIdAndUpdate(id);
        if(!user)
            return res.status(404).json({message: "User not found"});
        user.role =role;
        await user.save();
        res.status(200).json({message: "User role updated successfully", user});
    }catch(error){
        res.status(500).json({message: "Failed to update user role", error: error.message});
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
