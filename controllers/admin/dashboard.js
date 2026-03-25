const moment = require("moment");
const { Sequelize, Op, Model, DataTypes, QueryTypes } = require("sequelize");
const baseUrl = "/ap";
const { numberToCommaSeparated } = require("../../modules/number-to-format");
const Feedback = require("../../models/feedback");
const Bookings = require("../../models/booking");
const Complaint = require("../../models/complaint");
const cars = require("../../models/car");
const driver = require("../../models/driver");
const users = require("../../models/user");
const car_driver = require("../../models/drivers_cars");
const news_event = require("../../models/news_events");
const Cars = require("../../models/car");
const { log } = require("sharp/lib/libvips");

// GET Total Counts
const getTotalCount = async (req, res) => {
  const driverCount = await driver.count({ where: { isDeleted: 0 } });
  const carCount = await cars.count({ where: { isDeleted: 0 } });
  const carDriverCount = await car_driver.count({ where: { isDeleted: 0 } });
  const systemUsersCount = await users.count({
    where: { isDeleted: 0, user_type: "admin" },
  });
  const complaintCount = await Complaint.count({ where: { isDeleted: 0 } });
  const feedbackCount = await Feedback.count({});
  const bookings = await Bookings.count({
    where: { isDeleted: 0, booking_status: ["pending", "process"] },
  });
  const news_eventData = await news_event.count({ where: { isDeleted: 0 } });
  return res.send({
    success: true,
    message: "Response succeeded.",
    data: [
      {
        title: "Drivers",
        icon: '<i class="fa fa-users"></i>',
        link: `${baseUrl}/drivers/list`,
        total: await numberToCommaSeparated(driverCount),
      },
      {
        title: "Cars",
        icon: '<i class="fa fa-car"></i>',
        link: `${baseUrl}/cars/list`,
        total: await numberToCommaSeparated(carCount),
      },
      {
        title: "System Users",
        icon: '<i class="fa fa-user-secret"></i>',
        link: `${baseUrl}/rbac/system-users`,
        total: await numberToCommaSeparated(systemUsersCount),
      },
      {
        title: "Car Driver",
        icon: '<i class="fa-solid fa-car-side"></i>',
        link: `${baseUrl}/driver-car/list`,
        total: await numberToCommaSeparated(carDriverCount),
      },
      {
        title: "Complaints",
        icon: '<i class="fa-solid fa-envelope-open-text"></i>',
        link: `${baseUrl}/complaint/list`,
        total: await numberToCommaSeparated(complaintCount),
      },
      {
        title: "Feedbacks",
        icon: '<i class="fa fa-address-book-o"></i>',
        link: `${baseUrl}/feeback/list`,
        total: await numberToCommaSeparated(feedbackCount),
      },
      {
        title: "News and Event",
        icon: '<i class="fa fa-address-book-o"></i>',
        link: `${baseUrl}/news-events/list`,
        total: await numberToCommaSeparated(news_eventData),
      },
      {
        title: "Bookings List",
        icon: '<i class="fa fa-files-o"></i>',
        link: `${baseUrl}/bookings/list`,
        total: await numberToCommaSeparated(bookings),
      },
    ],
  });
};

const List = async (req, res) => {
  try {
    let { start, length, draw } = req.body;
    var searchStr = { isDeleted: 0 };

    start = start !== undefined && start !== null ? parseInt(start, 10) : 0;
    length = length !== undefined && length !== null ? parseInt(length, 10) : 10;

    if (isNaN(start) || start < 0) start = 0;
    if (isNaN(length) || length <= 0) length = 10;

    let dataArr = [];
    let dataArr2 = [];
    let i = 0;
    let no = Number(start);

    let dataList = await Bookings.findAll({
      where: {
        booking_status: "pending",
      },
      offset: start,
      limit: length,
      order: [["id", "DESC"]],
      include: {
        model: Cars,
        as: "car",
        attributes: ["title"],
      },
     /// logging: console.log,
    });

    let Total = await Bookings.count({ where: { isDeleted: 0 } });
    let Filtered = await Bookings.count({ where: searchStr });

    dataList.forEach(async (item) => {
      i++;
      no++;
      dataArr = [
        no,
        item.car.dataValues.title,
        item.name,
        item.contact_no,
        item.email,
        item.from_location,
        item.to_location,
        item.pickup_time,
        item.pickup_date,
        item.ride_type,
        item.distance,
        item.price,
        item.amount,
      ];
      dataArr2.push(dataArr);
    });

    var data = JSON.stringify({
      draw: draw,
      recordsTotal: Total,
      recordsFiltered: Filtered,
      data: dataArr2,
    });
    return res.send(data);
  } catch (error) {
    console.log(error, "error");
  }
};

module.exports = {
  getTotalCount,
  List,
};
