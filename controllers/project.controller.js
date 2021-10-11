const APIError = require("../helpers/APIError");
const resPattern = require("../helpers/resPattern");
const httpStatus = require("http-status");
const db = require("../server");
const userColl = db.collection("users");
const projectColl = db.collection("projects");
const requirementsColl = db.collection("requirements");
const query = require("../query/query");
const moment = require("moment");
const ObjectId = require("mongodb").ObjectId;

const createProject = async (req, res, next) => {
  try {
    let newProject = req.body;
    let chkQuery = { projectName: req.body.projectName };
    const project = await query.findOne(projectColl, chkQuery);

    if (project) {
      let message = `Project already exists`;
      let obj = resPattern.errorPattern(httpStatus.ALREADY_REPORTED, message);
      return res.status(obj.code).json(obj);
    }

    chkQuery = { _id: ObjectId(req.body.mentorId) };
    const mentor = await query.findOne(userColl, chkQuery);

    if (!mentor) {
      let message = `Mentor does not exists in employee records`;
      let obj = resPattern.errorPattern(httpStatus.BAD_REQUEST, message);
      return res.status(obj.code).json(obj);
    } else if (mentor.type !== "Mentor") {
      let message = `Employee is not mentor. Only mentor can create a project.`;
      let obj = resPattern.errorPattern(httpStatus.BAD_REQUEST, message);
      return res.status(obj.code).json(obj);
    }

    if (!req.body.startDate) {
      let message = `Project start date is not provided.`;
      let obj = resPattern.errorPattern(httpStatus.BAD_REQUEST, message);
      return res.status(obj.code).json(obj);
    }

    newProject.startDate = moment(req.body.startDate).format("YYYY-MM-DD");

    if (req.body.endDate) {
      newProject.endDate = moment(req.body.endDate).format("YYYY-MM-DD");
    }

    let members = req.body.members;
    newProject.members = [];
    members.map((member) => newProject.members.push(ObjectId(member)));
    const insertdata = await query.insert(projectColl, newProject);

     let documents = req.body.documents;
    newProject.documents = [];
    documents.map((document) =>
      newProject.documents.push(document)
    );
    //const insertdata = await query.insert(projectColl, newProject);
    

    if (req.body.requirements.length > 0) {
      let requirements = req.body.requirements;
      newProject.requirements = [];
      let insertReq = await query.insert(requirementsColl, requirements);
      for (let i = 0; i < insertReq.insertedCount; i++) {
        newProject.requirements.push(insertReq.insertedIds[i]);
        console.log(newProject.requirements);
        console.log(insertReq.insertedIds[i]);
      }
      
    }

    if (insertdata.acknowledged) {
      const obj = resPattern.successPattern(
        httpStatus.CREATED,
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

////////////////////////////////getProject/////////////

const getProjects = async (req, res, next) => {
  console.log("getProjects");
  try {
    let empQuery = { _id: ObjectId(req.params.id) };
    const employee = await query.findOne(userColl, empQuery);

    if (!employee) {
      let message = `Employee does not exists in employee records`;
      let obj = resPattern.errorPattern(httpStatus.BAD_REQUEST, message);
      return res.status(obj.code).json(obj);

    }

    var projectQuery = { $or: [ {mentorId: req.params.id}, {members: ObjectId(req.params.id)} ] }

    const projects = await query.find(projectColl, projectQuery);

    if (projects) {
      const obj = resPattern.successPattern(httpStatus.OK, projects, `success`);
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

////////////////////////updatePoroject////////////////

const updateProject = async (req, res, next) => {
  try {
    let reqData = { projectName: req.body.projectName };

    const project = await query.findOne(projectColl, reqData);

    if (!project) {
      const message = `Project does not exists`;
      let obj = resPattern.errorPattern(httpStatus.BAD_REQUEST, message);
      return res.status(obj.code).json(obj);
    }

    const updateProject = req.body;
    const updateData = await query.findOneAndUpdate(
      projectColl,
      { _id: project._id },
      { $set: updateProject },
      { returnOriginal: false }
    );
    // console.log(updateData);
    const obj = resPattern.successPattern(
      httpStatus.OK,
      updateData.value,
      `success`
    );
    return res.status(obj.code).json({
      ...obj,
    });
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

////////////////////addProjectmember/////////////////////////////////////

const addProjectMember = async (req, res, next) => {
  try {
    let chkQuery = { projectName: req.body.projectName };

    const project = await query.findOne(projectColl, chkQuery);

    if (!project) {
      const message = `Project does not exists`;
      let obj = resPattern.errorPattern(httpStatus.BAD_REQUEST, message);
      return res.status(obj.code).json(obj);
    }

    if (
      moment(project.startDate) > moment(req.body.startDate) ||
      moment(project.endDate) < moment(req.body.endDate)
    ) {
      const message = `Member can be added in project timelines only.`;
      let obj = resPattern.errorPattern(httpStatus.BAD_REQUEST, message);
      return res.status(obj.code).json(obj);
    }

    req.body.members.map((member) => project.members.push(ObjectId(member)));

    const updateData = await query.findOneAndUpdate(
      projectColl,
      { _id: project._id },
      { $set: project },
      { returnOriginal: false }
    );

    const obj = resPattern.successPattern(
      httpStatus.OK,
      updateData.value,
      `success`
    );
    return res.status(obj.code).json({
      ...obj,
    });
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

///////////////////////////////////////removeProjectMember//////////////////////

const removeProjectMember = async (req, res, next) => {
  try {
    let chkQuery = { projectName: req.body.projectName };

    const project = await query.findOne(projectColl, chkQuery);

    if (!project) {
      const message = `Project does not exists`;
      let obj = resPattern.errorPattern(httpStatus.ALREADY_REPORTED, message);
      return res.status(obj.code).json(obj);
    }

    req.body.members.map((member) => project.members.pop(ObjectId(member)));

    const updateData = await query.findOneAndUpdate(
      projectColl,
      { _id: project._id },
      { $set: project },
      { returnOriginal: true }
    );

    const obj = resPattern.successPattern(
      httpStatus.OK,
      updateData.value,
      `success`
    );
    return res.status(obj.code).json({
      ...obj,
    });
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

/////////////////////////addProjectRequirement//////////////////////

const addProjectRequirement = async (req, res, next) => {
  try {
    let chkQuery = { projectName: req.body.projectName };

    const project = await query.findOne(projectColl, chkQuery);

    if (!project) {
      const message = `Project does not exists`;
      let obj = resPattern.errorPattern(httpStatus.BAD_REQUEST, message);
      return res.status(obj.code).json(obj);
    }

    let requirements = req.body.requirements;

    requirements.forEach((requirement) => {
      if (
        moment(project.startDate) > moment(requirement.startDate) ||
        moment(project.endDate) < moment(requirement.endDate)
      ) {
        const message = `Requirements can be added in project timelines only.`;
        let obj = resPattern.errorPattern(httpStatus.BAD_REQUEST, message);
        return res.status(obj.code).json(obj);
      }
    });

    const insertReq = await query.insert(requirementsColl, requirements);

    project.requirements = [];
    for (let i = 0; i < insertReq.insertedCount; i++) {
      project.requirements.push(insertReq.insertedIds[i]);
    }

    console.log(project);
    const updateData = await query.findOneAndUpdate(
      projectColl,
      { _id: project._id },
      { $set: project },
      { returnOriginal: false }
    );

    const obj = resPattern.successPattern(
      httpStatus.OK,
      updateData.value,
      `success`
    );
    return res.status(obj.code).json({
      ...obj,
    });
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

/////////////////////////deleteProgram//////////////////////

const deleteProgram = async (req, res, next) => {
  try {
    let deleteId = { _id: ObjectId(req.body._id) };
    const deleteProgram = await query.deleteOne(
      projectColl,
      { _id: deleteId },
      
    );
    const obj = resPattern.successPattern(
      httpStatus.OK,
      deleteProgram,
      `success`
    );
    return res.status(obj.code).json({
      ...obj,
    });
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
};

const findAllProjects = async (req, res, next) => {
  console.log("findAllProjects");
    try {
        const findallProjects = await query.find(
          projectColl,
          {},
          { createdAt: -1 }
        );
        const obj = resPattern.successPattern(httpStatus.OK, findallProjects, `success`);
        return res.status(obj.code).json({
            ...obj
        });

    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
  }

module.exports = {
  createProject,
  updateProject,
  getProjects,
  addProjectMember,
  removeProjectMember,
  addProjectRequirement,
  deleteProgram,
  findAllProjects,
};
