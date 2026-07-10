const AiRecommendationLog = require("../../models/ai_recommendation_log");
const { Sequelize } = require("sequelize");

const baseUrl = "/ap";
const routeUrl = "/ap/ai-recommendation-logs";

/* =====================================================
   AI RECOMMENDATION LOGS PAGE
===================================================== */
const Page = async (req, res) => {
    try {
        return res.render("admin/ai-recommendation-logs/list", {
            successFlash: req.flash("success"),
            errorFlash: req.flash("error").join("<br />"),

            title: "Taxi App | AI Recommendation Logs",
            pageTitle: "AI Recommendation Logs",

            baseUrl: baseUrl,
            actionUrl: routeUrl,
        });
    } catch (error) {
        console.log("AI Recommendation Logs Page Error:", error);

        return res.status(500).send("Internal server error");
    }
};

/* =====================================================
   AI RECOMMENDATION LOGS DATATABLE LIST
===================================================== */
const List = async (req, res) => {
    try {
        let {
            start,
            length,
            draw,
            search,
            filter_recommendation_type,
            filter_ride_type,
        } = req.body;

        start = Number(start) || 0;
        length = Number(length) || 10;

        const searchStr = {};

        /* =========================
           FILTER: RECOMMENDATION TYPE
        ========================= */
        if (
            filter_recommendation_type &&
            filter_recommendation_type !== "0"
        ) {
            searchStr.recommendation_type = filter_recommendation_type;
        }

        /* =========================
           FILTER: RIDE TYPE
        ========================= */
        if (filter_ride_type && filter_ride_type !== "0") {
            searchStr.ride_type = filter_ride_type;
        }

        /* =========================
           SEARCH
        ========================= */
        if (search && search.value) {
            const searchValue = search.value;

            searchStr[Sequelize.Op.or] = [
                {
                    email: {
                        [Sequelize.Op.like]: `%${searchValue}%`,
                    },
                },
                {
                    ride_type: {
                        [Sequelize.Op.like]: `%${searchValue}%`,
                    },
                },
                {
                    recommendation_type: {
                        [Sequelize.Op.like]: `%${searchValue}%`,
                    },
                },
                {
                    recommended_car_title: {
                        [Sequelize.Op.like]: `%${searchValue}%`,
                    },
                },
            ];
        }

        /* =========================
           FETCH DATA
        ========================= */
        const queryOptions = {
            where: searchStr,
            offset: start,
            order: [["id", "DESC"]],
        };

        if (length !== -1) {
            queryOptions.limit = length;
        }

        const dataList = await AiRecommendationLog.findAll(queryOptions);

        const totalRecords = await AiRecommendationLog.count();

        const filteredRecords = await AiRecommendationLog.count({
            where: searchStr,
        });

        /* =========================
           FORMAT DATATABLE DATA
        ========================= */
        let no = start;
        const dataArr = [];

        dataList.forEach((item) => {
            no++;

            let reasons = "N/A";

            try {
                const parsedReasons = JSON.parse(item.reasons || "[]");

                if (
                    Array.isArray(parsedReasons) &&
                    parsedReasons.length > 0
                ) {
                    reasons = parsedReasons.join("<br>");
                }
            } catch (error) {
                reasons = item.reasons || "N/A";
            }

            const createdAt = item.createdAt
                ? new Date(item.createdAt).toLocaleString()
                : "N/A";

            dataArr.push([
                no,
                item.email || "N/A",
                item.ride_type || "N/A",
                item.recommendation_type || "N/A",
                item.recommended_car_title || "N/A",
                `${item.confidence || 0}%`,
                item.previous_bookings_count || 0,
                reasons,
                createdAt,
            ]);
        });

        return res.send({
            draw: Number(draw),
            recordsTotal: totalRecords,
            recordsFiltered: filteredRecords,
            data: dataArr,
        });
    } catch (error) {
        console.log("AI Recommendation Logs List Error:", error);

        return res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    Page,
    List,
};