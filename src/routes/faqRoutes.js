/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const router = require('express').Router();

// Middlewares
const verifyToken = require('../middlewares/verify-token');

// controllers
const faqController = require('../controllers/faqController');

/* -------------------------------------------------------------------------- */
/*                                 FAQ Routes                                 */
/* -------------------------------------------------------------------------- */

// POST request - create a new FAQ
router.post('/faq', verifyToken, faqController.createFAQ);

// GET request - get all FAQs in a specific language
router.get('/faqs', faqController.getAllFAQs);

//GET request - get all FAQs
router.get('/faqs/all', faqController.getAllFAQsAllLang);

// GET request - get a single FAQ
router.get('/faqs/:id', faqController.getFAQById);

// PUT request - Update a single FAQ
router.put('/faqs/:id', verifyToken, faqController.updateFAQ);

// DELETE request - delete a single FAQ
router.delete('/faqs/:id', verifyToken, faqController.deleteFAQ);

module.exports = router;
