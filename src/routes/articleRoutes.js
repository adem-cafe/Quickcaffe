/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const router = require('express').Router();

// Middlewares
const verifyToken = require('../middlewares/verify-token');
const { fileUpload } = require('../middlewares/multer');

// controllers
const articleController = require('../controllers/articleController');


/* -------------------------------------------------------------------------- */
/*                               ARTICLE ROUTES                               */
/* -------------------------------------------------------------------------- */

// POST request - create a new article
router.post('/article',fileUpload, verifyToken, articleController.createArticle);

// GET request - get all articles
router.get('/articles', articleController.getAllArticles);

// GET request - get a single article
router.get('/articles/:id', articleController.getArticleById);

// PUT request - Update a single article
router.put('/articles/:id',fileUpload, articleController.updateArticle);

// DELETE request - delete a single article
router.delete('/articles/:id', verifyToken, articleController.deleteArticle);

module.exports = router;
