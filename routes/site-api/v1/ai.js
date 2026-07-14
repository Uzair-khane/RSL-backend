const express = require("express");
const router = express.Router();

const aiController = require("../../../controllers/site-api/v1/ai");
const etaController = require("../../../controllers/site-api/v1/ai_eta");
const routeController = require("../../../controllers/site-api/v1/ai_route");

router.post("/recommend-ride", aiController.recommendRide);
router.post("/predict-eta", etaController.predictEta);
router.post("/optimize-route", routeController.optimizeRoute);
router.post("/check-route-deviation", routeController.checkRouteDeviation);

module.exports = router;