/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* -------------------------------------------------------------------------- */
/*                                 Project Schema                                 */
/* -------------------------------------------------------------------------- */
const Projectchema = new Schema({
  en: {
    name: { type: String, required: true },
  },
  fr: {
    name: { type: String, required: true },
  },
  domain: { type: String, required: true },
  deadline: { type: String, required: true },
  commityDate : { type: String, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true },
  updatedAt: Date,
  updatedBy: String,
});

module.exports = mongoose.model('Project', Projectchema);
