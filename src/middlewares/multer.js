/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */

// Packages
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

/* -------------------------------------------------------------------------- */
/*                                Disk Storage                                */
/* -------------------------------------------------------------------------- */

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(path.join(__dirname, '../../uploads/'))) {
      execSync(`mkdir "${path.join(__dirname, '../../uploads/')}"`);
    }
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const fileName = file.fieldname + '-' + Date.now() + '-' + file.originalname;
    cb(null, fileName);
  },
  fileFilter: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.gif') {
      return cb(new Error('Seules les images sont autorisées'));
    }
    cb(null, true);
  },
});

/* ---------------------------------- CONST --------------------------------- */
const upload = multer({ storage: storage });
const fileUpload = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'gallery', maxCount: 30 },
]);

// Multer config
module.exports = { fileUpload };
