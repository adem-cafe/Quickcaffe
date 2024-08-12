/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const router = require('express').Router();

// Middlewares
const verifyToken = require('../middlewares/verify-token');

// controllers
const achievementController = require('../controllers/achievementController');

/* -------------------------------------------------------------------------- */
/*                                 Achievement Routes                                 */
/* -------------------------------------------------------------------------- */

// POST request - create a new Achievement
router.post(
  '/achievement',
  verifyToken,
  achievementController.createAchievement,
);

// GET request - get all Achievements
router.get('/achievements', achievementController.getAllAchievements);

// GET request - get a single Achievement
router.get('/achievements/:id', achievementController.getAchievementById);

// PUT request - Update a single Achievement
router.put(
  '/achievements/:id',
  verifyToken,
  achievementController.updateAchievement,
);

// DELETE request - delete a single Achievement
router.delete(
  '/achievements/:id',
  verifyToken,
  achievementController.deleteAchievement,
);

module.exports = router;
