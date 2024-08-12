/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const router = require('express').Router();

// Middlewares
const verifyToken = require('../middlewares/verify-token');

// controllers
const mailController = require('../controllers/mailController');

/* -------------------------------------------------------------------------- */
/*                                 Mail Routes                                 */
/* -------------------------------------------------------------------------- */

// POST request - create a new Mail
router.post(
  '/mail',
  verifyToken,
  mailController.createMail,
);

// GET request - get all Mails
router.get('/mails', mailController.getAllMails);

// GET request - get a single Mail
router.get('/mails/:id', mailController.getMailById);


// DELETE request - delete a single Mail
router.delete(
  '/mails/:id',
  verifyToken,
  mailController.deleteMail,
);

module.exports = router;
