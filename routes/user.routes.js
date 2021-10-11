const router = require("express").Router();
const userCtrl = require("../controllers/user.controller");

router.route("/create-user").post(userCtrl.createUser);

router.route("/login").post(userCtrl.login);

//router.route("/login").post(userCtrl.login);


module.exports = router;