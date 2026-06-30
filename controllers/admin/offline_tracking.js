const OfflineLocation = require("../../models/offline_location");
const Bookings = require("../../models/booking");
const Drivers = require("../../models/driver");
const { Op } = require("sequelize");

/* =====================================================
   PAGE — OFFLINE GPS TRACKING LIST
===================================================== */
const index = async (req, res) => {
    try {
        return res.render("admin/offline_tracking/list", {
            title: "Offline GPS Tracking",
            actionUrl: "/ap/offline-tracking",
            baseUrl: "",
            currentUser: req.user || {
                name: "Admin",
                roles: {
                    title: "Administrator",
                },
            },
            successFlash: req.flash("success"),
            errorFlash: req.flash("error"),
            GOOGLE_MAP_API_KEY: process.env.GOOGLE_MAP_API_KEY,
        });
    } catch (error) {
        console.log("Offline Tracking Page Error:", error);
        req.flash("error", "Something went wrong");
        return res.redirect("/ap/home");
    }
};

/* =====================================================
   AJAX — DATATABLE LIST
===================================================== */
const list = async (req, res) => {
    try {
        const start = Number(req.body.start) || 0;
        const length = Number(req.body.length) || 30;
        const searchValue =
            req.body.search && req.body.search.value ? req.body.search.value : "";

        const filterBookingId = req.body.filter_booking_id || "";
        const filterDriverId = req.body.filter_driver_id || "";

        const where = {
            isDeleted: 0,
        };

        if (filterBookingId) {
            where.booking_id = filterBookingId;
        }

        if (filterDriverId) {
            where.driver_id = filterDriverId;
        }

        if (searchValue) {
            where[Op.or] = [
                { booking_id: { [Op.like]: `%${searchValue}%` } },
                { driver_id: { [Op.like]: `%${searchValue}%` } },
                { latitude: { [Op.like]: `%${searchValue}%` } },
                { longitude: { [Op.like]: `%${searchValue}%` } },
            ];
        }

        const totalRecords = await OfflineLocation.count({
            where: { isDeleted: 0 },
        });

        const filteredRecords = await OfflineLocation.count({ where });

        const rows = await OfflineLocation.findAll({
            where,
            include: [
                {
                    model: Bookings,
                    as: "booking",
                    required: false,
                },
                {
                    model: Drivers,
                    as: "driver",
                    required: false,
                },
            ],
            order: [["id", "DESC"]],
            offset: start,
            limit: length,
        });

        const data = rows.map((item, index) => {
            const driverName = item.driver
                ? item.driver.name
                : `Driver #${item.driver_id}`;

            const recordedAt = item.recorded_at
                ? new Date(item.recorded_at).toLocaleString()
                : "N/A";

            const syncedAt = item.synced_at
                ? new Date(item.synced_at).toLocaleString()
                : "N/A";

            return [
                start + index + 1,
                item.booking_id,
                driverName,
                item.latitude,
                item.longitude,
                item.accuracy || "N/A",
                recordedAt,
                syncedAt,
                `<button class="btn btn-sm btn-primary" onclick="viewRoute(${item.booking_id})">View Route</button>`,
            ];
        });

        return res.json({
            draw: Number(req.body.draw) || 1,
            recordsTotal: totalRecords,
            recordsFiltered: filteredRecords,
            data,
        });
    } catch (error) {
        console.log("Offline Tracking List Error:", error);

        return res.json({
            draw: Number(req.body.draw) || 1,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
            error: error.message,
        });
    }
};

/* =====================================================
   AJAX — GET BOOKING ROUTE POINTS
===================================================== */
const routePoints = async (req, res) => {
    try {
        const { booking_id } = req.params;

        if (!booking_id) {
            return res.json({
                success: false,
                message: "booking_id is required",
                data: [],
            });
        }

        const points = await OfflineLocation.findAll({
            where: {
                booking_id,
                isDeleted: 0,
            },
            include: [
                {
                    model: Drivers,
                    as: "driver",
                    required: false,
                },
                {
                    model: Bookings,
                    as: "booking",
                    required: false,
                },
            ],
            order: [["recorded_at", "ASC"]],
        });

        if (!points || points.length === 0) {
            return res.json({
                success: false,
                message: "No offline route points found.",
                data: [],
            });
        }

        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];

        return res.json({
            success: true,
            message: "Offline route points fetched successfully.",
            summary: {
                booking_id: booking_id,
                driver_id: firstPoint.driver_id,
                driver_name: firstPoint.driver ? firstPoint.driver.name : "N/A",
                total_points: points.length,
                first_recorded_at: firstPoint.recorded_at,
                last_recorded_at: lastPoint.recorded_at,
                last_synced_at: lastPoint.synced_at,
            },
            data: points.map((item, index) => ({
                id: item.id,
                point_no: index + 1,
                booking_id: item.booking_id,
                driver_id: item.driver_id,
                driver_name: item.driver ? item.driver.name : "",
                latitude: Number(item.latitude),
                longitude: Number(item.longitude),
                accuracy: item.accuracy ? Number(item.accuracy) : null,
                recorded_at: item.recorded_at,
                synced_at: item.synced_at,
            })),
        });
    } catch (error) {
        console.log("Offline Route Points Error:", error);

        return res.json({
            success: false,
            message: error.message,
            data: [],
        });
    }
};

module.exports = {
    index,
    list,
    routePoints,
};