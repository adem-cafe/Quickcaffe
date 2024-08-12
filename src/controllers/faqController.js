/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const { default: mongoose } = require('mongoose');

// Models
const FAQModel = require('../models/faqModel');

// helpers
const { getfilteredArrayOfObject } = require('../utils/helpers');

/* -------------------------------------------------------------------------- */
/*                        Question & Answer Controller                        */
/* -------------------------------------------------------------------------- */

/**
 * Create new FAQ
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const createFAQ = async (req, res) => {
  try {
    /**
     * Retrieve the question and answer in english and french from the request body
     * @param {String} question_en - The question in english
     * @param {String} answer_en - The answer in english
     * @param {String} question_fr - The question in french
     * @param {String} answer_fr - The answer in french
     */
    const { question_en, answer_en, question_fr, answer_fr } = req.body;

    /**
     * Create new FAQ
     * @param {Object} en - The english version of the FAQ
     * @param {String} en.question - The question in english
     * @param {String} en.answer - The answer in english
     * @param {Object} fr - The french version of the FAQ
     * @param {String} fr.question - The question in french
     * @param {String} fr.answer - The answer in french
     * @returns {Object} FAQ - The new FAQ
     */
    const FAQ = new FAQModel({
      en: {
        question: question_en,
        answer: answer_en,
      },
      fr: {
        question: question_fr,
        answer: answer_fr,
      },
    });
    // Save the new FAQ
    await FAQ.save();
    // Send response
    res.status(201).json({
      id: FAQ._id,
      success: true,
      message: 'FAQ créée avec succès',
    });
  } catch (error) {
    // Send error response
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la FAQ',
      error: error.message,
    });
  }
};

/**
 * Retrieves all FAQ by Selected language
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getAllFAQs = async (req, res) => {
  try {
    let lang = req.headers.lang;

    // Return questions And Answers depending on the selected language (english or french)
    let FAQ = await FAQModel.aggregate([
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
      FAQ: lang ? getfilteredArrayOfObject(FAQ, lang) : FAQ,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Retrieves all FAQ all lang
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */

const getAllFAQsAllLang = async (req, res) => {
  try {
    const faqList = await FAQModel.find();

    res.json({
      success: true,
      FAQ: faqList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Retrieves a single FAQ by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getFAQById = async (req, res) => {
  try {
    let lang = req.headers.lang;

    // Return single FAQ depending on the selected language (english or french)
    let FAQ = await FAQModel.aggregate([
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
      FAQ: lang ? getfilteredArrayOfObject(FAQ, lang)[0] : FAQ[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update a single FAQ
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const updateFAQ = async (req, res) => {
  try {
    let currentFAQ = await FAQModel.findOne({ _id: req.params.id });

    let FAQ = await FAQModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          // for english language
          'en.question': req.body.question_en
            ? req.body.question_en
            : currentFAQ.en.question,
          'en.answer': req.body.answer_en
            ? req.body.answer_en
            : currentFAQ.en.answer,
          // for french language
          'fr.question': req.body.question_fr
            ? req.body.question_fr
            : currentFAQ.fr.question,
          'fr.answer': req.body.answer_fr
            ? req.body.answer_fr
            : currentFAQ.fr.answer,
        },
      },
      { new: true },
    );

    res.json({
      success: true,
      updatedFAQ: FAQ,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete FAQ by Id
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const deleteFAQ = async (req, res) => {
  try {
    let deletedFAQ = await FAQModel.findOneAndDelete({
      _id: req.params.id,
    });

    if (deletedFAQ) {
      res.status(200).json({
        status: true,
        message: 'FAQ ont été supprimées avec succès',
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
  createFAQ,
  getAllFAQs,
  getAllFAQsAllLang,
  getFAQById,
  updateFAQ,
  deleteFAQ,
};
