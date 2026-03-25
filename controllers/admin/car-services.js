const Cars = require("../../models/car");
const CarServices = require("../../models/car-services");

const baseUrl = "/ap";
const routeUrl = "/ap/car-services";

// #Get list page
const Page = async (req, res) => {
  const carsdata = await Cars.findAll({
    where: { isDeleted: 0 },
  });
  res.render("admin/car-services/list", {
    successFlash: req.flash("success"),
    errorFlash: req.flash("error").join("<br />"),
    title: "Taxi App | Car Service",
    pageTitle: "Car Services",
    baseUrl: baseUrl,
    actionUrl: routeUrl,
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

    let dataList = await CarServices.findAll({
      where: searchStr,
      offset: Number(start),
      limit: length != -1 ? Number(length) : null,
      order: [["id", "ASC"]],
      include: [
        {
          model: Cars,
          as: "car",
          attributes: ["title"],
        },
      ],
    });
    let Total = await CarServices.count({ where: { isDeleted: 0 } });
    let Filtered = await CarServices.count({ where: searchStr });
    dataList.forEach(async (item) => {
      i++;
      no++;
      dataArr = [
        no,
        item.car.dataValues.title,
        item.interior,
        item.seat,
        item.player,
        item.wifi,
        item.charger,
        item.desk,
        `<button class="btn btn-primary btn-sm" data-bs-toggle="tooltip" title="Edit" onclick="editRecord('${item.id}','car_services')">
                    <span class="fe fe-edit fs-12"></span>
                </button>
                <button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Delete" onclick="deleteRecord('${item.id}','car_services')">
                    <span class="fe fe-trash-2 fs-12"></span>
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

// Department Add Controller
const Add = async (req, res) => {
  let { car, interior, seat, player, wifi, charger, desk, description } =
    req.body;
  let existingCheck = await CarServices.findOne({ where: { car_id: car } });
  if (existingCheck) {
    return res.send({
      success: false,
      message: "This car has already set services.",
    });
  }
  await CarServices.create({
    car_id: car,
    interior,
    seat,
    player,
    wifi,
    charger,
    desk,
    description,
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

// department Update Controller
const Update = async (req, res) => {
  let { id, car_id, interior, seat, player, wifi, charger, desk, description } =
    req.body;
  let inputs = {};
  inputs.car_id = car_id;
  inputs.interior = interior;
  inputs.seat = seat;
  inputs.player = player;
  inputs.wifi = wifi;
  inputs.charger = charger;
  inputs.desk = desk;
  inputs.description = description;

  await CarServices.update(inputs, {
    where: {
      id: id,
    },
  })
    .then((recordCreated) => {
      if (recordCreated) {
        res.send({
          success: true,
          message: "Record has been Updated successfully.",
        });
      } else {
        res.send({ success: false, message: "Oops! Something went wrong." });
      }
    })
    .catch((err) => {
      res.send({
        success: false,
        message: "Oops! Someting went wrong..!".err.message,
      });
    });
};

module.exports = {
  Page,
  List,
  Add,
  Update,
};
