/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const router = require('express').Router();

// Controllers
const searchController = require('../controllers/searchController');

/* -------------------------------------------------------------------------- */
/*                                SLIDER ROUTES                               */
/* -------------------------------------------------------------------------- */

// Get request - get sliders by language (en or fr) by label or description
router.get('/research', searchController.getItems);

module.exports = router;
