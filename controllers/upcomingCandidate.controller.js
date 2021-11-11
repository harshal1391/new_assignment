const APIError = require("../helpers/APIError");
const resPattern = require("../helpers/resPattern");
const httpStatus = require("http-status");
const db = require("../server");
const query = require("../query/query");
const moment = require("moment");
const ObjectId = require("mongodb").ObjectId;
const upcomingCandidateColl = db.collection("upcomingCandidate");

const createUpcomingCandidate = async (req, res, next) => {
  try {
    let upcomingCandidate = req.body;

    const insertdata = await query.insert(
      upcomingCandidateColl,
      upcomingCandidate
    );
    if (insertdata.acknowledged) {
      const obj = resPattern.successPattern(
        httpStatus.OK,
        insertdata.insertedIds[0],
        `success`
      );
      return res.status(obj.code).json({
        ...obj,
      });
    } else {
      return next(
        new APIError(
          `Something went wrong, Please try again.`,
          httpStatus.BAD_REQUEST,
          true
        )
      );
    }
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};
const updateUpcomingCandidate = async (req, res, next) => {
  try {
    let upcomingCandidateId = ObjectId(req.params.id);
    const updateUpcomingCandidate = req.body;

    const updatedata = await query.findOneAndUpdate(
      upcomingCandidateColl,
      { _id: upcomingCandidateId },
      { $set: updateUpcomingCandidate },
      { returnOriginal: false }
    );
    console.log(updatedata);
    const obj = resPattern.successPattern(
      httpStatus.OK,
      updatedata.value,
      `success`
    );
    return res.status(obj.code).json({
      ...obj,
    });
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

const getCandiadateById = async (req, res, next) => {
  try {
    let upcomingCandidateId = ObjectId(req.params.id);
    console.log(req.params.id);
    const findCandidate = await query.findOne(
      upcomingCandidateColl,
      { _id: upcomingCandidateId },
      { returnOriginal: false }
    );
    
    const obj = resPattern.successPattern(
      httpStatus.OK,
      findCandidate,
      `success`
    );
    return res.status(obj.code).json({
      ...obj,
    });
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};


module.exports = {
  createUpcomingCandidate,
  updateUpcomingCandidate,
  getCandiadateById,
};