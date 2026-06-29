const express = require("express");
const router = express.Router();

const sequelize = require("../../config/dbconfig");
const { QueryTypes } = require("sequelize");

const PAGE_TITLE = "Safety Alerts";
const ACTION_URL = "/ap/safety-alerts";

router.get("/", async (req, res) => {
    res.redirect(`${ACTION_URL}/list`);
});

router.get("/list", async (req, res) => {
    res.render("admin/safety_alerts/list", {
        title: PAGE_TITLE,
        pageTitle: PAGE_TITLE,
        actionUrl: ACTION_URL,
        baseUrl: `${req.protocol}://${req.get("host")}`,
        successFlash: req.flash("success"),
        errorFlash: req.flash("error"),
    });
});

router.post("/list", async (req, res) => {
    try {
        const draw = Number(req.body.draw || 1);
        const start = Number(req.body.start || 0);
        const length = Number(req.body.length || 30);
        const filterStatus = req.body.filter_status;

        let where = "WHERE 1=1";
        const replacements = {
            limit: length,
            offset: start,
        };

        if (filterStatus && filterStatus !== "0") {
            where += " AND sa.status = :status";
            replacements.status = filterStatus;
        }

        const countSql = `
      SELECT COUNT(*) AS total
      FROM safety_alerts sa
      ${where}
    `;

        const rowsSql = `
      SELECT 
        sa.*,

        b.name AS passenger_name,
        b.contact_no AS passenger_phone,
        b.email AS passenger_email,

        d.name AS driver_name,
        d.contact AS driver_phone,
        d.email AS driver_email

      FROM safety_alerts sa
      LEFT JOIN bookings b ON b.id = sa.booking_id
      LEFT JOIN drivers d ON d.id = sa.driver_id
      ${where}
      ORDER BY sa.id DESC
      LIMIT :limit OFFSET :offset
    `;

        const countResult = await sequelize.query(countSql, {
            replacements,
            type: QueryTypes.SELECT,
        });

        const alerts = await sequelize.query(rowsSql, {
            replacements,
            type: QueryTypes.SELECT,
        });

        const data = alerts.map((item, index) => {
            let typeBadge = `<span class="badge bg-secondary">${item.alert_type || "-"}</span>`;

            if (item.alert_type === "sos") {
                typeBadge = `<span class="badge bg-danger">SOS</span>`;
            } else if (item.alert_type === "breakdown") {
                typeBadge = `<span class="badge bg-warning">Breakdown</span>`;
            } else if (item.alert_type === "misbehaviour") {
                typeBadge = `<span class="badge bg-primary">Misbehaviour</span>`;
            }

            const statusBadge =
                item.status === "resolved"
                    ? `<span class="badge bg-success">Resolved</span>`
                    : `<span class="badge bg-warning">Pending</span>`;

            const locationBtn =
                item.latitude && item.longitude
                    ? `<a target="_blank" class="btn btn-sm btn-info" href="https://www.google.com/maps?q=${item.latitude},${item.longitude}">Map</a>`
                    : "-";

            const passengerPhone = item.passenger_phone
                ? `<a href="tel:${item.passenger_phone}">${item.passenger_phone}</a>`
                : "-";

            const driverPhone = item.driver_phone
                ? `<a href="tel:${item.driver_phone}">${item.driver_phone}</a>`
                : "-";

            const actionBtn =
                item.status === "resolved"
                    ? `<button onclick="markPending(${item.id})" class="btn btn-sm btn-warning">Pending</button>`
                    : `<button onclick="markResolved(${item.id})" class="btn btn-sm btn-success">Resolve</button>`;

            return [
                start + index + 1,
                `#${item.booking_id || "-"}`,
                item.passenger_name || "-",
                passengerPhone,
                item.driver_name || "-",
                driverPhone,
                typeBadge,
                item.message || "-",
                item.reason || "-",
                locationBtn,
                statusBadge,
                item.created_at || "-",
                `<div class="action-btns">${actionBtn}</div>`,
            ];
        });

        res.json({
            draw,
            recordsTotal: countResult[0] ? countResult[0].total : 0,
            recordsFiltered: countResult[0] ? countResult[0].total : 0,
            data,
        });
    } catch (error) {
        console.log("Safety Alerts List Error:", error.message);

        res.json({
            draw: req.body.draw || 1,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
        });
    }
});

router.post("/resolve/:id", async (req, res) => {
    try {
        await sequelize.query(
            "UPDATE safety_alerts SET status='resolved' WHERE id=:id",
            {
                replacements: { id: req.params.id },
                type: QueryTypes.UPDATE,
            }
        );

        res.json({
            success: true,
            message: "Safety alert marked as resolved.",
        });
    } catch (error) {
        console.log("Resolve Safety Alert Error:", error.message);

        res.json({
            success: false,
            message: error.message || "Unable to resolve alert.",
        });
    }
});

router.post("/pending/:id", async (req, res) => {
    try {
        await sequelize.query(
            "UPDATE safety_alerts SET status='pending' WHERE id=:id",
            {
                replacements: { id: req.params.id },
                type: QueryTypes.UPDATE,
            }
        );

        res.json({
            success: true,
            message: "Safety alert marked as pending.",
        });
    } catch (error) {
        console.log("Pending Safety Alert Error:", error.message);

        res.json({
            success: false,
            message: error.message || "Unable to update alert.",
        });
    }
});
router.post("/status/:id", async (req, res) => {
    try {
        const { status } = req.body;

        if (!["pending", "resolved", "rejected"].includes(status)) {
            return res.json({
                success: false,
                message: "Invalid status selected.",
            });
        }

        await sequelize.query(
            "UPDATE safety_alerts SET status = :status WHERE id = :id",
            {
                replacements: {
                    status,
                    id: req.params.id,
                },
                type: QueryTypes.UPDATE,
            }
        );

        return res.json({
            success: true,
            message: "Safety alert status updated successfully.",
        });
    } catch (error) {
        console.log("Safety Status Update Error:", error.message);

        return res.json({
            success: false,
            message: error.message || "Unable to update status.",
        });
    }
});

module.exports = router;