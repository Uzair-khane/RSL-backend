const express = require("express"),
  { Sequelize, Op, Model, DataTypes, QueryTypes } = require("sequelize"),
  router = express.Router();

const sequelize = require("../../config/dbconfig");
const { activityLogsSave } = require("../../modules/activity-logs");

// get table name
const getTable = async (table) => {
  const tables = [
    "activity_logs",
    "complaints",
    "downloads",
    "feedbacks",
    "settings",
    "setting_images",
    "menus",
    "roles",
    "role_menus",
    "users",
    "pages",
    "drivers",
    "cars",
    "bookings",
    "driver_car",
    "prices",
    "news_events",
    "car_images",
    "complaints",
    "car_services",
    "accounts",
    "accounts_history"
  ];
  for (let item in tables) {
    if (tables[item] == table) {
      return tables[item];
    }
    continue;
  }
  return false;
};

// edit record
router.post("/edit/record", async (req, res) => {
  let { id, source_table } = req.body;
  try {
    let TableFound = await getTable(source_table);
    if (TableFound && id) {
      const record = await sequelize.query(
        `SELECT * FROM ${TableFound} WHERE id = ${id}`,
        { type: QueryTypes.SELECT }
      );
      if (record && record.length > 0) {
        return res.send({
          success: true,
          message: `Record found.`,
          data: record[0],
        });
      }
    }
  } catch (err) {
    return res.send({ success: false, message: `${err}` });
  }
});

// soft delete record
router.post("/delete/record", async (req, res) => {
  let { id, source_table } = req.body;
  try {
    let TableFound = await getTable(source_table);
    if (TableFound && id) {
      const record = await sequelize.query(
        `SELECT * FROM ${TableFound} WHERE id = ${id}`,
        { type: QueryTypes.SELECT }
      );
      if (record && record.length > 0) {
        if (record[0] && record[0].isDeleted != undefined) {
          let isDelete = (await record[0].isDelete) ? 0 : 1;
          const [results, metadata] = await sequelize.query(
            `UPDATE ${TableFound} SET isDeleted = ${isDelete} WHERE id = ${id}`
          );
          if (results) {
            /**********************Activity Logs****************************************** */
            activityLogsSave(
              req,
              (action = "delete"),
              (detail = `ID = ${id} record has been deleted from ${TableFound}.`)
            );
            /**********************./Activity Logs**************************************** */
            return res.send({
              success: true,
              message: `Record has been deleted successfully.`,
            });
          }
        } else {
          const [results, metadata] = await sequelize.query(
            `DELETE FROM ${TableFound} WHERE id = ${id}`
          );
          if (results) {
            /**********************Activity Logs****************************************** */
            activityLogsSave(
              req,
              (action = "delete"),
              (detail = `ID = ${id} record has been deleted from ${TableFound}.`)
            );
            /**********************./Activity Logs**************************************** */
            return res.send({
              success: true,
              message: `Record has been deleted successfully.`,
            });
          }
        }
      }
    }
  } catch (err) {
    return res.send({ success: false, message: `${err}` });
  }
});

// hard delete record
router.post("/delete/record/hard", async (req, res) => {
  let { id, source_table } = req.body;
  try {
    let TableFound = await getTable(source_table);
    if (TableFound && id) {
      const record = await sequelize.query(
        `SELECT * FROM ${TableFound} WHERE id = ${id}`,
        { type: QueryTypes.SELECT }
      );
      if (record && record.length > 0) {
        const [results, metadata] = await sequelize.query(
          `DELETE FROM ${TableFound} WHERE id = ${id}`
        );
        if (results) {
          /**********************Activity Logs****************************************** */
          activityLogsSave(
            req,
            (action = "delete"),
            (detail = `ID = ${id} record has been hard deleted from ${TableFound}.`)
          );
          /**********************./Activity Logs**************************************** */
          return res.send({
            success: true,
            message: `Record has been deleted successfully.`,
          });
        }
      }
    }
  } catch (err) {
    return res.send({ success: false, message: `${err}` });
  }
});

// change status
router.post("/status/change", async (req, res) => {
  let { id, source_table } = req.body;
  var results;
  try {
    let TableFound = await getTable(source_table);
    if (TableFound && id) {
      const record = await sequelize.query(
        `SELECT * FROM ${TableFound} WHERE id = ${id}`,
        { type: QueryTypes.SELECT }
      );
      if (record && record.length > 0) {
        let isActive = (await record[0].status) ? 0 : 1;        
          results = await sequelize.query(`
                        UPDATE ${TableFound} 
                        SET status = ${isActive} 
                        WHERE id = ${id}
                    `);
        if (results) {
          /**********************Activity Logs****************************************** */
          activityLogsSave(
            req,
            (action = "update"),
            (detail = `ID = ${id} record status has been changed to ${isActive} from ${TableFound}.`)
          );
          /**********************./Activity Logs**************************************** */
          return res.send({
            success: true,
            message: `Record status has been changed.`,
          });
        }
        return res.send({ success: false, message: `Record not found.` });
      }
    }
  } catch (err) {
    return res.send({ success: false, message: `${err}` });
  }
});

// change feature
router.post("/status/change", async (req, res) => {
  let { id, source_table } = req.body;
  var results;

  try {
    let TableFound = await getTable(source_table); // Resolve table name dynamically
    if (TableFound && id) {
      // Step 1: Fetch the record from the table
      const record = await sequelize.query(
        `SELECT * FROM ${TableFound} WHERE id = ${id}`,
        { type: QueryTypes.SELECT }
      );

      if (record && record.length > 0) {
        let isActive = record[0].status ? 0 : 1; 
          results = await sequelize.query(`
            UPDATE ${TableFound}
            SET status = ${isActive}
            WHERE id = ${id}
          `);
        if (results) {
          /**********************Activity Logs******************************************/
          activityLogsSave(
            req,
            (action = "update"),
            (detail = `ID = ${id} record status has been changed to ${isActive} in ${TableFound}.`)
          );
          /**********************./Activity Logs****************************************/

          return res.send({
            success: true,
            message: `Record status has been changed.`,
          });
        }

        return res.send({ success: false, message: `Record not found.` });
      }
    }

    return res.send({ success: false, message: `Invalid table or record ID.` });
  } catch (err) {
    return res.send({ success: false, message: `Error: ${err.message}` });
  }
});


// change top status
router.post("/top-status", async (req, res) => {
  let { id, source_table } = req.body;
  try {
    let TableFound = await getTable(source_table);
    if (TableFound && id) {
      const record = await sequelize.query(
        `SELECT * FROM ${TableFound} WHERE id = ${id}`,
        { type: QueryTypes.SELECT }
      );
      if (record && record.length > 0) {
        let isTop = (await record[0].is_top) ? 0 : 1;
        const [results, metadata] = await sequelize.query(
          `UPDATE ${TableFound} SET is_top = ${isTop} WHERE id = ${id}`
        );
        if (results) {
          /**********************Activity Logs****************************************** */
          activityLogsSave(
            req,
            (action = "update"),
            (detail = `ID = ${id} record is_top status changed to ${isTop} from ${TableFound}.`)
          );
          /**********************./Activity Logs**************************************** */
          return res.send({
            success: true,
            message: `Record status has been changed.`,
          });
        }
      }
    }
  } catch (err) {
    return res.send({ success: false, message: `${err}` });
  }
});

//view record
router.post("/view/record", async (req, res) => {
  let { id, source_table } = req.body;
  try {
    let TableFound = await getTable(source_table);
    if (TableFound && id) {
      const record = await sequelize.query(
        `SELECT * FROM ${TableFound} WHERE id = ${id}`,
        { type: QueryTypes.SELECT }
      );
      if (record && record.length > 0) {
        console.log(record);
        return res.send({
          success: true,
          message: `Record found.`,
          data: record[0],
        });
      }
    }
  } catch (err) {
    return res.send({ success: false, message: `${err}` });
  }
});

module.exports = router;
