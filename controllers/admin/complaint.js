const Complaints = require("../../models/complaint");

const baseUrl = "/ap";
const routeUrl = "/ap/complaints";

// #Get list page
const Page = async (req, res) => {
  res.render("admin/complaints", {
    successFlash: req.flash("success"),
    errorFlash: req.flash("error").join("<br />"),
    title: "Taxi App | Complaints",
    pageTitle: "Complaints",
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

    let dataList = await Complaints.findAll({
      where: searchStr,
      offset: Number(start),
      limit: length != -1 ? Number(length) : null,
      order: [["id", "ASC"]],
    });
    let Total = await Complaints.count({ where: { isDeleted: 0 } });
    let Filtered = await Complaints.count({ where: searchStr });

    dataList.forEach(async (item) => {
      i++;
      no++;
      let isChecked = item.status ? "checked" : "";
      let checkText = item.status ? "Deactivate" : "Activate";

      dataArr = [
        no,
        item.title +
        `<div class="media-user me-2 d-flex gap-2">
        <div class="">
        <img alt="No image" class="rounded-circle avatar avatar-md" src="/${item.image_url}">
        </div>
         <div class="">
        <img alt="No image" class="rounded-circle avatar avatar-md" src="/${item.banner_image_url}">
        </div></div>`,
        item.registration_no,
        item.model_year,
        item.vehicle_type,
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
        `<button class="btn btn-primary btn-sm" data-bs-toggle="tooltip" title="Edit" onclick="editRecord('${item.id}','cars')">
                    <span class="fe fe-edit fs-12"></span>
                </button>
                <button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Delete" onclick="deleteRecord('${item.id}','cars')">
                    <span class="fe fe-trash-2 fs-12"></span>
                </button>
                <a href=${baseUrl}/car-images/list/${item.id}>
                <button class="btn btn-primary btn-sm" data-bs-toggle="tooltip" title="More Images">
                    Add images
                </button>
                </a> `,
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
  let { title, registration_no, vehicle_type, model_year, description } =  req.body;
  await Complaints.create({
    title,
    registration_no,
    vehicle_type,
    model_year,
    image_url: pImage,
    banner_image_url: bImage,
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
        message: "Oops! Someting went wrong..!".err.message,
      });
    });
};

//  Update Controller
const Update = async (req, res) => {
  let { id, title, registration_no, vehicle_type, model_year, description } =
    req.body;
  let inputs = {};
  inputs.title = title;
  inputs.registration_no = registration_no;
  inputs.vehicle_type = vehicle_type;
  inputs.model_year = model_year;
  inputs.description = description;

  await Complaints.update(inputs, {
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
