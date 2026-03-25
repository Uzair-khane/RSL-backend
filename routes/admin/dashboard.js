const express = require("express"),
  passport = require("passport"),
  fs = require("fs"),
  moment = require("moment"),
  { v4: uuidv4 } = require("uuid"),
  router = express.Router();

const { DashboardController } = require("../../controllers");
const Bookings = require("../../models/booking");
const users = require("../../models/user");

const baseUrl = "/ap";
const routeUrl = "/ap";
router.get("/", async (req, res) => {
  const loggedInUser = req.user;
  if (req.headers && req.headers.referer != undefined) {
    const getRedirectUrl = req.headers.referer.split("?")[1];
    if (
      getRedirectUrl != undefined &&
      getRedirectUrl.split("=")[1] != "/ap/home"
    ) {
      return res.redirect(getRedirectUrl.split("=")[1]);
    }
  }
  if (
    loggedInUser &&
    loggedInUser.role_id != undefined &&
    loggedInUser.role_id === 1
  ) {
    res.render("admin/dashboard", {
      successFlash: `Welcome ${loggedInUser.name} to your Dashboard.!`,
      errorFlash: req.flash("error").join("<br />"),
      title: "Dashboard | Admin",
      baseUrl: baseUrl,
      routeUrl: routeUrl,
      pageTitle: "Bookings",
    });
  } else {
    res.render("admin/dashboard-user", {
      successFlash: `Welcome ${loggedInUser.name} to your Dashboard.!`,
      errorFlash: req.flash("error").join("<br />"),
      title: `Dashboard | User <${loggedInUser.name}>`,
      baseUrl: baseUrl,
    });
  }
});

// GET Total Counts
router.get("/total-count", async (req, res) => {
  return DashboardController.getTotalCount(req, res);
});
router.get("/list", async (req, res) => {
  return DashboardController.List(req, res);
});

module.exports = router;
