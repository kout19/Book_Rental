import User from '../models/User.js';

// Update a user's profile (name/email). Allowed for the user themself or admins.
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId) return res.status(401).json({ message: 'Not authenticated' });

    // Only allow updating own profile or admins
    if (requesterId !== id && requesterRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, email } = req.body || {};
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No fields to update' });

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Profile updated', user });
  } catch (err) {
    console.error('Error updating profile:', err && (err.stack || err.message || err));
    res.status(500).json({ message: 'Server error' });
  }
};

// Owner requests approval from admin
export const requestApproval = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    if (!requesterId) return res.status(401).json({ message: 'Not authenticated' });

    const user = await User.findById(requesterId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isApproved) return res.status(400).json({ message: 'User already approved' });
    if (user.approvalRequested) return res.status(400).json({ message: 'Approval already requested' });

    user.approvalRequested = true;
    await user.save();

    // Optionally: notify admins via some notification channel (not implemented)

    res.status(200).json({ message: 'Approval requested; an admin will review your account.' });
  } catch (err) {
    console.error('Error requesting approval:', err && (err.stack || err.message || err));
    res.status(500).json({ message: 'Server error' });
  }
};

export default { updateUserProfile };
