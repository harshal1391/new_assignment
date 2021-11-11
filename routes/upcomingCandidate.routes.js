const router = require("express").Router();
const upcomingCandaidateCtrl = require("../controllers/upcomingCandidate.controller");
const { protect } = require("../middleware/auth");

router
  .route("/create-upcomingCandidate")
  .post(upcomingCandaidateCtrl.createUpcomingCandidate);

router
  .route("/update-upcomingCandidate/:id")
  .post(upcomingCandaidateCtrl.updateUpcomingCandidate);

  router
    .route("/find-CandidateById/:id")
    .post(upcomingCandaidateCtrl.getCandiadateById);


    module.exports = router;

 
