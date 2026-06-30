var express = require("express"),
  { isAdminAuth } = require("../../middleware/auth/admin_auth"),
  router = express.Router();

const baseUrl = "/ap";

// IMPORT
const login = require("./login"),
  dashboard = require("./dashboard"),
  setting = require("./setting"),
  general = require("./general"),
  feedback = require("./feedback"),
  profile = require("./profile"),
  rbac = require("./rbac"),
  page = require("./page");

const drivers = require("./drivers");
const cars = require("./cars");
const bookings = require("./bookings");
const driver_car = require("./driver-car");
const prices = require("./prices");
const news_events = require("./news-events");
const car_images = require("./car-images");
const complaints = require("./complaints");
const car_services = require("./car-services");
const accounts = require("./account");
const accounts_history = require("./account-history");
const payments = require("./payments");
const safetyAlertsRoute = require("./safety_alerts");
const offlineTrackingRoute = require("./offline_tracking");

// USE
router.use(`${baseUrl}/auth`, login);
router.use(`${baseUrl}/home`, isAdminAuth, dashboard);
router.use(`${baseUrl}/general-setting`, isAdminAuth, setting);
router.use(`${baseUrl}/general`, isAdminAuth, general);
router.use(`${baseUrl}/feedback`, isAdminAuth, feedback);
router.use(`${baseUrl}/rbac`, isAdminAuth, rbac);
router.use(`${baseUrl}/profile`, isAdminAuth, profile);
router.use(`${baseUrl}/page`, isAdminAuth, page);
router.use(`${baseUrl}/drivers`, isAdminAuth, drivers);
router.use(`${baseUrl}/cars`, isAdminAuth, cars);
router.use(`${baseUrl}/bookings`, isAdminAuth, bookings);
router.use(`${baseUrl}/driver-car`, isAdminAuth, driver_car);
router.use(`${baseUrl}/prices`, isAdminAuth, prices);
router.use(`${baseUrl}/news-events`, isAdminAuth, news_events);
router.use(`${baseUrl}/car-images`, isAdminAuth, car_images);
router.use(`${baseUrl}/complaints`, isAdminAuth, complaints);
router.use(`${baseUrl}/car-services`, isAdminAuth, car_services);
router.use(`${baseUrl}/accounts`, isAdminAuth, accounts);
router.use(`${baseUrl}/accounts-history`, isAdminAuth, accounts_history);
router.use(`${baseUrl}/payments`, isAdminAuth, payments);
router.use(`${baseUrl}/safety-alerts`, isAdminAuth, safetyAlertsRoute);
router.use(`${baseUrl}/offline-tracking`, offlineTrackingRoute);

module.exports = router;