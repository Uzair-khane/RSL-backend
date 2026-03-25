const Bookings = require("../../models/booking");
const Cars = require("../../models/car");
const sequelize = require("../../config/dbconfig");
const { Sequelize, where } = require("sequelize");
const Drivers_Cars = require("../../models/drivers_cars");
const Drivers = require("../../models/driver");
const { log } = require("sharp/lib/libvips");
const AccountHistory = require("../../models/accounts-history");

const baseUrl = "/ap";
const routeUrl = "/ap/accounts";

// #Get list page
const Page = async (req, res) => {
  const driversData = await Drivers.findAll({
    where: { isDeleted: 0 },
  });
  res.render("admin/accounts/list", {
    successFlash: req.flash("success"),
    errorFlash: req.flash("error").join("<br />"),
    title: "Taxi App | Accounts",
    pageTitle: "Accounts",
    baseUrl: baseUrl,
    actionUrl: routeUrl,
    driversData: driversData,
  });
};

// #find DataTable
const List = async (req, res) => {
  try {
    let { start, length, draw, filter_driver } = req.body;
    start = Number(start) || 0;
    length = length !== -1 ? Number(length) : null;

    const searchStr = {
      isDeleted: 0,
      amount_status: "withdriver",
      booking_status: "completed",
    };

    const filterCondition = filter_driver
      ? { driver_id: filter_driver, is_available: 1 }
      : {};

    const dataList = await Bookings.findAll({
      where: searchStr,
      offset: start,
      limit: length,
      order: [["id", "DESC"]],
      include: [
        {
          model: Cars,
          as: "car",
          attributes: ["title"],
          include: [
            {
              model: Drivers_Cars,
              as: "driver_cars",
              where: filterCondition,
              required: true,
              include: [
                {
                  model: Drivers,
                  as: "driver",
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
    });

    const Total = await Bookings.count({ where: { isDeleted: 0 } });
    const Filtered = await Bookings.count({ where: searchStr });

    let dataArr2 = [];
    let bookingIds = [];
    let totalAmount = 0;
    let no = start;

    dataList.forEach((item) => {
      no++;
      bookingIds.push(item.id);
      totalAmount += parseFloat(item.amount || 0);

      const driverName =
        item.car &&
        item.car.driver_cars &&
        item.car.driver_cars[0] &&
        item.car.driver_cars[0].driver
          ? item.car.driver_cars[0].driver.name
          : "Unknown Driver";

      dataArr2.push([
        no,
        driverName,
        `${item.amount} AED`,
        `<span class="badge bg-primary rounded-pill">${item.amount_status}</span>`,
      ]);
    });

    // console.log("totalAmount :: ", totalAmount, " ****bookingIds ::::: ", bookingIds);

    // Send response
    return res.send({
      draw: draw,
      recordsTotal: Total,
      recordsFiltered: Filtered,
      data: dataArr2,
      totalAmount: totalAmount,
      bookingIds: bookingIds,
    });
  } catch (error) {
    console.error("Error in List function:", error);
    return res.status(500).send({
      error: "An error occurred while processing the request.",
    });
  }
};

//  Update Controller
const AmountCollect = async (req, res) => {
  try {
    let {
      total,
      received_amount,
      remaining_amount,
      description,
      bookingIds,
      driver_id,
    } = req.body;

    let remaining_amount_status=1;
    if (received_amount < total) {
      remaining_amount_status = 0;
    }

    if (typeof bookingIds === "string") {
      bookingIds = JSON.parse(bookingIds);
    }

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Invalid or missing booking IDs.",
      });
    }

    await Bookings.update(
      { amount_status: "collected" },
      { where: { id: bookingIds } }
    );

    let accountsHistoryAdd = await AccountHistory.create({
      driver_id: driver_id,
      total_amount: total,
      received_amount: received_amount,
      remaining_amount: remaining_amount,
      is_available: remaining_amount_status,
      description,
    });
    if (!accountsHistoryAdd) {
      return res.send({
        success: true,
        message: "Oops! Someting went wrong..!,",
      });
    }
    return res.send({
      success: true,
      message: "Amount has been collected Successfully.",
    });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};
module.exports = {
  Page,
  List,
  AmountCollect,
};
