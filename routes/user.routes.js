const router = require("express").Router();
const userCtrl = require("../controllers/user.controller");

router.route("/create-user").post(userCtrl.createUser);

router.route("/login").post(userCtrl.login);

router.route("/list-all-users").get(userCtrl.listallusers);

router.route("/updateUserById/:id").post(userCtrl.updateUserProfile);

router.route("/find-user/:id").get(userCtrl.findUser);

//router.route("/login").post(userCtrl.login);


module.exports = router;