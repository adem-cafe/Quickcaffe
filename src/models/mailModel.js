/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* -------------------------------------------------------------------------- */
/*                                 Mail Schema                                 */
/* -------------------------------------------------------------------------- */
const MailSchema = new Schema({
  name : { type: String, required: true },
  senderAddress : { type: String, required: true },
  recieverAddress : { type: String, required: true },
  numTel : { type: String, required: true },
  subject : { type: String, required: true },
  message : { type: String, required: true },
  date : { type: String, required: true },
  time : { type: String, required: true },
  type : { type: String, required: true },
});

// export Mail Schema
module.exports = mongoose.model('Mail', MailSchema);
