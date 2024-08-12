const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

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
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  const res = await gmail.users.labels.list({
    userId: 'me',
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log('No labels found.');
    return;
  }
  console.log('Labels:');
  labels.forEach((label) => {
    console.log(`- ${label.name}`);
  });
}
async function getMessageContent(auth, messageId) {
  const gmail = google.gmail({version: 'v1', auth});
  try {
    const res = await gmail.users.messages.get({
      auth: auth,
      userId: 'me',
      id: messageId,
    });

    const message = res.data;
    const headers = message.payload.headers;
    const subject = headers.find((header) => header.name === 'Subject').value;
    const body = message.snippet;

    console.log('Message Subject:', subject);
    console.log('Message Body:', body);
  } catch (err) {
    console.error('Error retrieving message content:', err);
  }
}

async function getThreadContent(auth, threadId) {
  const gmail = google.gmail({version: 'v1', auth});
  try {
    const res = await gmail.users.threads.get({
      auth: auth,
      userId: 'me',
      id: threadId,
    });

    const thread = res.data;
    const messages = thread.messages;

    console.log('Thread Messages:');
    messages.forEach((message) => {
      const headers = message.payload.headers;
      const subject = headers.find((header) => header.name === 'Subject').value;
      const body = message.snippet;

      console.log(' - Message Subject:', subject);
      console.log(' - Message Body:', body);
    });
  } catch (err) {
    console.error('Error retrieving thread content:', err);
  }
}

async function listInboxMessages(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  try {
    const res = await gmail.users.messages.list({
      auth: auth,
      userId: 'me',
      labelIds: ['INBOX'],
    });

    const messages = res.data.messages;
    if (messages && messages.length) {
      console.log('Inbox Messages:');
      messages.forEach((message) => {
        console.log(' - Message:', message);
        getThreadContent(auth, message.threadId);
      });
    } else {
      console.log('No messages found in the Inbox.');
    }
  } catch (err) {
    console.error('Error retrieving Inbox messages:', err);
  }
}


authorize().then(listInboxMessages).catch(console.error);

authorize().then(listLabels).catch(console.error);
