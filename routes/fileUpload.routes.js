const router = require("express").Router();
const fileUploadCtrl = require("../controllers/fileUpload.controller");

router.route("/fileUpload").post(fileUploadCtrl.singleUpload);

router.route("/Multiple-fileUpload").post(fileUploadCtrl.multipleUpload);


module.exports = router;
