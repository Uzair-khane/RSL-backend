const Bookings = require("../../models/booking");
const Cars = require("../../models/car");
const sequelize = require("../../config/dbconfig");
const { Sequelize } = require("sequelize");
const AccountHistory = require("../../models/accounts-history");
const Drivers = require("../../models/driver");

const baseUrl = "/ap";
const routeUrl = "/ap/accounts-history";

// #Get list page
const Page = async (req, res) => {
  const carsdata = await Cars.findAll({
    where: { isDeleted: 0 },
  });
  res.render("admin/accounts-history/list", {
    successFlash: req.flash("success"),
    errorFlash: req.flash("error").join("<br />"),
    title: "Taxi App | Accounts History",
    pageTitle: "Accounts History",
    baseUrl: baseUrl,
    actionUrl: routeUrl,
    carsdata: carsdata,
  });
};

// #find DataTable
const List = async (req, res) => {
  try {
    let { start, length, draw, filter_status, filter_car } = req.body;
    var searchStr = { isDeleted: 0 };

    // if (filter_status != "") {
    //   searchStr.booking_status = filter_status;
    // } else {
    //   searchStr.booking_status = { [Sequelize.Op.ne]: "completed" };
    // }

    // if (filter_car != "0") {
    //   searchStr.car_id = filter_car;
    // }

    let dataArr = [];
    let dataArr2 = [];
    let i = 0;
    let no = Number(start);

    // Fetch data with pagination
    const dataList = await AccountHistory.findAll({
      where: searchStr,
      offset: Number(start),
      limit: length !== -1 ? Number(length) : null,
      include: [
        {
          model: Drivers, 
          as: "driver", 
          attributes: ["name"],
        },
      ],
    });



    let Total = await AccountHistory.count({ where: { isDeleted: 0 } });
    let Filtered = await AccountHistory.count({ where: searchStr });

    dataList.forEach(async (item) => {
      i++;
      no++;
      const createdAt = new Date(item.createdAt).toLocaleString("en-US", {
        timeStyle: "short", 
        dateStyle: "short",
      });
    
      dataArr = [
        no,
        item.driver ? item.driver.name : "N/A",
        item.total_amount + " AED",
        item.received_amount + " AED",
        item.remaining_amount + " AED",
        createdAt
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

//  Update Controller
const StatusUpdate = async (req, res) => {
  try {
    // let { id, booking_status } = req.body;
    // const accountHistory = await AccountHistory.findOne({ where: { id } });
    // if (!accountHistory) {
    //   return res.status(404).send({ message: "Booking not found" });
    // }
    // accountHistory.booking_status = booking_status;
    // await accountHistory.save();
    // return res.send({
    //   success: true,
    //   message: "Booking status updated successfully",
    // });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = {
  Page,
  List,
  StatusUpdate,
};
