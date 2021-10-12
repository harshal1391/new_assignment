const router = require("express").Router();
const tasktCtrl = require("../controllers/taskList.controller");

router.route("/create-task").post(tasktCtrl.createtask);

router.route("/update-task").post(tasktCtrl.updatetask);

router.route("/delete-task/:id").post(tasktCtrl.deletetask);

router.route("/listall-task").get(tasktCtrl.listalltask);

router.route("/find-task/:id").get(tasktCtrl.findtask);








module.exports = router;
