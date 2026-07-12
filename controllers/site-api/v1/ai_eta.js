const axios = require("axios");

const Booking = require("../../../models/booking");
const DriverLocation = require("../../../models/driver_location");

const DEFAULT_AVG_SPEED_KMPH = Number(process.env.AI_ETA_AVG_SPEED_KMPH || 22);

const GOOGLE_MAPS_API_KEY =
    process.env.GOOGLE_MAP_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    "";

const OFFICE_LOCATION = {
    latitude: Number(process.env.RSL_OFFICE_LAT || 34.0008965),
    longitude: Number(process.env.RSL_OFFICE_LNG || 71.4986689),
};

exports.predictEta = async (req, res) => {
    try {
        const {
            booking_id,
            driver_id,
            pickup_lat,
            pickup_lng,
            driver_lat,
            driver_lng,
            demo_mode,
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

        const requestDriverLat = toNumberOrNull(driver_lat);
        const requestDriverLng = toNumberOrNull(driver_lng);

        const databaseDriverLat = toNumberOrNull(
            getFirstValue(locationData, [
                "latitude",
                "lat",
                "driver_lat",
                "driverLat",
                "location_lat",
            ])
        );

        const databaseDriverLng = toNumberOrNull(
            getFirstValue(locationData, [
                "longitude",
                "lng",
                "driver_lng",
                "driverLng",
                "location_lng",
            ])
        );

        const resolvedDriverLocation = resolveDriverLocation({
            requestDriverLat,
            requestDriverLng,
            databaseDriverLat,
            databaseDriverLng,
            demoMode: isTruthy(demo_mode),
        });

        const driverLat = resolvedDriverLocation.latitude;
        const driverLng = resolvedDriverLocation.longitude;
        const driverLocationSource = resolvedDriverLocation.source;

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

        if (!isValidCoordinatePair(pickupLat, pickupLng)) {
            return res.status(400).json({
                success: false,
                message:
                    "Pickup latitude/longitude is missing or invalid. Send pickup_lat and pickup_lng in request body.",
            });
        }

        const straightDistanceKm = calculateDistanceKm(
            driverLat,
            driverLng,
            pickupLat,
            pickupLng
        );

        const locationAgeMinutes =
            driverLocationSource === "database"
                ? getLocationAgeMinutes(
                    getFirstValue(locationData, [
                        "created_at",
                        "createdAt",
                        "updated_at",
                        "updatedAt",
                        "timestamp",
                        "location_time",
                        "locationTime",
                    ])
                )
                : null;

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
            pickupLatProvided: Boolean(pickup_lat && pickup_lng),
            driverLocationSource,
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
            location_source: driverLocationSource,
            driver_location_source: driverLocationSource,
            is_demo_location: driverLocationSource === "office_demo_default",
            driver_location: {
                latitude: driverLat,
                longitude: driverLng,
            },
            pickup_location: {
                latitude: pickupLat,
                longitude: pickupLng,
            },
            office_location: OFFICE_LOCATION,
            location_age_minutes: locationAgeMinutes,
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

function resolveDriverLocation({
    requestDriverLat,
    requestDriverLng,
    databaseDriverLat,
    databaseDriverLng,
    demoMode,
}) {
    if (isValidCoordinatePair(requestDriverLat, requestDriverLng)) {
        return {
            latitude: requestDriverLat,
            longitude: requestDriverLng,
            source: "request_body",
        };
    }

    if (isValidCoordinatePair(databaseDriverLat, databaseDriverLng)) {
        return {
            latitude: databaseDriverLat,
            longitude: databaseDriverLng,
            source: "database",
        };
    }

    return {
        latitude: OFFICE_LOCATION.latitude,
        longitude: OFFICE_LOCATION.longitude,
        source: demoMode ? "office_demo_default" : "office_default",
    };
}

async function getGoogleMapsEtaOrFallback({
    driverLat,
    driverLng,
    pickupLat,
    pickupLng,
    straightDistanceKm,
}) {
    if (straightDistanceKm <= 0.05) {
        return {
            etaMinutes: 0,
            distanceKm: 0,
            etaSource: "arrived",
        };
    }

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
                    element.duration_in_traffic?.value ??
                    element.duration?.value;

                const distanceMeters = element.distance?.value;

                if (
                    Number.isFinite(Number(durationSeconds)) &&
                    Number.isFinite(Number(distanceMeters))
                ) {
                    return {
                        etaMinutes: Math.max(
                            0,
                            Math.ceil(Number(durationSeconds) / 60)
                        ),
                        distanceKm: Number(distanceMeters) / 1000,
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
    if (straightDistanceKm <= 0.05) {
        return {
            etaMinutes: 0,
            distanceKm: 0,
            etaSource: "arrived",
        };
    }

    const estimatedRoadDistanceKm = straightDistanceKm * 1.5;

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
        etaMinutes: Math.max(1, baseEtaMinutes + trafficBufferMinutes),
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
    driverLocationSource,
}) {
    let confidence = etaSource === "google_maps_driving" ? 88 : 68;
    const reasons = [];

    const estimatedArrivalMinutes = Math.max(0, etaMinutes);

    if (etaSource === "arrived" || distanceKm <= 0.05) {
        return {
            estimatedArrivalMinutes: 0,
            etaRange: {
                min_minutes: 0,
                max_minutes: 1,
            },
            confidence: 95,
            status: "arrived",
            reasons: [
                "Driver is already at or very close to the pickup location",
                "Driver and pickup coordinates are almost the same",
            ],
        };
    }

    if (etaSource === "google_maps_driving") {
        reasons.push("ETA calculated using Google Maps driving route data");
        reasons.push("Actual road distance was used instead of straight-line distance");
        reasons.push("Traffic-aware Google Maps driving duration was used");
    } else {
        reasons.push("ETA calculated using conservative fallback route estimation");
        reasons.push("Straight-line distance was adjusted to estimate road distance");
        reasons.push("Traffic buffer added using AI-assisted scoring rules");
    }

    reasons.push("Driver and pickup coordinates were used for ETA prediction");

    if (pickupLatProvided) {
        confidence += 4;
        reasons.push("Pickup coordinates were provided directly in the request");
    } else {
        reasons.push("Pickup coordinates were taken from booking record");
    }

    if (driverLocationSource === "request_body") {
        confidence += 5;
        reasons.push("Driver coordinates were provided by the tracking page");
    } else if (driverLocationSource === "database") {
        confidence += 4;
        reasons.push("Driver coordinates were taken from latest tracking record");
    } else if (driverLocationSource === "office_demo_default") {
        confidence -= 6;
        reasons.push("Driver coordinates were defaulted to office location for demo mode");
    } else if (driverLocationSource === "office_default") {
        confidence -= 10;
        reasons.push("Driver coordinates were defaulted to office location because live GPS was unavailable");
    }

    if (locationAgeMinutes !== null && locationAgeMinutes !== undefined) {
        if (locationAgeMinutes <= 2) {
            confidence += 6;
            reasons.push("Driver location is recently updated");
        } else if (locationAgeMinutes <= 10) {
            confidence += 2;
            reasons.push("Driver location is acceptable but not very recent");
        } else if (locationAgeMinutes <= 30) {
            confidence -= 8;
            reasons.push("Driver location is old, ETA may be less accurate");
        } else {
            confidence -= 18;
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
        confidence -= 4;
        reasons.push("Driver may take longer to reach pickup location");
    }

    if (distanceKm > 20) {
        confidence -= 6;
        reasons.push("Long pickup distance reduced ETA confidence");
    }

    if (straightDistanceKm > 0 && distanceKm / straightDistanceKm > 2) {
        reasons.push("Road route is significantly longer than straight-line distance");
    }

    confidence = Math.max(40, Math.min(confidence, 95));

    return {
        estimatedArrivalMinutes,
        etaRange: {
            min_minutes: Math.max(0, estimatedArrivalMinutes - 4),
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
    if (value === null || value === undefined || value === "") {
        return null;
    }

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

function isValidCoordinatePair(lat, lng) {
    const latitude = Number(lat);
    const longitude = Number(lng);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return false;
    }

    if (latitude < -90 || latitude > 90) {
        return false;
    }

    if (longitude < -180 || longitude > 180) {
        return false;
    }

    if (latitude === 0 && longitude === 0) {
        return false;
    }

    return true;
}

function isTruthy(value) {
    return value === true || value === "true" || value === 1 || value === "1";
}