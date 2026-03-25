const Cars = require("../../models/car");
const Prices = require("../../models/price");

const baseUrl = "/ap";
const routeUrl = "/ap/prices";

// #Get list page
const Page = async (req, res) => {
  const carsdata = await Cars.findAll({
    where: { isDeleted: 0 },
  });
  res.render("admin/prices/list", {
    successFlash: req.flash("success"),
    errorFlash: req.flash("error").join("<br />"),
    title: "Taxi App | Prices",
    pageTitle: "Prices",
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

    let dataList = await Prices.findAll({
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
      order: [[{ model: Cars, as: "car" }, "title", "ASC"]],
    });
    let Total = await Prices.count({ where: { isDeleted: 0 } });
    let Filtered = await Prices.count({ where: searchStr });
    dataList.forEach(async (item) => {
      i++;
      no++;
      dataArr = [
        no,
        item.car.dataValues.title || "N/A",
        item.km_price +" AED" || "N/A",
        item.hourly_price +" AED" || "N/A",
        item.description?.substring(0, 80),
        `<span class="badge bg-default badge">${moment(item.createdAt).format(
          "ll"
        )}</span>`,
        `<span class="badge bg-default badge">${moment(item.updatedAt).format(
          "ll"
        )}</span>`,
        `<button class="btn btn-primary btn-sm" data-bs-toggle="tooltip" title="Edit" onclick="editRecord('${item.id}','prices')">
                    <span class="fe fe-edit fs-12"></span>
                </button>
                <button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Delete" onclick="deleteRecord('${item.id}','prices')">
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
  let { car, hourly_price, km_price, description } = req.body;
  let alreadySetPrice = await Prices.findAll({ where: {car_id:car}});
  if(alreadySetPrice){
    return res.send({
      success:false,
      message:"This Car prices is already existed"
    });
  }
  await Prices.create({
    car_id: car,
    hourly_price: hourly_price,
    km_price : km_price,
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

// department Update Controller
const Update = async (req, res) => {
  let { id, km_price, car, hourly_price, description } = req.body;
  let inputs = {};
  inputs.car_id = car;
  inputs.hourly_price = hourly_price;
  inputs.km_price = km_price;
  inputs.description = description;

  await Prices.update(inputs, {
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
