const APIError = require("../helpers/APIError");
const resPattern = require("../helpers/resPattern");
const httpStatus = require("http-status");
const db = require("../server");
const userColl = db.collection("users");
const projectColl = db.collection("projects");
const taskColl = db.collection("task");
const query = require("../query/query");
const moment = require("moment");
const ObjectId = require("mongodb").ObjectId;

const createtask = async (req, res, next) => {
  try {
    let task = req.body;

    task.projectId = ObjectId(req.body.projectId);

    let chkQuery = { _id: task.projectId };
    const project = await query.findOne(projectColl, chkQuery);

    if (!project) {
      let message = `Project does not exist in project records`;
      let obj = resPattern.errorPattern(httpStatus.BAD_REQUEST, message);
      return res.status(obj.code).json(obj);
    }
    const insertdata = await query.insert(taskColl, task);
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

const updatetask = async (req, res, next) => {
  try {
    let taskId = ObjectID(req.params.id);
    const updatetask = req.body;

    const updatedata = await query.findOneAndUpdate(
      taskColl,
      { _id: taskId },
      { $set: updatetask },
      { returnOriginal: false }
    );
    console.log("updatedata");
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
const deletetask = async (req, res, next) => {
  try {
    let deleteId = ObjectId(req.params.id);
    const deletetask = await query.findOneAndUpdate(
      taskColl,
      { _id: deleteId },
      { $set: { isDelete: 1 } },
      { returnOriginal: false }
    );
    const obj = resPattern.successPattern(httpStatus.OK, deletetask, `success`);
    return res.status(obj.code).json({
      ...obj,
    });
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};
const listalltask = async (req, res, next) => {
  console.log("listalltask");
  try {
    const listalltask = await query.find(taskColl, {}, { createdAt: -1 });
    const obj = resPattern.successPattern(
      httpStatus.OK,
      listalltask,
      `success`
    );
    return res.status(obj.code).json({
      ...obj,
    });
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

const findtask = async (req, res, next) => {
  try {
    let taskId = ObjectId(req.params.id);

    const findtask = await query.findOne(
      taskColl,
      { _id: taskId },
      { returnOriginal: false }
    );
    const obj = resPattern.successPattern(httpStatus.OK, findtask, `success`);
    return res.status(obj.code).json({
      ...obj,
    });
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

module.exports = {
  createtask,
  updatetask,
  deletetask,
  listalltask,
  findtask,
};
