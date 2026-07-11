const express = require("express");
const router = express.Router();

const aiController = require("../../../controllers/site-api/v1/ai");
const etaController = require("../../../controllers/site-api/v1/ai_eta");

router.post("/recommend-ride", aiController.recommendRide);
router.post("/predict-eta", etaController.predictEta);

module.exports = router;