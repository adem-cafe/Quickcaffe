/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const router = require('express').Router();

// Middlewares
const verifyToken = require('../middlewares/verify-token');

// controllers
const authController = require('../controllers/authController');

/* -------------------------------------------------------------------------- */
/*                                 Auth Route                                 */
/* -------------------------------------------------------------------------- */

// Get reqyest - check if email exist or not
router.post('/auth/user-email', authController.checkExistEmail);

// POST request - create new user
router.post('/auth/register', authController.signUp);

// POST request - sign in
router.post('/auth/login', authController.signIn);

// POST request - Send password reset link
router.post('/auth/forget-password', authController.forgotPassword);

// POST request - Send password reset link
router.post('/auth/reset-password/:token', authController.resetPassword);

/* -------------------------------------------------------------------------- */
/*                            Account Setting Route                           */
/* -------------------------------------------------------------------------- */

// PUT request - Disable user account
router.put('/account/:id/disable', verifyToken, authController.disableAccount);

// PUT request - Enable user account with token
router.put('/account/:id/enable', authController.enableAccount);

/* -------------------------------------------------------------------------- */
/*                                 User Route                                 */
/* -------------------------------------------------------------------------- */

// GET request - Get current user
router.get('/users/me', verifyToken, authController.getCurrentUser);

// PUT request - Update user by id
router.put('/users/:id', verifyToken, authController.updateUserById);

// GET request - Get all users
router.get('/users', verifyToken, authController.getAllUsers);

// GET request - Get user by id
router.get('/users/:id', verifyToken, authController.getUserById);

// DELETE request - delete user
router.delete('/users/:id', verifyToken, authController.deleteUser);

module.exports = router;
