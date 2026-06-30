const express = require("express");
const router = express.Router();

const offlineTrackingController = require("../../controllers/admin/offline_tracking");

router.get("/", async (req, res) => {
    return offlineTrackingController.index(req, res);
});

router.post("/list", async (req, res) => {
    return offlineTrackingController.list(req, res);
});

router.get("/route-points/:booking_id", async (req, res) => {
    return offlineTrackingController.routePoints(req, res);
});

module.exports = router;