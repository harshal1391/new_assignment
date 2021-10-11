const router = require("express").Router();
const path = require("path");
const projectCtrl = require("../controllers/project.controller");

router.route("/create-project").post(projectCtrl.createProject);

router.route("/update-project/:id").put(projectCtrl.updateProject);

router.route("/add-members").put(projectCtrl.addProjectMember);

router.route("/remove-members").delete(projectCtrl.removeProjectMember);

router.route("/add-requirements").put(projectCtrl.addProjectRequirement);

//router.route("/remove-requirements").delete(projectCtrl.removeProjectMember);

router.route("/allProject").get(projectCtrl.findAllProjects);

router.route("/employees/:id").get(projectCtrl.getProjects);

router.route("/delete-Project/:id").post(projectCtrl.deleteProgram);


 module.exports = router;
