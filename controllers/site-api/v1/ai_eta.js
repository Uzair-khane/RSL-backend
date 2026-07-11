const axios = require("axios");

const Booking = require("../../../models/booking");
const DriverLocation = require("../../../models/driver_location");

const DEFAULT_AVG_SPEED_KMPH = Number(process.env.AI_ETA_AVG_SPEED_KMPH || 22);

const GOOGLE_MAPS_API_KEY =
    process.env.GOOGLE_MAP_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    "";

exports.predictEta = async (req, res) => {
    try {
        const {
            booking_id,
            driver_id,
            pickup_lat,
            pickup_lng,
            driver_lat,
            driver_lng,
        } = req.body;

        if (!booking_id || !driver_id) {
            return res.status(400).json({
                success: false,
                message: "booking_id and driver_id are required",
            });
        }

        const booking = await Booking.findByPk(booking_id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        const bookingData = toPlainObject(booking);

        let latestLocation = await DriverLocation.findOne({
            where: buildDriverLocationWhere(DriverLocation, {
                booking_id,
                driver_id,
            }),
            order: buildLatestLocationOrder(DriverLocation),
        });

        if (!latestLocation) {
            latestLocation = await DriverLocation.findOne({
                where: buildDriverOnlyWhere(DriverLocation, {
                    driver_id,
                }),
                order: buildLatestLocationOrder(DriverLocation),
            });
        }

        const locationData = latestLocation ? toPlainObject(latestLocation) : {};

        const driverLat = toNumberOrNull(
            driver_lat ||
            getFirstValue(locationData, [
                "latitude",
                "lat",
                "driver_lat",
                "driverLat",
                "location_lat",
            ])
        );

        const driverLng = toNumberOrNull(
            driver_lng ||
            getFirstValue(locationData, [
                "longitude",
                "lng",
                "driver_lng",
                "driverLng",
                "location_lng",
            ])
        );

        const pickupLat = toNumberOrNull(
            pickup_lat ||
            getFirstValue(bookingData, [
                "pickup_lat",
                "pickupLat",
                "from_lat",
                "fromLat",
                "source_lat",
                "sourceLat",
                "latitude",
            ])
        );

        const pickupLng = toNumberOrNull(
            pickup_lng ||
            getFirstValue(bookingData, [
                "pickup_lng",
                "pickupLng",
                "from_lng",
                "fromLng",
                "source_lng",
                "sourceLng",
                "longitude",
            ])
        );

        if (isMissingCoordinate(driverLat) || isMissingCoordinate(driverLng)) {
            return res.status(400).json({
                success: false,
                message:
                    "Driver latitude/longitude is missing. Update driver location first or send driver_lat and driver_lng in request body.",
            });
        }

        if (isMissingCoordinate(pickupLat) || isMissingCoordinate(pickupLng)) {
            return res.status(400).json({
                success: false,
                message:
                    "Pickup latitude/longitude is missing. Send pickup_lat and pickup_lng in request body.",
            });
        }

        const straightDistanceKm = calculateDistanceKm(
            driverLat,
            driverLng,
            pickupLat,
            pickupLng
        );

        const locationAgeMinutes = getLocationAgeMinutes(
            getFirstValue(locationData, [
                "created_at",
                "createdAt",
                "updated_at",
                "updatedAt",
                "timestamp",
                "location_time",
                "locationTime",
            ])
        );

        const routeEta = await getGoogleMapsEtaOrFallback({
            driverLat,
            driverLng,
            pickupLat,
            pickupLng,
            straightDistanceKm,
        });

        const etaResult = generateAiEtaResult({
            etaMinutes: routeEta.etaMinutes,
            distanceKm: routeEta.distanceKm,
            straightDistanceKm,
            etaSource: routeEta.etaSource,
            locationAgeMinutes,
            pickupLatProvided: Boolean(pickup_lat),
            pickupLngProvided: Boolean(pickup_lng),
            driverLatProvided: Boolean(driver_lat),
            driverLngProvided: Boolean(driver_lng),
        });

        return res.status(200).json({
            success: true,
            message: "AI ETA prediction generated successfully",
            booking_id: Number(booking_id),
            driver_id: Number(driver_id),
            estimated_arrival_minutes: etaResult.estimatedArrivalMinutes,
            eta_range: etaResult.etaRange,
            distance_km: Number(routeEta.distanceKm.toFixed(2)),
            straight_distance_km: Number(straightDistanceKm.toFixed(2)),
            confidence: etaResult.confidence,
            status: etaResult.status,
            reasons: etaResult.reasons,
            eta_source: routeEta.etaSource,
            location_source: latestLocation ? "database" : "request_body",
            driver_location: {
                latitude: driverLat,
                longitude: driverLng,
            },
            pickup_location: {
                latitude: pickupLat,
                longitude: pickupLng,
            },
            location_age_minutes: latestLocation ? locationAgeMinutes : null,
        });
    } catch (error) {
        console.error("AI ETA Prediction Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while predicting ETA",
            error: error.message,
        });
    }
};

async function getGoogleMapsEtaOrFallback({
    driverLat,
    driverLng,
    pickupLat,
    pickupLng,
    straightDistanceKm,
}) {
    if (GOOGLE_MAPS_API_KEY) {
        try {
            const response = await axios.get(
                "https://maps.googleapis.com/maps/api/distancematrix/json",
                {
                    params: {
                        origins: `${driverLat},${driverLng}`,
                        destinations: `${pickupLat},${pickupLng}`,
                        mode: "driving",
                        departure_time: "now",
                        traffic_model: "best_guess",
                        key: GOOGLE_MAPS_API_KEY,
                    },
                    timeout: 8000,
                }
            );

            const element = response.data?.rows?.[0]?.elements?.[0];

            if (element && element.status === "OK") {
                const durationSeconds =
                    element.duration_in_traffic?.value ||
                    element.duration?.value;

                const distanceMeters = element.distance?.value;

                if (durationSeconds && distanceMeters) {
                    return {
                        etaMinutes: Math.max(1, Math.ceil(durationSeconds / 60)),
                        distanceKm: distanceMeters / 1000,
                        etaSource: "google_maps_driving",
                    };
                }
            }

            console.log("Google Maps ETA response was not OK:", response.data);
        } catch (error) {
            console.log("Google Maps ETA failed. Fallback used:", error.message);
        }
    } else {
        console.log("Google Maps API key missing. Fallback ETA used.");
    }

    return getFallbackEta(straightDistanceKm);
}

function getFallbackEta(straightDistanceKm) {
    const estimatedRoadDistanceKm = straightDistanceKm * 1.7;

    let trafficBufferMinutes = 0;

    if (estimatedRoadDistanceKm <= 3) {
        trafficBufferMinutes = 4;
    } else if (estimatedRoadDistanceKm <= 7) {
        trafficBufferMinutes = 8;
    } else if (estimatedRoadDistanceKm <= 15) {
        trafficBufferMinutes = 12;
    } else {
        trafficBufferMinutes = 18;
    }

    const baseEtaMinutes = Math.ceil(
        (estimatedRoadDistanceKm / DEFAULT_AVG_SPEED_KMPH) * 60
    );

    return {
        etaMinutes: Math.max(5, baseEtaMinutes + trafficBufferMinutes),
        distanceKm: estimatedRoadDistanceKm,
        etaSource: "fallback_conservative",
    };
}

function generateAiEtaResult({
    etaMinutes,
    distanceKm,
    straightDistanceKm,
    etaSource,
    locationAgeMinutes,
    pickupLatProvided,
    pickupLngProvided,
    driverLatProvided,
    driverLngProvided,
}) {
    let confidence = etaSource === "google_maps_driving" ? 85 : 65;
    const reasons = [];

    const estimatedArrivalMinutes = Math.max(1, etaMinutes);

    if (etaSource === "google_maps_driving") {
        reasons.push("ETA calculated using Google Maps driving route data");
        reasons.push("Actual road distance was used instead of straight-line distance");
    } else {
        reasons.push("ETA calculated using conservative fallback route estimation");
        reasons.push("Straight-line distance was adjusted to estimate road distance");
    }

    reasons.push("Driver and pickup coordinates were used for ETA prediction");
    reasons.push("Traffic buffer added using AI-assisted scoring rules");

    if (pickupLatProvided && pickupLngProvided) {
        confidence += 5;
        reasons.push("Pickup coordinates were provided directly in the request");
    } else {
        reasons.push("Pickup coordinates were taken from booking record");
    }

    if (driverLatProvided && driverLngProvided) {
        confidence -= 5;
        reasons.push("Driver coordinates were provided manually for testing");
    } else {
        reasons.push("Driver coordinates were taken from latest tracking record");
    }

    if (locationAgeMinutes !== null && locationAgeMinutes !== undefined) {
        if (locationAgeMinutes <= 2) {
            confidence += 10;
            reasons.push("Driver location is recently updated");
        } else if (locationAgeMinutes <= 10) {
            confidence += 3;
            reasons.push("Driver location is acceptable but not very recent");
        } else if (locationAgeMinutes <= 30) {
            confidence -= 10;
            reasons.push("Driver location is old, ETA may be less accurate");
        } else {
            confidence -= 25;
            reasons.push("Driver location is outdated, ETA confidence reduced");
        }
    }

    let status = "normal";

    if (estimatedArrivalMinutes <= 8) {
        status = "nearby";
        reasons.push("Driver is close to pickup location");
    } else if (estimatedArrivalMinutes <= 25) {
        status = "normal";
        reasons.push("Driver is at a moderate distance from pickup location");
    } else {
        status = "delayed";
        confidence -= 5;
        reasons.push("Driver may take longer to reach pickup location");
    }

    if (distanceKm > 20) {
        confidence -= 8;
        reasons.push("Long pickup distance reduced ETA confidence");
    }

    if (straightDistanceKm > 0 && distanceKm / straightDistanceKm > 2) {
        reasons.push("Road route is significantly longer than straight-line distance");
    }

    confidence = Math.max(40, Math.min(confidence, 95));

    return {
        estimatedArrivalMinutes,
        etaRange: {
            min_minutes: Math.max(1, estimatedArrivalMinutes - 4),
            max_minutes: estimatedArrivalMinutes + 7,
        },
        confidence,
        status,
        reasons,
    };
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
}

function toRadians(value) {
    return (value * Math.PI) / 180;
}

function getLocationAgeMinutes(createdAt) {
    if (!createdAt) {
        return 999;
    }

    const locationTime = new Date(createdAt).getTime();

    if (Number.isNaN(locationTime)) {
        return 999;
    }

    const currentTime = new Date().getTime();
    const ageMinutes = Math.floor((currentTime - locationTime) / 60000);

    return Math.max(0, ageMinutes);
}

function buildDriverLocationWhere(model, { booking_id, driver_id }) {
    const where = {};

    const driverField = getExistingModelField(model, [
        "driver_id",
        "driverId",
        "driver",
    ]);

    const bookingField = getExistingModelField(model, [
        "booking_id",
        "bookingId",
        "booking",
    ]);

    if (driverField) {
        where[driverField] = driver_id;
    }

    if (bookingField) {
        where[bookingField] = booking_id;
    }

    return where;
}

function buildDriverOnlyWhere(model, { driver_id }) {
    const where = {};

    const driverField = getExistingModelField(model, [
        "driver_id",
        "driverId",
        "driver",
    ]);

    if (driverField) {
        where[driverField] = driver_id;
    }

    return where;
}

function buildLatestLocationOrder(model) {
    const orderField =
        getExistingModelField(model, [
            "created_at",
            "createdAt",
            "updated_at",
            "updatedAt",
            "timestamp",
            "location_time",
            "locationTime",
            "id",
        ]) || "id";

    return [[orderField, "DESC"]];
}

function getExistingModelField(model, candidates) {
    const attributes = model.rawAttributes || {};

    return candidates.find((field) =>
        Object.prototype.hasOwnProperty.call(attributes, field)
    );
}

function getFirstValue(object, keys) {
    for (const key of keys) {
        if (
            object &&
            object[key] !== undefined &&
            object[key] !== null &&
            object[key] !== ""
        ) {
            return object[key];
        }
    }

    return null;
}

function toNumberOrNull(value) {
    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
        return null;
    }

    return numberValue;
}

function toPlainObject(record) {
    if (!record) {
        return {};
    }

    if (typeof record.get === "function") {
        return record.get({ plain: true });
    }

    return record;
}

function isMissingCoordinate(value) {
    return value === null || value === undefined || Number.isNaN(Number(value));
}