const router = require("express").Router();
const fileUploadCtrl = require("../controllers/fileUpload.controller");

router.route("/fileUpload").post(fileUploadCtrl.singleUpload);


module.exports = router;
