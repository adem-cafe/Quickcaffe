/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */

// Packages
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  let token = req.headers['access_token'] || req.headers['authorization'];

  if (token) {
    // it's optional => to delete Bearer from token
    let checkBearer = 'Bearer ';
    if (token.startsWith(checkBearer)) {
      token = token.slice(checkBearer.length, token.length);
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        res.status(403).json({
          success: false,
          message: "Échec de l'authentification",
        });
      } else {
        req.decoded = decoded; // decoded is simply user {}
        next();
      }
    });
  } else {
    res.status(403).json({
      success: false,
      message: 'Aucun Token fourni',
    });
  }
};
