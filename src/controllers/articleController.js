/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const { default: mongoose } = require('mongoose');
const fs = require('fs');

// Models
const ARTICLE_MODEL = require('../models/articleModel');

// helpers
const { getfilteredArrayOfObject } = require('../utils/helpers');

/* -------------------------------------------------------------------------- */
/*                             ARTICLE CONTROLLERS                            */
/* -------------------------------------------------------------------------- */

/**
 * Create new Article
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const createArticle = async (req, res) => {
  try {
    const { created_by, theme, isdisplayed, displayInSlider, slider, rubric } =
      req.body;
    const parsedContent = JSON.parse(req.body.content);
    const parsedSlider = JSON.parse(slider);
    const gallery = req.files?.gallery;
    const photo = req.files?.photo;
    const photoUid = photo ? photo[0].path.replace('\\', '/') || '' : '';
    const galleryWithoutPhoto = gallery?.filter(
      (file) => !file.path.includes('photo'),
    );
    const galleryUids =
      galleryWithoutPhoto?.length > 0
        ? galleryWithoutPhoto.map((file) => file.path.replace('\\', '/')) || []
        : [];
    const galleryOrders = galleryUids.map((item) => {
      const currentOrder = item?.split('/')[1]?.split('.')[0]?.split('-')[3];
      return currentOrder;
    });
    const content = parsedContent.map((c, index) => {
      const result = {
        en: {
          title: c?.en?.title,
          context: c?.en?.context,
        },
        fr: {
          title: c?.fr?.title,
          context: c?.fr?.context,
        },
        gallery: galleryOrders
          .map((item, order) => {
            if (item === `${index}`) return galleryUids[order];
            return '';
          })
          .filter((item) => item !== ''),
        galleryStyle: c?.galleryStyle,
      };
      return result;
    });
    const article = new ARTICLE_MODEL({
      content,
      created_at: Date.now(),
      created_by,
      theme,
      rubric,
      isdisplayed,
      displayInSlider,
      slider: {
        label_en: parsedSlider?.label_en,
        label_fr: parsedSlider?.label_fr,
        description_en: parsedSlider?.description_en,
        description_fr: parsedSlider?.description_fr,
        photo: photoUid ? photoUid : '',
      },
    });

    await article.save();

    res.json({
      status: true,
      message: 'Article a été créé avec succès',
      article: article,
    });
  } catch (error) {
    console.log('createArticle error', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Retrieves all Article
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getAllArticles = async (req, res) => {
  try {
    let lang = req.headers.lang;
    let projection = {};
    if (lang !== undefined) {
      if (lang === 'en') {
        projection['content.fr'] = 0;
      } else {
        projection['content.en'] = 0;
      }
    } else {
      projection.__v = 0;
    }

    let articles = await ARTICLE_MODEL.aggregate([
      { $project: projection },
    ]).exec();

    if (lang !== undefined) {
      articles = articles.map((article) => {
        article.content = article.content.filter(
          (c) => c[lang].title === c[lang].title,
        );
        return article;
      });
    }

    res.json({
      success: true,
      articles: lang ? getfilteredArrayOfObject(articles, lang) : articles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Retrieves a single Article by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getArticleById = async (req, res) => {
  try {
    let lang = req.headers.lang;

    let projection = {};
    if (lang !== undefined) {
      if (lang === 'en') {
        projection['content.fr'] = 0;
      } else {
        projection['content.en'] = 0;
      }
    } else {
      projection.__v = 0;
    }

    let article = await ARTICLE_MODEL.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
      { $project: projection },
    ]).exec();

    if (lang !== undefined) {
      article[0].content = article[0].content.filter(
        (c) => c[lang].title === c[lang].title,
      );
    }

    res.json({
      success: true,
      article: lang ? getfilteredArrayOfObject(article, lang) : article,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * Update a single Article
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const updateArticle = async (req, res) => {
  try {
    /* -------------------------------------------------------------------------- */
    let currentArticle = await ARTICLE_MODEL.findOne({ _id: req.params.id });
    if (!currentArticle) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    const { created_by, isdisplayed, displayInSlider, rubric, theme } =
      req.body;
    console.log('req.body', req.body.theme);
    const parsedContent =
      typeof req.body.content === 'object'
        ? req.body.content
        : JSON.parse(req.body.content);
    let vargallery = [];
    let currentgallery = parsedContent
      ?.map((item) => {
        if (item?.gallery?.length > 0) {
          vargallery = item?.gallery?.map((img) => {
            return img?.uid;
          });
          return vargallery;
        }
        return null;
      })
      .filter((item) => item !== null)
      .flat();
    const parsedSlider =
      typeof req.body.slider === 'object'
        ? req.body.slider
        : JSON.parse(req.body.slider);
    const gallery = req.files?.gallery;
    const photo = req.files?.photo;
    const photoUid = photo ? photo[0].path.replace('\\', '/') || '' : '';
    const galleryWithoutPhoto = gallery?.filter(
      (file) => !file.path.includes('photo'),
    );
    let galleryUids =
      galleryWithoutPhoto?.length > 0
        ? galleryWithoutPhoto.map((file) => file.path.replace('\\', '/')) || []
        : [];
    if (currentgallery.length > 0) {
      galleryUids = [...currentgallery, ...galleryUids];
    }
    const galleryOrders = galleryUids.map((item) => {
      const currentOrder = item?.split('/')[1]?.split('.')[0]?.split('-')[3];
      return currentOrder;
    });

    const content = parsedContent.map((c, index) => {
      const result = {
        en: {
          title: c?.en?.title || currentArticle.content[index]?.en?.title,
          context: c?.en?.context || currentArticle.content[index]?.en?.context,
        },
        fr: {
          title: c?.fr?.title || currentArticle.content[index]?.fr?.title,
          context: c?.fr?.context || currentArticle.content[index]?.fr?.context,
        },
        gallery: [
          ...c?.gallery.map((item) => {
            if (typeof item === 'string') return item;
            return null;
          }),
          ...galleryOrders
            .map((item, order) => {
              if (item === `${index}`) return galleryUids[order];
              return '';
            })
            .filter((item) => item !== ''),
        ],
        galleryStyle:
          c?.galleryStyle || currentArticle.content[index]?.galleryStyle,
      };
      return result;
    });
    const article = new ARTICLE_MODEL({
      content,
      created_at: Date.now(),
      created_by,
      isdisplayed,
      theme,
      rubric,
      displayInSlider,
      slider: {
        label_en: parsedSlider?.label_en || currentArticle.slider?.label_en,
        label_fr: parsedSlider?.label_fr || currentArticle.slider?.label_fr,
        description_en:
          parsedSlider?.description_en || currentArticle.slider?.description_en,
        description_fr:
          parsedSlider?.description_fr || currentArticle.slider?.description_fr,
        photo: photoUid ? photoUid : currentArticle.slider?.photo,
      },
    });
    /* -------------------------------------------------------------------------- */
    let updatedArticle = await ARTICLE_MODEL.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          content: article?.content,
          updated_at: Date.now(),
          updated_by: created_by,
          theme,
          isdisplayed,
          displayInSlider,
          slider: article?.slider || currentArticle?.slider,
          rubric,
        },
      },
      { new: true },
    );
    res.json({
      success: true,
      updatedArticle: updatedArticle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Article by Id
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const deleteArticle = async (req, res) => {
  try {
    const deletedArticle = await ARTICLE_MODEL.findOneAndDelete({
      _id: req.params.id,
    });

    if (deletedArticle) {
      res.status(200).json({
        status: true,
        message: 'Article has been deleted successfully',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export module
module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,
  deleteArticle,
  updateArticle,
};
