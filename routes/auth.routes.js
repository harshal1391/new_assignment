const router = require("express").Router();
const authCtrl = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

router.route("/verifyotp").post(authCtrl.verifyotp);

router.route("/forgotPassword").post(authCtrl.forgotPassword);

router.route("/resetPassword").post(authCtrl.resetPassword);

router.route("/changePassword").put(protect,authCtrl.changePassword);

module.exports = router;
