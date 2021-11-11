const router = require("express").Router();
const technologyCtrl = require("../controllers/technology.controller");
const { protect } = require("../middleware/auth");

router
  .route("/create-technology")
  .post( technologyCtrl.createtechnology);

router.route("/update-technology/:id").post(technologyCtrl.updatetechnology);

router
  .route("/delete-technology/:id")
  .post( technologyCtrl.deletetechnology);

router
  .route("/listall-technology")
  .get( technologyCtrl.listalltechnology);

router
  .route("/get-technology/:id")
  .get( technologyCtrl.getTechnologybyId);


 module.exports = router;
