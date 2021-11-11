const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");
const multer = require("multer");
//const multerS3 = require("multer-s3");
const path = require("path");
const dotenv = require("dotenv");
const db = require("../server");
const sequence = db.collection("sequence");
const query = require("../query/query");
//const { v4: uuidv4 } = require("uuid");
//const s3 = require("../config/awsS3");
var __basedir = path.resolve();

dotenv.config();

// bcrypt password
const validPassword = (dbPassword, passwordToMatch) => {
  return bcrypt.compareSync(passwordToMatch, dbPassword);
};

const safeModel = () => {
  return _.omit(this.toObject(), ["password", "__v"]);
};

const generatePassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// const generateToken = () => {
//     return jwt.sign({
//         _id: this._id,
//         username: this.username,
//         type: this.type
//     }, process.env.JWT_SECRET)
// }

/* Common sequence generator*/
let getNextSequence = async (name) => {
  let check = { _id: name };
  const seq = await query.findOne(sequence, check);

  if (!seq) {
    const insertCounter = await query.insert(sequence, {
      _id: name,
      seq: 0,
    });
  }

  let sequenceIncrement = await query.findOneAndUpdate(
    sequence,
    { _id: name },
    { $inc: { seq: 1 } }
  );

  const counter = await query.findOne(sequence, check);

  return counter.seq;
};

// generateOTP
function generateOTP() {
  const digits = "123456789";
  let otp = "";
  for (let i = 1; i <= 6; i++) {
    let index = Math.floor(Math.random() * digits.length);
    otp = otp + digits[index];
  }
  return otp;
}

// send mail
let sendEmail = async (toEmail, subject, bodyHtml, attachments) => {
  const transporter = nodeMailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    port: 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  // var transporter = nodeMailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: process.env.smtp_username,
  //     pass: process.env.smtp_password,
  //   },
  // });

  let mailOptions = {
    from: "kashu123D@gmail.com",
    to: toEmail,
    subject: subject,
    html: `${bodyHtml}`,
    attachments: attachments,
  };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  console.log("toEmail => ", toEmail);
  console.log("------------------11111111-------------");
  // transporter
  //   .sendMail(mailOptions)
  //   .then((message) => {
  //     console.log("message => ", message);
  //   })
  //   .catch((error) => {
  //     console.log("error => ", error);
  //   });
  console.log("-----------------22222222222---------");
};

//upload s3
// const uploadS3 = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.AWS_BUCKET_NAME,
//     acl: "public-read",
//     key: function (req, file, cb) {
//       const extname = path.extname(file.originalname);
//       const key =
//         path.basename(file.originalname, extname) + "-" + uuidv4() + extname;
//       cb(null, key);
//     },
//   }),
//   limits: { fileSize: 400000 }, // In bytes: 5000000000 bytes = 5 GB  , 400000 bytes = 400kb
// });

const localUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __basedir + "/uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  limits: { fileSize: 400000 },
});

module.exports = {
  validPassword,
  safeModel,
  generatePassword,
  // generateToken,
  generateOTP,
  sendEmail,
  // uploadS3,
  getNextSequence,
  localUpload,
};
