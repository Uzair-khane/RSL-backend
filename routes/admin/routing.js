var express = require("express"),
  // MIDDLEWARES
  { isAdminAuth } = require("../../middleware/auth/admin_auth"),
  router = express.Router();

const baseUrl = "/ap";

// ROUTES
// #IMPORT
const login = require("./login"),
  dashboard = require("./dashboard"),
  setting = require("./setting"),
  general = require("./general"),
  feedback = require("./feedback"),
  profile = require("./profile"),
  rbac = require("./rbac"),
  page = require("./page");
drivers = require("./drivers");
cars = require("./cars");
bookings = require("./bookings");
driver_car = require("./driver-car");
prices = require("./prices");
news_events = require("./news-events");
car_images = require("./car-images");
complaints = require("./complaints");
car_services = require("./car-services");
accounts = require("./account");
accounts_history = require("./account-history");

// #USE
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

module.exports = router;
