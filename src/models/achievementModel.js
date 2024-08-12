/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* -------------------------------------------------------------------------- */
/*                                 FAQ Schema                                 */
/* -------------------------------------------------------------------------- */
const AchivementSchema = new Schema({
  en: {
    label: { type: String, required: true },
  },
  fr: {
    label: { type: String, required: true },
  },
  statistics: { type: Number, required: true },
});

// export Achievement Schema
module.exports = mongoose.model('achivement', AchivementSchema);
