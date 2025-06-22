const Project = require('../models/Project');

const assignProject = async (req, res) => {
  try {
    const { title, description, createdBy, deadline, status } = req.body;

    const newProject = new Project({
      title,
      description,
      createdBy,
      deadline,
      created_at: new Date(), // ✅ Set created_at to current timestamp
      status
    });

    await newProject.save();

    res.status(201).json({
      msg: 'Project created successfully',
      project: newProject  // Optional: send back the created project
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: 'Failed to assign project',
      error: err.message
    });
  }
};

module.exports = assignProject;
