const express = require("express");
const router = express.Router();

const aiController = require("../../../controllers/site-api/v1/ai");
const etaController = require("../../../controllers/site-api/v1/ai_eta");
const routeController = require("../../../controllers/site-api/v1/ai_route");

router.post("/recommend-ride", aiController.recommendRide);
router.post("/predict-eta", etaController.predictEta);

// Smart Route Intelligence
router.post("/optimize-route", routeController.optimizeRoute);
router.post("/optimize-routes", routeController.optimizeRoutes);
router.post("/select-route", routeController.selectRoute);
router.get("/selected-route/:booking_id", routeController.getSelectedRoute);
router.post("/check-route-deviation", routeController.checkRouteDeviation);
router.post("/recalculate-route-cost", routeController.recalculateRouteCost);

module.exports = router;