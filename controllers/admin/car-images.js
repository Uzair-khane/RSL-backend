const sharpFileUpload = require("../../modules/sharp-file-upload"),
  fs = require("fs");
const { activityLogsSave } = require("../../modules/activity-logs");
const CarImages = require("../../models/car-images");

const baseUrl = "/ap";
const routeUrl = "/ap/car-images";

// #Get list page
const Page = async (req, res) => {
  const carId = req.params.id;
  const carImages = await CarImages.findAll({
    where: { car_id: carId },
  });
  res.render("admin/car-images/list", {
    successFlash: req.flash("success"),
    errorFlash: req.flash("error").join("<br />"),
    title: "Taxi App | Car Images",
    pageTitle: "Car Images",
    baseUrl: baseUrl,
    actionUrl: routeUrl,
    carImages: carImages,
    carId: carId,
  });
};

// #find DataTable
const List = async (req, res) => {
  try {
    const carId = req.params.id;
    let { start, length, draw } = req.body;
    let searchStr = { isDeleted: 0, car_id: carId };

    let dataArr = [];
    let dataArr2 = [];
    let i = 0;
    let no = Number(start);

    let dataList = await CarImages.findAll({
      where: searchStr,
      order: [["id", "ASC"]],
    });
    let Total = await CarImages.count({
      where: { isDeleted: 0, car_id: carId },
    });
    let Filtered = await CarImages.count({ where: searchStr });

    dataList.forEach(async (item) => {
      i++;
      no++;
      let isChecked = item.status ? "checked" : "";
      let checkText = item.status ? "Deactivate" : "Activate";

      let image = "";
      if (Array.isArray(item.image)) {
        item.image.forEach((val) => {
          image += `<div class="media-user me-2 d-flex flex-column gap-2">
                          <div><img alt="No image" class="rounded-circle" src="/${val}"></div>
                        </div>`;
        });
      } else {
        image = `<div class="media-user me-2 d-flex flex-column gap-2">
                       <div><img alt="No image" class="rounded-circle w-25 h-25" src="/${item.image}"></div>
                     </div>`;
      }
      dataArr = [
        no,
        image,
        `<div class="form-group" data-toggle="tooltip" title="${checkText}">
                    <label class="custom-switch form-switch mb-0">
                        <input type="checkbox" name="custom-switch-radio" class="custom-switch-input" ${isChecked} id="customSwitch${item.id}" onchange="changeStatus('${item.id}','car_images')">
                        <span class="custom-switch-indicator"></span>
                    </label>
                </div>`,
        `<button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Delete" onclick="deleteRecord('${item.id}','car_images')">
                    <span class="fe fe-trash-2 fs-12"></span>
                </button>
                `,
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

const Add = async (req, res) => {
  try {
    let { id } = req.body;
    let galleryData = [];
    var dir = "./public/uploads/admin/cars/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    var imagename = "";
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.send({
        success: false,
        message: `Please select image(s) file to upload!`,
      });
    } else {
     
      if (Array.isArray(req.files.image)) {
        
        let imgUploadCounter = 1;
        req.files.image.forEach(async (element) => {
          imagename = await sharpFileUpload.fileToUpload(
            element,
            dir,
            null,
            null
          );
          galleryData.push({
            car_id: id,
            image: imagename,
          });
          if (req.files.image.length == imgUploadCounter) {
            const isUploaded = await CarImages.bulkCreate(galleryData);
            if (isUploaded) {
              /*Activity Logs***************************************** */
              activityLogsSave(
                req,
                (action = "add"),
                (detail = `car images has been added.`)
              );
              // /./Activity Logs**************************************** */
              return res.send({
                success: true,
                message: "Record has been added successfully.",
              });
            } else {
              throw isUploaded;
            }
          }
          imgUploadCounter++;
        });
      } else {
        imagename = await sharpFileUpload.fileToUpload(
          req.files.image,
          dir,
          null,
          null,
          "contain"
        );
        galleryData.push({
          car_id: id,
          image: imagename,
        });
        if (galleryData) {
          const isUploaded = await CarImages.create(galleryData);
          if (isUploaded) {
            /*Activity Logs***************************************** */
            activityLogsSave(
              req,
              (action = "add"),
              (detail = ` car images has been added.`)
            );
            // /./Activity Logs**************************************** */
            return res.send({
              success: true,
              message: "Record has been added successfully.",
            });
          } else {
            return res.send({ success: false, message: isUploaded });
          }
        }
      }
    }
  } catch (error) {
    return res.send({ success: false, message: error.message });
  }
};

module.exports = {
  Page,
  List,
  Add,
  // Update,
};
