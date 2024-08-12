/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Models
const FaqModel = require('../models/faqModel');

/* -------------------------------------------------------------------------- */
/*                             SLIDER CONTROLLERS                             */
/* -------------------------------------------------------------------------- */

/**
 *  Get All modals by language and query term (optional) FAQs + Sliders + Articles (displayed) + Achievements (displayed)
 * @param {Object} req
 * @param {Object} res
 * @returns
 */
const getItems = async (req, res) => {
  const { query_term } = req.query;
  let lang = req.headers.lang;

  try {
    const items = await FaqModel.aggregate([
      {
        $match: {
          $or: [
            { [`${lang}.question`]: { $regex: query_term, $options: 'i' } },
            { [`${lang}.answer`]: { $regex: query_term, $options: 'i' } },
          ],
        },
      },
      {
        $project:
          lang !== undefined
            ? lang === 'en'
              ? { fr: 0 }
              : { en: 0 }
            : { __v: 0 },
      },
      {
        $facet: {
          FAQs: [
            {
              $project: {
                _id: 1,
                question: `$${lang}.question`,
                answer: `$${lang}.answer`,
              },
            },
          ],
          sliders: [
            {
              $unionWith: {
                coll: 'articles',
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          isdisplayed: true
                        },
                        {
                          $or: [
                            {
                              [`content.${lang}.title`]: {
                                $regex: query_term,
                                $options: 'i',
                              },
                            },
                            {
                              [`content.${lang}.context`]: {
                                $regex: query_term,
                                $options: 'i',
                              },
                            },
                          ],
                        }
                      ]
                    },
                  },
                  {
                    $project:
                      lang !== undefined
                        ? lang === 'en'
                          ? { fr: 0 }
                          : { en: 0 }
                        : { __v: 0 },
                  },
                  {
                    $project: {
                      _id: 1,
                      label: `$content.${lang}.title`,
                      description: `$content.${lang}.context`,
                    },
                  },
                ],
              },
            },
          ],
          achievements: [
            {
              $unionWith: {
                coll: 'achivements',
                pipeline: [
                  {
                    $match: {
                      $or: [
                        {
                          [`${lang}.label`]: {
                            $regex: query_term,
                            $options: 'i',
                          },
                        },
                      ],
                    },
                  },
                  {
                    $project:
                      lang !== undefined
                        ? lang === 'en'
                          ? { fr: 0 }
                          : { en: 0 }
                        : { __v: 0 },
                  },
                  {
                    $project: {
                      _id: 1,
                      statistics: `$statistics`,
                      label: `$${lang}.label`,
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ]);


    return res.status(200).json({ items: items });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// export module
module.exports = {
  getItems,
};
