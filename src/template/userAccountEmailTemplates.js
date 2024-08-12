/**
 * Send Email to reset password
 * @param {String} fullName User full name
 * @param {*} email User email
 * @param {String} API_ENDPOINT Depend on the app running localy or server
 * @param {String} token Generated unique code
 * @returns
 */
const forgotPasswordEmailTemplate = (fullName, email, API_ENDPOINT, token) => `
<!DOCTYPE html>
<html>
  <head>
    <title>
      Reinitialisation de votre mot de passe
    </title>
  </head>
  <body>
    <div>
      <p>Bonjour ${fullName},</p>
      <p>
        Vous avez récemment fait une demande de réinitialisation du mot de passe
        de votre compte : ${email}
      </p>
      <p>
        Cliquez sur le lien ci-dessous pour commencer le processus de
        réinitialisation.
      </p>
      <a href="${API_ENDPOINT}/admin/auth/reset-password/${token}">
        Réinitialisation de mot de passe
      </a>
      <p>Cordialement.</p>
      <br />
      <p>L'équipe Orange Fondation Tunisie.</p>
    </div>
  </body>
</html>
`;

/**
 * Confirmation email after successful reset password
 * @param {String} fullName User full name
 * @returns
 */
const resetPasswordConfirmationEmailTemplate = (fullName) => `
<!DOCTYPE html>
<html>
  <head>
    <title>
      Confirmation de réinitialisation du mot de passe
    </title>
  </head>
  <body>
    <div>
      <p>Bonjour ${fullName},</p>
      <p>Votre mot de passe a été réinitialisé avec succès.</p>
      <p>
        Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
      </p>
      <p>Cordialement.</p>
      <br />
      <p>L'équipe Orange Fondation Tunisie.</p>
    </div>
  </body>
</html>
`;

/**
 * Email Template
 */
const standardTemplate = (body) => `
<!DOCTYPE html>
<html>
  <head>
   <div></div>
  </head>
  <body>
    <div>
      ${body}
    </div>
  </body>
</html>
`;

// export module
module.exports = {
  forgotPasswordEmailTemplate,
  resetPasswordConfirmationEmailTemplate,
  standardTemplate,
};
