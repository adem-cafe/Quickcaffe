/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const { default: mongoose } = require('mongoose');

// Models
const ProjectModel = require('../models/projectModel');

// helpers
const { getfilteredArrayOfObject } = require('../utils/helpers');

/* -------------------------------------------------------------------------- */
/*                        Project Controller                        */
/* -------------------------------------------------------------------------- */

/**
 * Create new Project
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const createProject = async (req, res) => {
  try {
    /**
     * Retrieve the project in english and french from the request body
     */
    const { name_en, name_fr, domain, deadline, commityDate, status } =
      req.body;
    const Project = new ProjectModel({
      en: {
        name: name_en,
      },
      fr: {
        name: name_fr,
      },
      domain: domain,
      deadline: deadline,
      commityDate: commityDate,
      status: status,
      createdAt: Date.now(),
      createdBy: req.decoded._id,
      updatedAt: '',
      updatedBy: '',
    });
    // Save the new Project
    await Project.save();
    // Send response
    res.status(201).json({
      id: Project._id,
      success: true,
      message: 'Project crée avec succès',
    });
  } catch (error) {
    // Send error response
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du Project',
      error: error.message,
    });
  }
};

/**
 * Retrieves all Project
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getAllProjects = async (req, res) => {
  try {
    let lang = req.headers.lang;

    // Return questions And Answers depending on the selected language (english or french)
    let Project = await ProjectModel.aggregate([
      {
        $project:
          lang !== undefined
            ? lang === 'en'
              ? { fr: 0 }
              : { en: 0 }
            : { __v: 0 },
      },
    ]).exec();

    res.json({
      success: true,
      Project: lang ? getfilteredArrayOfObject(Project, lang) : Project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Retrieves a single Project by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getProjectById = async (req, res) => {
  try {
    let lang = req.headers.lang;

    // Return single Project depending on the selected language (english or french)
    let Project = await ProjectModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
      {
        $project:
          lang !== undefined
            ? lang === 'en'
              ? { fr: 0 }
              : { en: 0 }
            : { __v: 0 },
      },
    ]).exec();

    res.json({
      success: true,
      Project: lang ? getfilteredArrayOfObject(Project, lang)[0] : Project[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update a single Project
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const updateProject = async (req, res) => {
  try {
    let currentProject = await ProjectModel.findOne({ _id: req.params.id });

    let Project = await ProjectModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          // for english language
          'en.name': req.body.name_en
            ? req.body.name_en
            : currentProject.en.name,
          // for french language
          'fr.name': req.body.name_fr
            ? req.body.name_fr
            : currentProject.fr.name,
          domain: req.body.domain ? req.body.domain : currentProject.domain,
          deadline: req.body.deadline
            ? req.body.deadline
            : currentProject.deadline,
          commityDate: req.body.commityDate
            ? req.body.commityDate
            : currentProject.commityDate,
          status: req.body.status ? req.body.status : currentProject.status,
          createdBy: currentProject.createdBy,
          createdAt: currentProject.createdAt,
          updatedAt: Date.now(),
          updatedBy: req.decoded._id,
        },
      },
      { new: true },
    );

    res.json({
      success: true,
      updatedProject: Project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Project by Id
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const deleteProject = async (req, res) => {
  try {
    let deletedProject = await ProjectModel.findOneAndDelete({
      _id: req.params.id,
    });

    if (deletedProject) {
      res.status(200).json({
        status: true,
        message: 'Project ont été supprimées avec succès',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export module
module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
