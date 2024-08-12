/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* -------------------------------------------------------------------------- */
/*                               ARTICLE SCHEMA                               */
/* -------------------------------------------------------------------------- */
const ArticleSchema = new Schema({
  content: [
    {
      en: {
        title: { type: String, required: true },
        context: { type: String, required: true },
      },
      fr: {
        title: { type: String, required: true },
        context: { type: String, required: true },
      },
      gallery: [String],
      galleryStyle: Number,
      contentOrder: Number,
    },
  ],
  created_at: { type: Date, required: true },
  created_by: { type: String, required: true },
  updated_at: Date,
  updated_by: String,
  theme: { type: String, required: true },
  rubric: { type: String, required: true },
  isdisplayed: { type: Boolean, required: true },
  displayInSlider: { type: Boolean, required: true },
  slider: {
    label_en: { type: String, required: true },
    label_fr: { type: String, required: true },
    description_en: { type: String, required: true },
    description_fr: { type: String, required: true },
    photo: { type: String, required: true },
  },
});

// export Article Schema
module.exports = mongoose.model('ARTICLE', ArticleSchema);
