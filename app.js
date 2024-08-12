/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */

// Packages
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
var cors = require('cors');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./src/swagger.json');

// config
dotenv.config();

// const
const app = express();

// DATABASE CONNECTION
mongoose.set('strictQuery', true);
mongoose.connect(
  process.env.DATABASE_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Base de données connectée avec succès');
    }
  },
);

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(cors());

// Require APIs
const userRoutes = require('./src/routes/authRoutes');
const faqRoutes = require('./src/routes/faqRoutes');
const articleRoutes = require('./src/routes/articleRoutes');
const achievementRoutes = require('./src/routes/achievementRoutes');
const sliderRoutes = require('./src/routes/sliderRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const mailRoutes = require('./src/routes/mailRoutes');
// local APIs
app.use('/v1/api', userRoutes);
app.use('/v1/api', faqRoutes);
app.use('/v1/api', articleRoutes);
app.use('/v1/api', achievementRoutes);
app.use('/v1/api', sliderRoutes);
app.use('/v1/api', searchRoutes);
app.use('/v1/api', projectRoutes);
app.use('/v1/api', mailRoutes);

// API for uploads file (photo, galleries)
app.get('/uploads/:id', (req, res) => {
  res.sendFile(path.join(__dirname, `./uploads/${req.params.id}`));
});

// API for swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
