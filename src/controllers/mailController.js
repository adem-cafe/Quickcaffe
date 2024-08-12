const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
// Models
const mailModel = require('../models/mailModel');
const nodemailer = require('nodemailer');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    console.log('result', client);
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  console.log('result', client);
  return client;
}

async function getMessageContent(auth, messageId) {
  const gmail = google.gmail({ version: 'v1', auth });
  try {
    const res = await gmail.users.messages.get({
      auth: auth,
      userId: 'me',
      id: messageId,
      format: 'full', // Request full message content
    });

    const message = res.data;
    const headers = message.payload.headers;
    const subject = headers.find((header) => header.name === 'Subject').value;
    const body = message.payload.body;

    console.log('Message Subject:', subject);
    console.log('Message Body:', body);
    console.log(
      'Message:',
      Buffer.from(body?.data, 'base64').toString('utf-8'),
    );
    return body;
  } catch (err) {
    console.error('Error retrieving message content:', err);
  }
}

async function getThreadContent(auth, threadId) {
  const gmail = google.gmail({ version: 'v1', auth });
  try {
    const res = await gmail.users.threads.get({
      auth: auth,
      userId: 'me',
      id: threadId,
    });

    const thread = res.data;
    const messages = thread.messages;
    const threadContent = [];

    messages.forEach((message) => {
      getMessageContent(auth, message.id);
      const headers = message.payload.headers;
      const subject = headers.find((header) => header.name === 'Subject').value;
      const body = message.snippet;
      const messageId = message.id;
      const date = new Date(parseInt(message.internalDate)).toISOString();

      // Extract sender information
      const fromHeader = headers.find((header) => header.name === 'From');
      const senderName = fromHeader
        ? fromHeader.value.split('<')[0].trim()
        : '';
      const senderEmail = fromHeader ? fromHeader.value.trim() : '';

      // Extract receiver information
      const toHeader = headers.find((header) => header.name === 'To');
      const receiverName = toHeader ? toHeader.value.split('<')[0].trim() : '';
      const receiverEmail = toHeader ? toHeader.value.trim() : '';

      // Extract additional attributes as needed
      const ccHeader = headers.find((header) => header.name === 'Cc');
      const bccHeader = headers.find((header) => header.name === 'Bcc');

      const cc = ccHeader ? ccHeader.value.trim() : '';
      const bcc = bccHeader ? bccHeader.value.trim() : '';

      const phoneNumber = body.match(/\d{3}-\d{3}-\d{4}/)?.[0] || '';

      const messageObject = {
        id: messageId,
        subject: subject,
        body: body,
        threadId: threadId,
        date: date,
        sender: {
          name: senderName,
          email: senderEmail,
        },
        receiver: {
          name: receiverName,
          email: receiverEmail,
        },
        cc: cc,
        bcc: bcc,
        phoneNumber: phoneNumber,
      };

      threadContent.push(messageObject);
    });

    return threadContent;
  } catch (err) {
    console.error('Error retrieving thread content:', err);
  }
}

async function listInboxMessages(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  try {
    const res = await gmail.users.messages.list({
      auth: auth,
      userId: 'me',
      labelIds: ['INBOX'],
    });

    const messages = res.data.messages;
    if (messages && messages.length) {
      const threadPromises = messages.map((message) =>
        getThreadContent(auth, message.threadId),
      );
      const threadContents = await Promise.all(threadPromises);
      return threadContents;
    } else {
      console.log('No messages found in the Inbox.');
      return [];
    }
  } catch (err) {
    console.error('Error retrieving Inbox messages:', err);
    return [];
  }
}

/* -------------------------------------------------------------------------- */
// Email
const FROM_EMAIL = process.env.MAILER_EMAIL_ID;
const AUTH_PASSWORD = process.env.MAILER_PASSWORD;

/**
 * Create new Mail
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const createMail = async (req, res) => {
  try {
    const {
      name,
      senderAddress,
      receiverAddress,
      numTel,
      subject,
      message,
      date,
      time,
      type,
    } = req.body;
    let Mail = new mailModel();
    Mail.name = name;
    Mail.senderAddress = senderAddress;
    Mail.recieverAddress = receiverAddress;
    Mail.numTel = numTel;
    Mail.subject = subject;
    Mail.message = message;
    Mail.date = date;
    Mail.time = time;
    Mail.type = type;

    // Save the new Mail
    await Mail.save();

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      // Configure the transporter options (e.g., SMTP server details)
      // Example configuration for Gmail:
      service: 'Gmail',
      auth: {
        user: FROM_EMAIL,
        pass: AUTH_PASSWORD,
      },
    });

    // Define the email template
    const mailOptions = {
      from: senderAddress,
      to: receiverAddress,
      subject: subject,
      text: message,
      html: `<h1>${subject}</h1><p>${message}</p>`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        // Send error response
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Erreur lors de l'envoi du courrier électronique",
          error: error.message,
        });
      } else {
        // Send success response
        res.status(201).json({
          id: Mail._id,
          success: true,
          message: 'Mail créée avec succès',
        });
      }
    });
  } catch (error) {
    // Send error response
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la Mail',
      error: error.message,
    });
  }
};

/**
 * Retrieves all Mail
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getAllMails = async (req, res) => {
  try {
    console.log('// ----------------- getAllMails ----------------- //');
    /**
     * Retrieves all Mail by language (english or french)
     */
    let MailListGoogle;
    const auth = await authorize();
    MailListGoogle = await listInboxMessages(auth);
    let MailList = await mailModel.find();
    if (MailList) {
      res.status(200).json({
        success: true,
        Mail: MailList,
        MailListGoogle: MailListGoogle,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(403).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Retrieves a single Mail by ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getMailById = async (req, res) => {
  try {
    // Return single Mail
    let Mail = await mailModel.findById(req.params.id);
    res.json({
      success: true,
      Mail: Mail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Mail by Id
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const deleteMail = async (req, res) => {
  try {
    const deletedMail = await mailModel.findOneAndDelete({
      _id: req.params.id,
    });

    if (!deletedMail) {
      return res.status(404).json({
        success: false,
        message: 'Mail introuvable',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mail à été supprimé avec succès',
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
  createMail,
  getAllMails,
  getMailById,
  deleteMail,
};
