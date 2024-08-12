/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* -------------------------------------------------------------------------- */
/*                                 FAQ Schema                                 */
/* -------------------------------------------------------------------------- */
const SliderSchema = new Schema({
  en: {
    label: String,
    description: String,
  },
  fr: {
    label: String,
    description: String,
  },
  photo: String,
  isDisplayed: Boolean,
  created_at: { type: Date, required: true },
  created_by: { type: String, required: true },
  update_by: String,
  update_at: Date,
  article: {
    type: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      theme: { type: String, required: true },
    },
    required: true,
  },
});

// export Achievement Schema
module.exports = mongoose.model('slider', SliderSchema);
