const DashboardController  = require('./admin/dashboard')
const LoginController  = require('./admin/login')
const SettingController = require('./admin/setting')
const ComplaintController = require('./admin/complaint')
const FeedBackController = require('./admin/feedback')
const ProfileController = require("./admin/profile")
const RbacController = require('./admin/rbac')
const PageController = require('./admin/page')
const DriversController = require('./admin/drivers');
const CarsController = require("./admin/cars");
const BookingsController = require("./admin/bookings");
const DriversCarsController = require("./admin/driver-car");
const PricesController = require("./admin/prices");
const NewsAndEventsController = require("./admin/news-event");
const CarImagesController = require("./admin/car-images");
const ComplaintsController = require("./admin/complaint");
const CarServicesController =  require("./admin/car-services");
const AccountsController =  require("./admin/account");
const AccountHistoryController = require("./admin/account-history");



module.exports = {
    /**Admin Panel Controllers */
    DashboardController,
    LoginController,
    SettingController,
    ComplaintController,
    FeedBackController,
    ProfileController,
    RbacController,
    PageController,
    DriversController,
    CarsController,
    BookingsController,
    DriversCarsController,
    PricesController,
    NewsAndEventsController,
    CarImagesController,
    ComplaintsController,
    CarServicesController,
    AccountsController,
    AccountHistoryController
};