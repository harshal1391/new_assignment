const APIError = require("../helpers/APIError");
const resPattern = require("../helpers/resPattern");
const httpStatus = require("http-status");
const db = require("../server");
const userColl = db.collection("users");
const query = require("../query/query");
const moment = require("moment");
const { ObjectId } = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const {
  generateOTP,
  sendEmail,
  generatePassword,
} = require("../helpers/commonfile");

const verifyotp = async (req, res, next) => {
  try {
    const requestdata = { emailAddress: req.body.email };
    const userData = await query.findOne(userColl, requestdata);

    if (!userData) {
      const message = `Please Enter valid Email`;
      return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
    }

    if (userData) {
      if (moment().format("YYYY-MM-DDThh:mm:ss") < userData.expireTime) {
        if (userData.otp == req.body.otp) {
          await query.findOneAndUpdate(userColl, requestdata, {
            $set: { status: 1 },
          });
          const message = `Varification code verified sucessfully.`;
          const obj = resPattern.successMessge(httpStatus.OK, message);
          return res.json({
            ...obj,
          });
        } else {
          const message1 = `Verification code doesn't match.`;
          return next(
            new APIError(`${message1}`, httpStatus.BAD_REQUEST, true)
          );
        }
      } else {
        const message2 = `Verification code expired.`;
        return next(new APIError(`${message2}`, httpStatus.BAD_REQUEST, true));
      }
    } else {
      const message3 = `mail does not exist.`;
      return next(new APIError(`${message3}`, httpStatus.BAD_REQUEST, true));
    }
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const requestdata = { emailAddress: req.body.email };
    //find user
    const userData = await query.findOne(userColl, requestdata);
    if (!userData) {
      const message = `Please Enter valid Email`;
      return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
    }

    if (userData) {
      const otp = generateOTP();

      await query.findOneAndUpdate(userColl, requestdata, {
        $set: {
          otp: otp,
          expireTime: moment().add(10, "minutes").format("YYYY-MM-DDThh:mm:ss"),
        },
      });

      const toEmail = req.body.email;
      const emailBody = `<div>OTP: ${otp}</div>`;
      const title = `OTP For ForgotPassword`;

      await sendEmail(toEmail, title, emailBody);

     // send response
      const message = `Email sent successfully.`;
     // const message = `OTP: ${otp}`;
      const obj = resPattern.successMessge(httpStatus.OK, message);
      return res.json({
        ...obj,
      });
    } else {
      const message = `User not found with email: '${userData.emailAddress}.`;
      return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
    }
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const requestdata = { emailAddress: req.body.email };

    const userData = await query.findOne(userColl, requestdata);

    if (!userData) {
      const message = `Please Enter valid Email.`;
      return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
    }

    if (moment().format("YYYY-MM-DDThh:mm:ss") < userData.expireTime) {
      if (req.body.otp == userData.otp) {
        const newPass = generatePassword(req.body.resetPassword);
        await query.findOneAndUpdate(userColl, requestdata, {
          $set: { password: newPass },
        });

        const message = `Password Reset Successfully.`;
        const obj = resPattern.successMessge(httpStatus.OK, message);
        return res.json({
          ...obj,
        });
      } else {
        const message = `Verification code doesn't match.`;
        return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
      }
    } else {
      const message = `Verification code expired.`;
      return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
    }
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

const changePassword = async (req, res, next) => {
  try {
    const requestdata = { emailAddress: req.body.email };

    const user = await query.findOne(userColl, requestdata);

    let oldPass = req.body.oldPass;
    let newPass = req.body.newPass;

    const isMatch = await bcrypt.compare(oldPass, user.password);

    if (isMatch) {
      let encNewPass = generatePassword(newPass);

      const updateduser = await query.findOneAndUpdate(
        userColl,
        { emailAddress: user.emailAddress },
        { $set: { password: encNewPass } },
        { returnOriginal: false }
      );

      let obj = resPattern.successPattern(
        httpStatus.OK,
        updateduser,
        "success"
      );
      return res.status(obj.code).json(obj);
    } else {
      const message = "Old Password Not Match !!! ";
      return next(new APIError(`${message}`, httpStatus.UNAUTHORIZED, true));
    }
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

module.exports = {
  verifyotp,
  forgotPassword,
  resetPassword,
  changePassword,
};
