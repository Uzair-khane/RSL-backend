const express = require("express");
const router = express.Router();

const AiRecommendationLogsController = require("../../controllers/admin/ai-recommendation-logs");

// AI recommendation logs page
router.get("/list", async (req, res) => {
    return AiRecommendationLogsController.Page(req, res);
});

// AI recommendation logs datatable/list API
router.post("/list", async (req, res) => {
    return AiRecommendationLogsController.List(req, res);
});

module.exports = router;