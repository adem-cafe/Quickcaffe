/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* -------------------------------------------------------------------------- */
/*                                 FAQ Schema                                 */
/* -------------------------------------------------------------------------- */
const FAQSchema = new Schema({
  en: {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  fr: {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
});

// export Question And Answer Schema
module.exports = mongoose.model('FAQ', FAQSchema);
