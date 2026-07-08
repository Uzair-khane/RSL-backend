const express = require("express");
const router = express.Router();

const { recommendRide } = require("../../../controllers/site-api/v1/ai");

router.post("/recommend-ride", recommendRide);

module.exports = router;