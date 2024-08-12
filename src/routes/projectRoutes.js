/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const router = require('express').Router();

// Middlewares
const verifyToken = require('../middlewares/verify-token');

// controllers
const projectController = require('../controllers/projectController');

/* -------------------------------------------------------------------------- */
/*                                 Project Routes                                 */
/* -------------------------------------------------------------------------- */

// POST request - create a new Project
router.post('/project', verifyToken, projectController.createProject);

// GET request - get all Projects
router.get('/projects', projectController.getAllProjects);

// GET request - get a single Project
router.get('/projects/:id', projectController.getProjectById);

// PUT request - Update a single Project
router.put('/projects/:id', verifyToken, projectController.updateProject);

// DELETE request - delete a single Project
router.delete('/projects/:id', verifyToken, projectController.deleteProject);

module.exports = router;
