const sharpFileUpload = require("../../modules/sharp-file-upload");
const fs = require("fs");
const { activityLogsSave } = require("../../modules/activity-logs");
const CarImages = require("../../models/car-images");

const baseUrl = "/ap";
const routeUrl = "/ap/car-images";

// #Get list page
const Page = async (req, res) => {
  const carId = req.params.id;
  const carImages = await CarImages.findAll({ where: { car_id: carId } });

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

    let dataArr2 = [];
    let no = Number(start);

    const dataList = await CarImages.findAll({
      where: searchStr,
      order: [["id", "ASC"]],
    });
    const Total = await CarImages.count({ where: { isDeleted: 0, car_id: carId } });
    const Filtered = await CarImages.count({ where: searchStr });

    for (const item of dataList) {
      no++;
      let isChecked = item.status ? "checked" : "";
      let checkText = item.status ? "Deactivate" : "Activate";

      // Fix: remove any extra quotes from image path
      const fixImagePath = (img) => img.replace(/^"(.*)"$/, "$1");

      let imageHtml = "";
      if (Array.isArray(item.image)) {
        item.image.forEach((val) => {
          const imgPath = fixImagePath(val);
          imageHtml += `<div class="media-user me-2 d-flex flex-column gap-2">
                          <div><img alt="No image" class="rounded-circle" src="/${imgPath}"></div>
                        </div>`;
        });
      } else {
        const imgPath = fixImagePath(item.image);
        imageHtml = `<div class="media-user me-2 d-flex flex-column gap-2">
                       <div><img alt="No image" class="rounded-circle w-25 h-25" src="/${imgPath}"></div>
                     </div>`;
      }

      dataArr2.push([
        no,
        imageHtml,
        `<div class="form-group" data-toggle="tooltip" title="${checkText}">
            <label class="custom-switch form-switch mb-0">
                <input type="checkbox" name="custom-switch-radio" class="custom-switch-input" ${isChecked} id="customSwitch${item.id}" onchange="changeStatus('${item.id}','car_images')">
                <span class="custom-switch-indicator"></span>
            </label>
        </div>`,
        `<button class="btn btn-danger btn-sm" data-bs-toggle="tooltip" title="Delete" onclick="deleteRecord('${item.id}','car_images')">
            <span class="fe fe-trash-2 fs-12"></span>
        </button>`,
      ]);
    }

    res.json({
      draw,
      recordsTotal: Total,
      recordsFiltered: Filtered,
      data: dataArr2,
    });
  } catch (error) {
    console.error("Error in List:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// #Add images
const Add = async (req, res) => {
  try {
    const { id } = req.body;
    const galleryData = [];
    const dir = "./public/uploads/admin/cars/";

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!req.files || !req.files.image) {
      return res.json({ success: false, message: "Please select image(s) file to upload!" });
    }

    // Normalize images array
    const imagesArray = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

    for (const file of imagesArray) {
      let imagename = await sharpFileUpload.fileToUpload(file, dir, null, null);
      // Remove quotes if any
      imagename = imagename.replace(/^"(.*)"$/, "$1");
      galleryData.push({ car_id: id, image: imagename });
    }

    const isUploaded = await CarImages.bulkCreate(galleryData);

    if (isUploaded) {
      activityLogsSave(req, "add", "Car images have been added.");
      return res.json({ success: true, message: "Record has been added successfully." });
    } else {
      return res.json({ success: false, message: "Failed to add images." });
    }
  } catch (error) {
    console.error("Error in Add:", error);
    return res.json({ success: false, message: error.message });
  }
};

module.exports = {
  Page,
  List,
  Add,
};