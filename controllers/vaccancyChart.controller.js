const APIError = require("../helpers/APIError");
const resPattern = require("../helpers/resPattern");
const httpStatus = require("http-status");
const db = require("../server");
const query = require("../query/query");
const moment = require("moment");
const ObjectId = require("mongodb").ObjectId;
const userColl = db.collection("users");
const vaccancyColl = db.collection("vaccancy");

const createVaccancyChart = async (req, res, next) => {
  try {
    let vaccancy = req.body;

    if (!vaccancy.startDate) {
      vaccancy.startDate = moment().format("YYYY-MM-DD");
    } else if (moment(vaccancy.startDate).isBefore(moment(), "day")) {
      return next(
        new APIError(
          'Start date cannot be in past.',
          httpStatus.BAD_REQUEST,
          true
        )
      );
    }

    if (!vaccancy.endDate) {
      vaccancy.endDate = moment(vaccancy.startDate)
        .add(180, "days")
        .format("YYYY-MM-DD");
    } else if (moment(vaccancy.endDate).isBefore(moment(vaccancy.startDate))) {
      return next(
        new APIError(
          'End date cannot be before start date',
          httpStatus.BAD_REQUEST,
          true
        )
      );
    }

    const insertdata = await query.insert(vaccancyColl, vaccancy);
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
const deleteVaccancy = async (req, res, next) => {
  try {
    let deleteId = ObjectId(req.params.id);
    const deleteVaccancy = await query.findOneAndUpdate(
      vaccancyColl,
      { _id: deleteId },
      { $set: { isDelete: 1 } },
      { returnOriginal: false }
    );
    const obj = resPattern.successPattern(
      httpStatus.OK,
      deleteVaccancy,
      `success`
    );
    return res.status(obj.code).json({
      ...obj,
    });
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

const updateVaccancy = async (req, res, next) => {
  try {
    let VaccancyId = ObjectId(req.params.id);
    const updateVaccancy = req.body;

    const updatedata = await query.findOneAndUpdate(
      vaccancyColl,
      { _id: VaccancyId },
      { $set: updateVaccancy },
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

const getVaccancyById = async (req, res, next) => {
  try {
    let VaccancyId = ObjectId(req.params.id);
    console.log(req.params.id);
    const findVaccancy = await query.findOne(
      vaccancyColl,
      { _id: VaccancyId },
      { returnOriginal: false }
    );
    console.log(findtechnology);
    const obj = resPattern.successPattern(
      httpStatus.OK,
      findVaccancy,
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
  createVaccancyChart,
  deleteVaccancy,
  updateVaccancy,
  getVaccancyById,
};
