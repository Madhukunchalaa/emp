// controllers/updateController.js
const User = require('../models/User');

exports.workUpdate = async (req, res) => {
    const { update, userId } = req.body;
  
    if (!update || !userId) {
      return res.status(400).json({ message: "Missing update or userId" });
    }
  
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { todayWorkingOn: update },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({
        message: "Work updated successfully",
        user,
      });
    } catch (err) {
      console.error("Error in workUpdate:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  