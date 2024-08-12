/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Packages
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');

// Models
const User = require('../models/userModel');

// Token
const jwt = require('jsonwebtoken');

// Email Template
const {
  forgotPasswordEmailTemplate,
  resetPasswordConfirmationEmailTemplate,
} = require('../template/userAccountEmailTemplates');

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */
// Email
const FROM_EMAIL = process.env.MAILER_EMAIL_ID;
const AUTH_PASSWORD = process.env.MAILER_PASSWORD;

// API URL
const API_ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? process.env.PRODUCTION_API_URL
    : process.env.DEVELOPMENT_API_URL;

// create reusable transporter object using the default SMTP transport
var smtpTransport = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.PORT_SSL,
  secure: false, // true for 465, false for other ports
  service: process.env.MAILER_SERVICE_PROVIDER,
  auth: {
    user: FROM_EMAIL,
    pass: AUTH_PASSWORD,
  },
});

/* -------------------------------------------------------------------------- */
/*                               Auth Controller                              */
/* -------------------------------------------------------------------------- */
/**
 * Check if we have the email in out db or not
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const checkExistEmail = async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({
      success: false,
      message: `Aucun utilisateur n'a été trouvé avec l'adresse e-mail fournie`,
    });
  }

  const foundUser = await User.findOne({ email: req.body.email });

  if (foundUser) {
    return res.status(200).json({
      success: true,
    });
  }

  return res.status(404).json({
    success: false,
    message: `Aucun utilisateur n'a été trouvé avec l'adresse e-mail fournie`,
  });
};

/**
 * Sing up new user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const signUp = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez saisir votre email ou votre mot de passe',
    });
  } else {
    try {
      let newUser = new User();
      newUser.email = req.body.email;
      newUser.password = req.body.password;
      newUser.fullName = req.body.fullName;
      newUser.gender = req.body.gender;
      newUser.phoneNumber = req.body.phoneNumber;
      newUser.is_active = req.body.is_active ?? false;
      newUser.is_admin = req.body.is_admin ?? false;
      newUser.is_manager = req.body.is_manager ?? true;
      newUser.confirmationCode = crypto.randomBytes(20).toString('hex');

      await newUser.save();

      // response
      res.status(201).json({
        success: true,
        message: "L'utilisateur a été enregistré avec succès !",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

/**
 * Sing in with an existing account
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const signIn = async (req, res) => {
  try {
    let foundUser = await User.findOne({ email: req.body.email }); // to check for email

    // if email doesn't exist

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "Échec de l'authentification, utilisateur introuvable",
      });
    } else {
      // check password
      if (foundUser.comparePassword(req.body.password)) {
        // if password is correct
        if (foundUser.is_active === true) {
          let token = jwt.sign(foundUser.toJSON(), process.env.SECRET, {
            expiresIn: 604800, // 1 week
          });

          return res.status(200).json({
            success: true,
            token: token,
            user: foundUser,
          });
        } else {
          return res.status(405).json({
            success: false,
            message:
              "Votre compte n'est pas activé ! Merci de contactez l'administrateur",
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: "Échec de l'authentification, Mot de passe erroné",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Une erreur s'est produite lors de l'authentification.",
    });
  }
};

/**
 * Send Email to reset password
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const forgotPassword = function (req, res) {
  async.waterfall(
    [
      function (done) {
        User.findOne({
          email: req.body.email,
        }).exec(function (err, user) {
          if (user) {
            done(err, user);
          } else {
            res
              .status(404)
              .json({ success: false, message: 'Utilisateur non trouvé.' });
          }
        });
      },
      function (user, done) {
        // create the random token
        crypto.randomBytes(20, function (err, buffer) {
          var token = buffer.toString('hex');
          done(err, user, token);
        });
      },

      function (user, token, done) {
        User.findByIdAndUpdate(
          { _id: user._id },
          {
            resetPasswordToken: token,
            resetPasswordExpires: Date.now() + 3600000, // token expire in 1h
          },
          { new: true },
        ).exec(function (err, new_user) {
          done(err, token, new_user);
        });
      },
      function (token, user, done) {
        // email template
        const template = forgotPasswordEmailTemplate(
          user.fullName,
          user.email,
          API_ENDPOINT,
          token,
        );
        // config data for emailing
        var data = {
          from: FROM_EMAIL,
          to: user.email,
          subject: 'Reinitialisation de votre mot de passe',
          html: template,
        };
        // send email
        smtpTransport.sendMail(data, function (err) {
          if (!err) {
            return res.status(200).json({
              success: true,
              token: token,
              message:
                "Veuillez vérifier votre e-mail pour plus d'instructions",
            });
          } else {
            return done(err);
          }
        });
      },
    ],
    function () {
      res.status(500).json({ success: false, message: 'Erreur de serveur.' });
    },
  );
};

/**
 * Reset password
 */
const resetPassword = function (req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  }).exec(function (err, user) {
    if (!err && user) {
      // Verify if we got the same password
      if (req.body.newPassword === req.body.verifyPassword) {
        user.password = req.body.newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.save(function (err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message,
            });
          } else {
            const template = resetPasswordConfirmationEmailTemplate(
              user.fullName,
            );
            var data = {
              to: user.email,
              from: process.env.FROM_EMAIL,
              subject: 'Confirmation de réinitialisation du mot de passe',
              html: template,
            };

            smtpTransport.sendMail(data, function (err) {
              if (!err) {
                return res.status(200).json({
                  success: true,
                  message: 'Réinitialisation du mot de passe réussie',
                });
              } else {
                return res.status(500).json({
                  success: false,
                  message: err.message,
                });
              }
            });
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Les mots de passe ne correspondent pas',
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message:
          'Le token de réinitialisation du mot de passe est invalide ou a expiré',
      });
    }
  });
};

/* -------------------------------------------------------------------------- */
/*                               User Controller                              */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves current user object
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getCurrentUser = async (req, res) => {
  try {
    const foundUser = await User.findOne({ _id: req.decoded._id }).exec();

    if (!foundUser) {
      return res.status(401).json({
        success: false,
        message: "Échec de l'authentification de l'utilisateur",
      });
    }

    res.status(200).json({
      success: true,
      user: foundUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update current user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const updateUserById = async (req, res) => {
  try {
    const currentuser = await User.findOne({ _id: req.params.id }).exec();
    const userUpdate = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          email: req.body.email ? req.body.email : currentuser.email,
          fullName: req.body.fullName
            ? req.body.fullName
            : currentuser.fullName,
          phoneNumber: req.body.phoneNumber
            ? req.body.phoneNumber
            : currentuser.phoneNumber,
          gender: req.body.gender ? req.body.gender : currentuser.gender,
          is_active: req.body.is_active
            ? req.body.is_active
            : currentuser.is_active,
        },
      },
      { new: true },
    ).exec();
    res.status(200).json({
      success: true,
      updatedPost: userUpdate,
      message: 'Utilisateur mis à jour avec succès',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get User by Id
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Retrieves all users
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getAllUsers = async (req, res) => {
  try {
    const userList = await User.find();

    res.status(200).json({
      success: true,
      users: userList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const deleteUser = async (req, res) => {
  try {
    const currentUser = await User.findOne({ _id: req.decoded._id }).exec();

    if (currentUser.is_admin) {
      const deletedUser = await User.findOneAndDelete({ _id: req.params.id });

      if (deletedUser) {
        res.status(200).json({
          success: true,
          message: "L'utilisateur a été supprimée avec succès",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "L'utilisateur n'a pas été trouvé",
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à supprimer cet utilisateur",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                               ACCOUNT SETTING                              */
/* -------------------------------------------------------------------------- */

/**
 * Disable User account
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const disableAccount = async (req, res) => {
  try {
    await User.findOneAndUpdate({ _id: req.params.id }, { is_active: false });
    res.json({
      success: true,
      message: 'Compte a été désactivé',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Enable User account
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const enableAccount = async (req, res) => {
  try {
    await User.findOneAndUpdate({ _id: req.params.id }, { is_active: true });
    res.json({
      success: true,
      message: 'Compte a été activé',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export module
module.exports = {
  checkExistEmail,
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  getUserById,
  updateUserById,
  disableAccount,
  enableAccount,
  getAllUsers,
  deleteUser,
};
