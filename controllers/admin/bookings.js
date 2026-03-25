const Bookings = require("../../models/booking");
const Cars = require("../../models/car");
const sequelize = require("../../config/dbconfig");
const { Sequelize } = require("sequelize");

const baseUrl = "/ap";
const routeUrl = "/ap/bookings";

// #Get list page
const Page = async (req, res) => {
  const carsdata = await Cars.findAll({
    where: { isDeleted: 0 },
  });
  res.render("admin/bookings/list", {
    successFlash: req.flash("success"),
    errorFlash: req.flash("error").join("<br />"),
    title: "Taxi App | Bookings",
    pageTitle: "Bookings",
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

    if (filter_status != "") {
      searchStr.booking_status = filter_status;
    } else {
      searchStr.booking_status = { [Sequelize.Op.ne]: "completed" };
    }

    if (filter_car != "0") {
      searchStr.car_id = filter_car;
    }

    let dataArr = [];
    let dataArr2 = [];
    let i = 0;
    let no = Number(start);

    // Fetch data with pagination
    const dataList = await Bookings.findAll({
      where: searchStr,
      offset: Number(start),
      limit: length !== -1 ? Number(length) : null,
      order: [["id", "DESC"]],
      include: {
        model: Cars,
        as: "car",
        attributes: ["title"],
      },
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
        item.price + "AED",
        item.amount + "AED",
        ` <select class="form-control select2"
         name="booking_dropdown" onchange="updateBookingStatus('${
           item.id
         }',this,'bookings')">
          <option value="pending" ${
            item.booking_status === "pending" || item.booking_status === null
              ? "selected"
              : ""
          }>Pending</option>
          <option value="process" ${
            item.booking_status === "process" ? "selected" : ""
          }>Process</option>
          <option value="completed" ${
            item.booking_status === "completed" ? "selected" : ""
          }>Complete</option>
        </select>`,
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
    let { id, booking_status } = req.body;
    const booking = await Bookings.findOne({ where: { id } });
    if (!booking) {
      return res.status(404).send({ message: "Booking not found" });
    }
    booking.booking_status = booking_status;
    await booking.save();
    return res.send({
      success: true,
      message: "Booking status updated successfully",
    });
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
