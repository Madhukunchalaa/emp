const Update = require('../models/EveryUpdate');

const submitUpdate = async (req, res) => {
  try {
    const { project_title, status, update, finishBy } = req.body;
    const imagePath = req.file ? `/uploads/updates/${req.file.filename}` : null;


    console.log('Image path being saved:', imagePath);

    // Get employee info from JWT token (assuming you have authentication middleware)
    const employeeId = req.user.id; // or however you get the employee ID from the token

    const newUpdate = new Update({
      project_title,
      status,
      update,
      finishBy,
      employee: employeeId, // Add the employee field
      imageUrl: imagePath
    });
   
    await newUpdate.save();
    console.log(newUpdate);

    res.json({
      msg: 'Data submitted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Data submission failed' });
  }
};

module.exports = submitUpdate;