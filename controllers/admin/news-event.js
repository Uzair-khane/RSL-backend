const sharpFileUpload = require("../../modules/sharp-file-upload"),
  fs = require("fs"),
  { randomString } = require("../../middleware/random-string");
const NewsEvents = require("../../models/news_events");
const path  = require("path");

const baseUrl = "/ap";
const routeUrl = "/ap/news-events";

// #Get list page
const Page = async (req, res) => {
  res.render("admin/news-events/list", {
    successFlash: req.flash("success"),
    errorFlash: req.flash("error").join("<br />"),
    title: "Taxi App | News and Events",
    pageTitle: "News and Events",
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

    let dataList = await NewsEvents.findAll({
      where: searchStr,
      offset: Number(start),
      limit: length != -1 ? Number(length) : null,
      order: [["id", "ASC"]],
    });
    let Total = await NewsEvents.count({ where: { isDeleted: 0 } });
    let Filtered = await NewsEvents.count({ where: searchStr });

    dataList.forEach(async (item) => {
      i++;
      no++;
      let isChecked = item.status ? "checked" : "";
      let checkText = item.status ? "Deactivate" : "Activate";

      dataArr = [
        no,
        item.title,
        item.type,
        `<div class="media-user me-2">
                        <div class=""><img alt="No image" class="rounded-circle avatar avatar-md" src="/${item.image}"></div>
                    </div>`,
        item.description?.substring(0, 80),
        `<div class="form-group" data-toggle="tooltip" title="${checkText}">
                    <label class="custom-switch form-switch mb-0">
                        <input type="checkbox" name="custom-switch-radio" class="custom-switch-input" ${isChecked} id="customSwitch${item.id}" onchange="changeStatus('${item.id}','news_events')">
                        <span class="custom-switch-indicator"></span>
                    </label>
                </div>`,
        `<span class="badge bg-default badge">${moment(item.createdAt).format(
          "ll"
        )}</span>`,
        `<span class="badge bg-default badge">${moment(item.updatedAt).format(
          "ll"
        )}</span>`,
        `<button class="btn btn-primary btn-sm" data-bs-toggle="tooltip" title="Edit" onclick="editRecord('${item.id}','news_events')">
                    <span class="fe fe-edit fs-12"></span>
                </button>
                <button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Delete" onclick="deleteRecord('${item.id}','news_events')">
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
  let { title, type, description } = req.body;
  var dir = "./public/uploads/admin/news-events/";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  let pImage = "";

  if (req.files && req.files.image_url != undefined) {
    pImage = await sharpFileUpload.fileToUpload(
      req.files.image_url,
      dir,
      1900,
      800
    );
  } else {
    return res.send({
      success: false,
      message: `Please upload display image.`,
    });
  }
  await NewsEvents.create({
    title,
    type,
    image: pImage,
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
        message: `Oops! Someting went wrong..!${err.message}`,
      });
    });
};
// Update Controller
const Update = async (req, res) => {
  let { id, title, type, description } = req.body;
  let inputs = {};
  inputs.title = title;
  inputs.type = type;
  inputs.description = description;
  var dir = "./public/uploads/admin/news-events/";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  let pImage = "";
  if (req.files && req.files.image_url != undefined) {
    // Preview Image
    pImage = await sharpFileUpload.fileToUpload(
      req.files.image_url,
      dir,
      1900,
      800
    );
    inputs.image = pImage;
  }

  await NewsEvents.update(inputs, {
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
