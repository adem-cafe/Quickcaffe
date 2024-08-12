/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const { default: mongoose } = require('mongoose');

// Models
const AchievementModel = require('../models/achievementModel');

// helpers
const { getfilteredArrayOfObject } = require('../utils/helpers');

/* -------------------------------------------------------------------------- */
/*                           Achievement Controller                           */
/* -------------------------------------------------------------------------- */
/**
 * Create new Achievement
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const createAchievement = async (req, res) => {
  try {
    /**
     * Retrieve achievement in english and french from the request body
     * @param {Object} en - The english version of the Achievement
     * @param {String} en.label - The label in english
     * @param {Object} fr - The french version of the Achievement
     * @param {String} fr.label - The label in french
     * @param {String} statistics - The statistics
     */
    const { label_en, label_fr, statistics } = req.body;
    /**
     * Create new Achievement
     * @param {Object} en - The english version of the Achievement
     * @param {String} en.label - The label in english
     * @param {Object} fr - The french version of the Achievement
     * @param {String} fr.label - The label in french
     * @param {String} statistics - The statistics
     * @returns {Object} Achievement - The new Achievement
     */
    const Achievement = new AchievementModel({
      en: { label: label_en },
      fr: { label: label_fr },
      statistics: statistics,
    });
    // Save the new Achievement
    await Achievement.save();
    // Send response
    res.status(201).json({
      id: Achievement._id,
      success: true,
      message: 'Achievement créée avec succès',
    });
  } catch (error) {
    // Send error response
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la Achievement',
      error: error.message,
    });
  }
};

/**
 * Retrieves all Achievement
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getAllAchievements = async (req, res) => {
  try {
    let lang = req.headers.lang;
    /**
     * Retrieves all Achievement by language (english or french)
     */
    let AchievementList = await AchievementModel.aggregate([
      {
        $project:
          lang !== undefined
            ? lang === 'en'
              ? { fr: 0 }
              : { en: 0 }
            : { __v: 0 },
      },
    ]).exec();

    if (AchievementList) {
      res.status(200).json({
        success: true,
        Achievement: lang
          ? getfilteredArrayOfObject(AchievementList, lang)
          : AchievementList,
      });
    }
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Retrieves a single Achievement by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getAchievementById = async (req, res) => {
  try {
    let lang = req.headers.lang;

    // Return single Achievement depending on the selected language (english or french)
    let Achievement = await AchievementModel.aggregate([
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
      Achievement: lang
        ? getfilteredArrayOfObject(Achievement, lang)[0]
        : Achievement[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update a single Achievement
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const updateAchievement = async (req, res) => {
  try {
    const currentAchievement = await AchievementModel.findOne({
      _id: req.params.id,
    });

    let updatedAchievement = await AchievementModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          // for english language
          'en.label': req.body.label_en
            ? req.body.label_en
            : currentAchievement.en.label,
          // for french language
          'fr.label': req.body.label_fr
            ? req.body.label_fr
            : currentAchievement.fr.label,
          // statistics
          statistics: req.body.statistics
            ? req.body.statistics
            : currentAchievement.statistics,
        },
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      data: updatedAchievement,
      message: 'Achievement mise à jour avec succès',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Achievement by Id
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const deleteAchievement = async (req, res) => {
  try {
    const deletedAchievement = await AchievementModel.findOneAndDelete({
      _id: req.params.id,
    });

    if (!deletedAchievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement introuvable',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Achievement à été supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export module
module.exports = {
  createAchievement,
  getAllAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
};
