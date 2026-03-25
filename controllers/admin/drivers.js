const Drivers = require("../../models/driver");

const baseUrl = "/ap";
const routeUrl = "/ap/drivers";

// #Get list page
const Page = async (req, res) => {
  res.render("admin/drivers/list", {
    successFlash: req.flash("success"),
    errorFlash: req.flash("error").join("<br />"),
    title: "Taxi App | Drivers",
    pageTitle: "Drivers",
    baseUrl: baseUrl,
    actionUrl: routeUrl,
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

    let dataList = await Drivers.findAll({
      where: searchStr,
      offset: Number(start),
      limit: length != -1 ? Number(length) : null,
      order: [["id", "ASC"]],
    });
    let Total = await Drivers.count({ where: { isDeleted: 0 } });
    let Filtered = await Drivers.count({ where: searchStr });

    dataList.forEach(async (item) => {
      i++;
      no++;
      let isChecked = item.status ? "checked" : "";
      let checkText = item.status ? "Deactivate" : "Activate";

      dataArr = [
        no,
        item.name,
        item.contact,
        item.license_no,
        item.id_card_no,
        item.passport_no,
        item.address,
        item.dob,
        item.description?.substring(0, 80),
        `<div class="form-group" data-toggle="tooltip" title="${checkText}">
                    <label class="custom-switch form-switch mb-0">
                        <input type="checkbox" name="custom-switch-radio" class="custom-switch-input" ${isChecked} id="customSwitch${item.id}" onchange="changeStatus('${item.id}','driver')">
                        <span class="custom-switch-indicator"></span>
                    </label>
                </div>`,
        `<span class="badge bg-default badge">${moment(item.createdAt).format(
          "ll"
        )}</span>`,
        `<button class="btn btn-primary btn-sm" data-bs-toggle="tooltip" title="Edit" onclick="editRecord('${item.id}','drivers')">
                    <span class="fe fe-edit fs-12"></span>
                </button>
                <button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Delete" onclick="deleteRecord('${item.id}','drivers')">
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

//  Add Controller
const Add = async (req, res) => {
  let {
    name,
    contact,
    license_no,
    id_card_no,
    passport_no,
    address,
    dob,
    description,
  } = req.body;
  const existingDriver = await Drivers.findOne({where:{license_no : license_no}})
  if (existingDriver) {
    return res.send({
      success: false,
      message: "Driver Existing!, Driver is already register.",
    });
  }
  await Drivers.create({
    name,
    contact,
    license_no,
    id_card_no,
    passport_no,
    address,
    dob,
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
      res.send({
        success: false,
        message: "Oops! Someting went wrong..!".err.message,
      });
    });
};

// Update Controller
const Update = async (req, res) => {
  let {
    id,
    name,
    contact,
    license_no,
    id_card_no,
    passport_no,
    address,
    dob,
    description,
  } = req.body;
  let inputs = {};
  inputs.name = name;
  inputs.contact = contact;
  inputs.license_no = license_no;
  inputs.id_card_no = id_card_no;
  inputs.passport_no = passport_no;
  inputs.address = address;
  inputs.dob = dob;
  inputs.description = description;
  await Drivers.update(inputs, {
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
