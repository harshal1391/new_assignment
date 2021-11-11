const router = require("express").Router();
const vaccancyCtrl = require("../controllers/vaccancyChart.controller");
const { protect } = require("../middleware/auth");

router.route("/create-vaccancy").post(vaccancyCtrl.createVaccancyChart);

router.route("/update-vaccancy/:id").put(vaccancyCtrl.updateVaccancy);

router.route("/delete-vaccancy/:id").delete(vaccancyCtrl.deleteVaccancy);

//router.route("/listall-vaccancy").get(vaccancyCtrl.listalltechnology);

router.route("/get-vaccancy/:id").get(vaccancyCtrl.updateVaccancy);

module.exports = router;
