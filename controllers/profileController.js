const ProfileModel = require('../models/profileModel');

// Get profile by ID or current user's profile
const getProfile = async (req, res) => {
    try {
        let userId;
        
        // If accessing /me endpoint
        if (req.path === '/me') {
            userId = req.user.id;
        } else {
            // If accessing /:userId endpoint
            userId = req.params.userId;
        }

        const profile = await ProfileModel.getProfile(userId);
        
        if (!profile) {
            return res.status(404).json({ 
                success: false, 
                message: 'Profile not found' 
            });
        }

        res.json({ 
            success: true, 
            data: profile 
        });
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error retrieving profile' 
        });
    }
};

// Update profile for current user
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Only allow updating own profile
        const profileData = req.body;

        // Basic validation
        if (!profileData || Object.keys(profileData).length === 0) {
            return res.status(400).json({ message: 'No profile data provided' });
        }

        const updatedProfile = await ProfileModel.updateProfile(userId, profileData);
        res.json(updatedProfile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

module.exports = {
    getProfile,
    updateProfile
};