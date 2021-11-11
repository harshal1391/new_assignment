const APIError = require("../helpers/APIError");
const resPattern = require("../helpers/resPattern");
const httpStatus = require("http-status");
const db = require("../server");
const query = require("../query/query");
const moment = require("moment");
const ObjectId = require("mongodb").ObjectId;
const technologyColl = db.collection("technology");
const projectColl = db.collection("projects");

const createtechnology = async (req, res, next) => {
  try {
    let technology = req.body;

    const insertdata = await query.insert(technologyColl, technology);
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
const updatetechnology = async (req, res, next) => {
  try {
    let technologyId = ObjectId(req.params.id);
    const updatetechnology = req.body;

    const updatedata = await query.findOneAndUpdate(
      technologyColl,
      { _id: technologyId },
      { $set: updatetechnology },
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
const getTechnologybyId = async (req, res, next) => {
  try {
    let technologyId = ObjectId(req.params.id);
    console.log(req.params.id);
    const findtechnology = await query.findOne(
      technologyColl,
      { _id: technologyId },
      { returnOriginal: false }
    );
    console.log(findtechnology);
    const obj = resPattern.successPattern(
      httpStatus.OK,
      findtechnology,
      `success`
    );
    return res.status(obj.code).json({
      ...obj,
    });
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

const listalltechnology = async (req, res, next) => {
  //console.log("listalltechnology");
  try {
    let technologySearch = {};
    let tech = req.query.status;
    tech = tech.charAt(0).toUpperCase() + tech.slice(1);

    // techStatus.status= 1;
    const search = req.query.search;

    let technologyFilter = {
      techstatus: tech,
    };

    if (search) {
      technologySearch = {
        $or: [{ technologyName: { $regex: search, $options: "i" } }],
      };
    }

    let finalQuery = {
      $and: [technologyFilter, technologySearch],
    };
    const alltechnology = await query.find(
      technologyColl,
      finalQuery,
      {},
      { technologyname: 1 }
    );
    console.log(alltechnology);

    const obj = resPattern.successPattern(
      httpStatus.OK,
      alltechnology,
      `success`
    );
    return res.status(obj.code).json({
      ...obj,
    });
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};
const deletetechnology = async (req, res, next) => {
  try {
    let deleteId = ObjectId(req.params.id);
    const deletetechnology = await query.findOneAndUpdate(
      technologyColl,
      { _id: deleteId },
      { $set: { isDelete: 1 } },
      { returnOriginal: false }
    );
    const obj = resPattern.successPattern(
      httpStatus.OK,
      deletetechnology,
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
  createtechnology,
  updatetechnology,
  deletetechnology,
  getTechnologybyId,
  listalltechnology,
};
