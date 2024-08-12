/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const fs = require('fs');
const path = require('path');

// Models
const SliderModel = require('../models/sliderModel');

/* -------------------------------------------------------------------------- */
/*                             SLIDER CONTROLLERS                             */
/* -------------------------------------------------------------------------- */

/**
 * Create new Sliders
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const createSlider = (req, res) => {
  const {
    label_en,
    label_fr,
    description_fr,
    description_en,
    article_id,
    article_name,
    article_theme,
  } = req.body;

  const newSlider = new SliderModel({
    en: { label: label_en, description: description_en },
    fr: { label: label_fr, description: description_fr },
    created_by: req.decoded._id,
    created_at: Date.now(),
    isDisplayed: false,
    article: { id: article_id, name: article_name, theme: article_theme },
    photo:
      req?.files?.photo?.length > 0
        ? req?.files?.photo[0]?.path.replace('\\', '/')
        : '',
  });

  console.log('New slider object:', newSlider);

  newSlider
    .save()
    .then((result) => {
      console.log('Saved slider object:', result);
      res
        .status(200)
        .json({ message: 'Slider créé avec succès', slider: result });
    })
    .catch((error) => {
      console.log('Error:', error);
      res.status(500).json({ message: error.message });
    });
};

/**
 * Get all Sliders
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getAllSliders = async (req, res) => {
  try {
    const sliders = await SliderModel.find();
    return res.status(200).json({ sliders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getSliderById = async (req, res) => {
  const { id } = req.params;
  try {
    const slider = await SliderModel.findById(id);

    if (!slider) {
      return res.status(404).json({ message: "Slider n'existe pas" });
    }

    return res.status(200).json({ slider });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Update Slider by Id
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */

const updateSlider = async (req, res) => {
  const { id } = req.params;
  const {
    label_en,
    description_en,
    label_fr,
    description_fr,
    isDisplayed,
    article_id,
    article_name,
    article_theme,
  } = req.body;

  try {
    const slider = await SliderModel.findById(id);

    if (!slider) {
      return res.status(404).json({ message: 'Slider non trouvé' });
    }

    const updatephoto = {};

    if (req?.files?.photo) {
      // Delete the previous photo if it exists
      const previousImagePath = path.join(__dirname, '../../', slider.photo);
      fs.unlinkSync(previousImagePath);

      // Save the new photo path
      updatephoto.photo = (req.files?.photo[0].path).replace('\\', '/');
    }

    const sliderToUpdate = await SliderModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          'en.label': label_en,
          'en.description': description_en,
          'fr.label': label_fr,
          'fr.description': description_fr,
          isDisplayed: isDisplayed,
          update_by: req.decoded._id,
          article_id,
          article_name,
          article_theme,
          update_at: new Date(),
          ...updatephoto,
        },
      },
      { new: true },
    );

    return res
      .status(200)
      .json({ message: 'Slider MAJ est effecuté avec succés' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Delete Slider by Id
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const deleteSliderById = async (req, res) => {
  const { id } = req.params;

  try {
    const slider = await SliderModel.findById(id);

    if (!slider) {
      return res.status(404).json({ message: 'Slider non trouvé' });
    }

    // Delete the image file from the local folder
    const imagePath = path.join(__dirname, '../../', slider.photo);
    fs.unlinkSync(imagePath);

    await slider.delete();

    return res.status(200).json({ message: 'Slider est supprimé avec succés' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// export module
module.exports = {
  createSlider,
  getAllSliders,
  getSliderById,
  updateSlider,
  deleteSliderById,
};
