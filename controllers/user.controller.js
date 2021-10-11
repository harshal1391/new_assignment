const APIError = require("../helpers/APIError");
const resPattern = require("../helpers/resPattern");
const httpStatus = require("http-status");
const db = require("../server");
const userColl = db.collection("users");
const query = require("../query/query");
const moment = require("moment");
const bcrypt = require("bcrypt");
//onst { ObjectID } = require("mongodb").ObjectID;
const { generatePassword, getNextSequence } = require("../helpers/commonfile");
const jwt = require("jsonwebtoken");


const createUser = async (req, res, next) => {
  try {
    const userData = { emailAddress: req.body.emailAddress };
    const userEmail = await query.findOne(userColl, userData);

    if (userEmail) {
      const message = `You are already registered with this email`;
      let obj = resPattern.errorPattern(httpStatus.ALREADY_REPORTED, message);
      return res.status(obj.code).json(obj);
    } else {
      if (req.body.type === "Mentor") {
        const mentor = req.body;

        mentor.employeeId = await getNextSequence("employeeId");
        mentor.status = 0;
        mentor.active = true;
        mentor.isDeleted = false;
        mentor.password = generatePassword(req.body.password);

        const insertMentor = await query.insert(userColl, mentor);

        if (insertMentor.acknowledged === true) {
          insertMentor.insertedIds[0].password = undefined;

          const obj = resPattern.successPattern(
            httpStatus.OK,
            insertMentor.insertedIds[0],
            `success`
          );

          return res.status(obj.code).json({
            ...obj,
          });
        } else {
          const message = `Something went wrong, Please try again.`;
          let obj = resPattern.errorPattern(httpStatus.BAD_REQUEST, message);
          return res.status(obj.code).json(obj);
        }
      } else {
        const user = req.body;
        user.employeeId = await getNextSequence("employeeId");
        user.status = 1;
        user.active = true;
        user.password = generatePassword(req.body.password);

        const employee = await query.insert(userColl, user);
        if (employee.acknowledged === true) {
          employee.insertedIds[0].password = undefined;

          const obj = resPattern.successPattern(
            httpStatus.OK,
            employee.insertedIds[0],
            `success`
          );

          return res.status(obj.code).json({
            ...obj,
          });
        } else {
          const message = `Something went wrong, Please try again.`;
          let obj = resPattern.errorPattern(httpStatus.BAD_REQUEST, message);
          return res.status(obj.code).json(obj);
        }
      }
    }
  } catch (err) {
    return next(new APIError(`${err.message}`, httpStatus.BAD_REQUEST, true));
  }
};

// userLogin
const login = async (req, res, next) => {
  try {
    const password = req.body.password;
    const reqData = { emailAddress: req.body.emailAddress };
    // find user
    let user = await query.findOne(userColl, reqData);

    if (!user || user.password == null) {
      const message = `Incorrect email or password.`;
      
      return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    const loginData = async () => {
      if (user.status == 1) {
       // const currentDate = moment().format("YYYY-MM-DDThh:mm:ssn");

         const token = jwt.sign(
           { _id: user._id, firstName: user.firstName, type: user.type },
           process.env.JWT_SECRET,
           { expiresIn: "24h" }
         );

        delete user["password"];
          let obj = resPattern.successPattern(
            httpStatus.OK,
            { user, token },
            "success"
          );
          return res.status(obj.code).json(obj);
      } else {
        const message = `Your Account is not verify.`;
        return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
      }
    };

    if (isMatch) {
      if (user.type == "Mentor") {
      let userdata = {
        _id: user._id,
        emailAddress: user.emailAddress,
        firstName: user.firstName,
        type: user.type,
        status: user.status,
        createdAt: user.createdAt,
      };
       const token = jwt.sign(
         { _id: user._id, firstName: user.firstName, type: user.type },
         process.env.JWT_SECRET
       );

      delete user["password"];
      let obj = resPattern.successPattern(
        httpStatus.OK,
        { userdata, token },
        "success"
      );
     return res.status(obj.code).json(obj);
      } else {
        loginData();
      }
    } else {
      const message = `Incorrect email or password.`;
      console.log(message);
      return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
    }
  }
   catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }

};

module.exports = {
  createUser,
  login,
};
