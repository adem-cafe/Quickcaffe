/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const router = require('express').Router();

// Middlewares
const verifyToken = require('../middlewares/verify-token');
const { fileUpload } = require('../middlewares/multer');

// controllers
const sliderController = require('../controllers/sliderController');

/* -------------------------------------------------------------------------- */
/*                                SLIDER ROUTES                               */
/* -------------------------------------------------------------------------- */

// POST request - create a new Slider
router.post('/slider', fileUpload, verifyToken, sliderController.createSlider);

// GET request - get all Sliders
router.get('/sliders', sliderController.getAllSliders);

// GET request - get a single Slider
router.get('/sliders/:id', sliderController.getSliderById);

// PUT request - Update a single Slider
router.put(
  '/sliders/:id',
  fileUpload,
  verifyToken,
  sliderController.updateSlider,
);

// DELETE request - delete a single Slider
router.delete('/sliders/:id', verifyToken, sliderController.deleteSliderById);

module.exports = router;
