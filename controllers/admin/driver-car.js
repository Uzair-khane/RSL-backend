const Drivers_Cars = require("../../models/drivers_cars");
const Drivers = require("../../models/driver");
const Cars = require("../../models/car");

const baseUrl = "/ap";
const routeUrl = "/ap/driver-car";

// #Get list page
const Page = async (req, res) => {
  const driversdata = await Drivers.findAll({
    where: { status: 1, isDeleted: 0, driver_status: 1 },
  });
  const carsdata = await Cars.findAll({
    where: { status: 1, isDeleted: 0, car_status: 1 },
  });

  res.render("admin/driver-car/list", {
    successFlash: req.flash("success"),
    errorFlash: req.flash("error").join("<br />"),
    title: "Taxi App | Driver-Car",
    pageTitle: "Drivers-Cars",
    baseUrl: baseUrl,
    actionUrl: routeUrl,
    driversdata: driversdata,
    carsdata: carsdata,
  });
};

// #find DataTable
const List = async (req, res) => {
  try {
    let { start, length, draw } = req.body;
    var searchStr = {};
    searchStr.isDeleted = 0;

    let dataArr = [];
    let dataArr2 = [];
    let i = 0;
    let no = Number(start);

    let dataList = await Drivers_Cars.findAll({
      where: searchStr,
      offset: Number(start),
      limit: length != -1 ? Number(length) : null,
      order: [["id", "ASC"]],
      include: [
        {
          model: Drivers,
          as: "driver",
          attributes: ["name"],
        },
        {
          model: Cars,
          as: "car",
          attributes: ["title"],
        },
      ],
    });
    let Total = await Drivers_Cars.count({ where: { isDeleted: 0 } });
    let Filtered = await Drivers_Cars.count({ where: searchStr });
    dataList.forEach(async (item) => {
      i++;
      no++;
      dataArr = [
        no,
        item.car.dataValues.title || "N/A",
        item.driver.dataValues.name || "N/A",
        item.description?.substring(0, 80),
        `<span class="badge bg-default badge">${moment(item.createdAt).format(
          "ll"
        )}</span>`,
        `
                <button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Delete" onclick="revokeRecord('${item.id}','driver_cars')">
                    Revoke
                </button>`,
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

//  Add Controller
const Add = async (req, res) => {
  let { driver, car, description } = req.body;

  const driverRecord = await Drivers.findOne({ where: { id: driver } });

  if (!driverRecord) {
    return res
      .status(404)
      .send({ success: false, message: "Driver not found." });
  }

  // if already car assigned checking
  const existingAssignment = await Drivers_Cars.findOne({
    where: { driver_id: driver, isDeleted: 0 },
  });

  if (existingAssignment) {
    return res.status(400).send({
      success: false,
      message: "This driver is already assigned to a car.",
    });
  }

  // Fetch car details by ID
  const carRecord = await Cars.findOne({ where: { id: car } });

  if (!carRecord) {
    return res.status(404).send({ success: false, message: "Car not found." });
  }

  // Update driver and car statuses
  await driverRecord.update({ driver_status: 0 }, { where: { id: driver } });
  await carRecord.update({ car_status: 0 }, { where: { id: car } });

  await Drivers_Cars.create({
    driver_id: driver,
    car_id: car,
    description: description,
  })
    .then((recordCreated) => {
      if (recordCreated) {
        res.send({
          success: true,
          message: "Record has been added successfully.",
        });
      } else {
        res.send({ success: false, message: "Oops! Something went wrong." });
      }
    })
    .catch((err) => {
      console.log(err.message);
      res.send({
        success: false,
        message: `Oops! Someting went wrong..! ${err.message}`,
      });
    });
};

const Revoke = async (req, res) => {
  try {
    let { id } = req.body;
    const driverCarRecord = await Drivers_Cars.findOne({
      where: { id: id },
      include: [
        { model: Drivers, as: "driver" },
        { model: Cars, as: "car" },
      ],
    });
    if (!driverCarRecord) {
      return res.status(404).send({
        success: false,
        message: "Record not found.",
      });
    }
    await Drivers_Cars.update(
      { status: 0, isDeleted: 1 },
      { where: { id: id } }
    );

    if (driverCarRecord.driver) {
      await Drivers.update(
        { driver_status: 1 },
        { where: { id: driverCarRecord.driver.id } }
      );
    } else {
      return res.send({
        success: false,
        message: `driver not found`,
      });
    }
    if (driverCarRecord.car) {
      await Cars.update(
        { car_status: 1 },
        { where: { id: driverCarRecord.driver.id } }
      );
    } else {
      return res.send({
        success: false,
        message: `car not found`,
      });
    }
    return res.send({
      success: true,
      message: "Record has been Updated successfully.",
    });
  } catch (error) {
    console.log(error.message);
    res.send({
      success: false,
      message: `Oops! Someting went wrong..! ${error.message}`,
    });
  }
};

module.exports = {
  Page,
  List,
  Add,
  Revoke,
};
