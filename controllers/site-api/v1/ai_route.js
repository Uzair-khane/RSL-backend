const axios = require("axios");

const Booking = require("../../../models/booking");

const GOOGLE_MAPS_API_KEY =
    process.env.GOOGLE_MAP_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    "";

const DEFAULT_AVG_SPEED_KMPH = Number(process.env.AI_ROUTE_AVG_SPEED_KMPH || 28);
const DEFAULT_DEVIATION_THRESHOLD_METERS = Number(
    process.env.AI_ROUTE_DEVIATION_THRESHOLD_METERS || 500
);

/* =====================================================
   1. SMART ROUTE OPTIMIZATION
   Pickup -> Drop fastest traffic-aware route
===================================================== */
exports.optimizeRoute = async (req, res) => {
    try {
        const {
            booking_id,
            pickup_lat,
            pickup_lng,
            drop_lat,
            drop_lng
        } = req.body;

        let booking = null;

        if (booking_id) {
            booking = await Booking.findOne({
                where: {
                    id: booking_id,
                    isDeleted: 0
                }
            });
        }

        const pickupLat = toNumberOrNull(pickup_lat);
        const pickupLng = toNumberOrNull(pickup_lng);
        const dropLat = toNumberOrNull(drop_lat);
        const dropLng = toNumberOrNull(drop_lng);

        if (!isValidCoordinatePair(pickupLat, pickupLng)) {
            return res.status(400).json({
                success: false,
                message: "pickup_lat and pickup_lng are required and must be valid coordinates."
            });
        }

        if (!isValidCoordinatePair(dropLat, dropLng)) {
            return res.status(400).json({
                success: false,
                message: "drop_lat and drop_lng are required and must be valid coordinates."
            });
        }

        const routeResult = await getOptimizedRouteData({
            pickupLat,
            pickupLng,
            dropLat,
            dropLng
        });

        return res.status(200).json({
            success: true,
            message: "AI smart route optimization completed successfully.",
            booking_id: booking ? booking.id : booking_id || null,
            pickup_location: {
                latitude: pickupLat,
                longitude: pickupLng
            },
            drop_location: {
                latitude: dropLat,
                longitude: dropLng
            },
            best_route: routeResult.bestRoute,
            alternative_routes: routeResult.alternativeRoutes,
            route_polyline: routeResult.routePolyline,
            distance_km: routeResult.distanceKm,
            duration_minutes: routeResult.durationMinutes,
            traffic_saved_minutes: routeResult.trafficSavedMinutes,
            confidence: routeResult.confidence,
            source: routeResult.source,
            reasons: routeResult.reasons,
            recommendation: routeResult.recommendation
        });

    } catch (error) {
        console.error("AI Route Optimization Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while optimizing route.",
            error: error.message
        });
    }
};

/* =====================================================
   2. AI ROUTE DEVIATION DETECTION
   Driver location compare with optimized route
===================================================== */
exports.checkRouteDeviation = async (req, res) => {
    try {
        const {
            booking_id,
            driver_lat,
            driver_lng,
            pickup_lat,
            pickup_lng,
            drop_lat,
            drop_lng,
            route_polyline,
            threshold_meters
        } = req.body;

        const driverLat = toNumberOrNull(driver_lat);
        const driverLng = toNumberOrNull(driver_lng);

        const thresholdMeters =
            Number(threshold_meters) > 0
                ? Number(threshold_meters)
                : DEFAULT_DEVIATION_THRESHOLD_METERS;

        if (!isValidCoordinatePair(driverLat, driverLng)) {
            return res.status(400).json({
                success: false,
                message: "driver_lat and driver_lng are required and must be valid coordinates."
            });
        }

        let finalPolyline = route_polyline || null;
        let routeSource = route_polyline ? "request_polyline" : "generated_from_google_maps";

        if (!finalPolyline) {
            const pickupLat = toNumberOrNull(pickup_lat);
            const pickupLng = toNumberOrNull(pickup_lng);
            const dropLat = toNumberOrNull(drop_lat);
            const dropLng = toNumberOrNull(drop_lng);

            if (!isValidCoordinatePair(pickupLat, pickupLng) || !isValidCoordinatePair(dropLat, dropLng)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "route_polyline is missing. Send route_polyline or pickup/drop coordinates."
                });
            }

            const optimizedRoute = await getOptimizedRouteData({
                pickupLat,
                pickupLng,
                dropLat,
                dropLng
            });

            finalPolyline = optimizedRoute.routePolyline;
            routeSource = optimizedRoute.source;
        }

        if (!finalPolyline) {
            return res.status(400).json({
                success: false,
                message: "Route polyline could not be generated. Cannot check deviation."
            });
        }

        const routePoints = decodePolyline(finalPolyline);

        if (!routePoints || routePoints.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Invalid route polyline. Cannot check deviation."
            });
        }

        const deviationResult = calculateRouteDeviation({
            driverLat,
            driverLng,
            routePoints,
            thresholdMeters
        });

        return res.status(200).json({
            success: true,
            message: deviationResult.deviated
                ? "Driver has deviated from the expected route."
                : "Driver is within the expected route boundary.",
            booking_id: booking_id || null,
            deviated: deviationResult.deviated,
            risk_level: deviationResult.riskLevel,
            distance_from_route_meters: deviationResult.distanceFromRouteMeters,
            threshold_meters: thresholdMeters,
            nearest_route_point: deviationResult.nearestRoutePoint,
            route_source: routeSource,
            driver_location: {
                latitude: driverLat,
                longitude: driverLng
            },
            confidence: deviationResult.confidence,
            reasons: deviationResult.reasons,
            recommendation: deviationResult.recommendation
        });

    } catch (error) {
        console.error("AI Route Deviation Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while checking route deviation.",
            error: error.message
        });
    }
};

/* =====================================================
   GOOGLE MAPS ROUTE OPTIMIZER
===================================================== */
async function getOptimizedRouteData({
    pickupLat,
    pickupLng,
    dropLat,
    dropLng
}) {
    const straightDistanceKm = calculateDistanceKm(
        pickupLat,
        pickupLng,
        dropLat,
        dropLng
    );

    if (!GOOGLE_MAPS_API_KEY) {
        return getFallbackRoute({
            straightDistanceKm
        });
    }

    try {
        const response = await axios.get(
            "https://maps.googleapis.com/maps/api/directions/json",
            {
                params: {
                    origin: `${pickupLat},${pickupLng}`,
                    destination: `${dropLat},${dropLng}`,
                    mode: "driving",
                    alternatives: true,
                    departure_time: "now",
                    traffic_model: "best_guess",
                    key: GOOGLE_MAPS_API_KEY
                },
                timeout: Number(process.env.GOOGLE_MAPS_TIMEOUT_MS || 12000)
            }
        );

        if (response.data?.status !== "OK") {
            console.log("Google Directions API response was not OK:", response.data);
            return getFallbackRoute({
                straightDistanceKm
            });
        }

        const routes = response.data.routes || [];

        const normalizedRoutes = routes
            .map((route, index) => {
                const leg = route.legs?.[0] || {};

                const distanceMeters = Number(leg.distance?.value || 0);
                const durationSeconds = Number(
                    leg.duration_in_traffic?.value ||
                    leg.duration?.value ||
                    0
                );

                if (!distanceMeters || !durationSeconds) {
                    return null;
                }

                return {
                    index,
                    summary: route.summary || `Route ${index + 1}`,
                    distance_meters: distanceMeters,
                    distance_km: Number((distanceMeters / 1000).toFixed(2)),
                    duration_seconds: durationSeconds,
                    duration_minutes: Math.ceil(durationSeconds / 60),
                    polyline: route.overview_polyline?.points || null
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.duration_seconds - b.duration_seconds);

        if (!normalizedRoutes.length) {
            return getFallbackRoute({
                straightDistanceKm
            });
        }

        const best = normalizedRoutes[0];
        const slowest = normalizedRoutes[normalizedRoutes.length - 1];

        const trafficSavedMinutes =
            normalizedRoutes.length > 1
                ? Math.max(0, Math.ceil((slowest.duration_seconds - best.duration_seconds) / 60))
                : 0;

        const alternativeRoutes = normalizedRoutes.map((route, index) => ({
            rank: index + 1,
            summary: route.summary,
            distance_km: route.distance_km,
            duration_minutes: route.duration_minutes
        }));

        const reasons = [
            "Google Maps Directions API was used to compare available driving routes.",
            "Traffic-aware travel time was used for route selection.",
            "The route with the lowest estimated driving duration was selected."
        ];

        if (trafficSavedMinutes > 0) {
            reasons.push(`The selected route may save around ${trafficSavedMinutes} minute(s) compared with the slowest option.`);
        }

        return {
            bestRoute: {
                summary: best.summary,
                distance_km: best.distance_km,
                duration_minutes: best.duration_minutes
            },
            alternativeRoutes,
            routePolyline: best.polyline,
            distanceKm: best.distance_km,
            durationMinutes: best.duration_minutes,
            trafficSavedMinutes,
            confidence: normalizedRoutes.length > 1 ? 92 : 86,
            source: "google_maps_directions",
            reasons,
            recommendation:
                "Use this route for driver navigation because it has the best estimated travel time."
        };

    } catch (error) {
        console.log("Google Directions API failed. Fallback route used:", error.message);

        return getFallbackRoute({
            straightDistanceKm
        });
    }
}

/* =====================================================
   FALLBACK ROUTE IF GOOGLE MAPS FAILS
===================================================== */
function getFallbackRoute({ straightDistanceKm }) {
    const estimatedRoadDistanceKm = straightDistanceKm * 1.35;

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

    const baseMinutes = Math.ceil(
        (estimatedRoadDistanceKm / DEFAULT_AVG_SPEED_KMPH) * 60
    );

    const durationMinutes = Math.max(1, baseMinutes + trafficBufferMinutes);

    return {
        bestRoute: {
            summary: "AI fallback route estimation",
            distance_km: Number(estimatedRoadDistanceKm.toFixed(2)),
            duration_minutes: durationMinutes
        },
        alternativeRoutes: [
            {
                rank: 1,
                summary: "AI fallback route estimation",
                distance_km: Number(estimatedRoadDistanceKm.toFixed(2)),
                duration_minutes: durationMinutes
            }
        ],
        routePolyline: null,
        distanceKm: Number(estimatedRoadDistanceKm.toFixed(2)),
        durationMinutes,
        trafficSavedMinutes: 0,
        confidence: 62,
        source: "fallback_ai_estimation",
        reasons: [
            "Google Maps Directions API was unavailable or returned no valid route.",
            "Straight-line distance was adjusted to estimate real road distance.",
            "Traffic buffer was added using AI-assisted route scoring rules."
        ],
        recommendation:
            "Use this estimated route only as a fallback. Google Maps route should be preferred when available."
    };
}

/* =====================================================
   ROUTE DEVIATION CALCULATION
===================================================== */
function calculateRouteDeviation({
    driverLat,
    driverLng,
    routePoints,
    thresholdMeters
}) {
    let minDistanceMeters = Infinity;
    let nearestRoutePoint = null;

    for (let i = 0; i < routePoints.length - 1; i++) {
        const start = routePoints[i];
        const end = routePoints[i + 1];

        const result = distancePointToSegmentMeters(
            { lat: driverLat, lng: driverLng },
            start,
            end
        );

        if (result.distanceMeters < minDistanceMeters) {
            minDistanceMeters = result.distanceMeters;
            nearestRoutePoint = result.nearestPoint;
        }
    }

    const distanceRounded = Math.round(minDistanceMeters);
    const deviated = distanceRounded > thresholdMeters;

    let riskLevel = "low";
    let confidence = 88;

    const reasons = [
        "Driver GPS location was compared with the optimized route path.",
        `Allowed route deviation threshold is ${thresholdMeters} meters.`
    ];

    if (deviated) {
        if (distanceRounded > thresholdMeters * 2) {
            riskLevel = "high";
            confidence = 92;
            reasons.push("Driver is far away from the expected route.");
        } else {
            riskLevel = "medium";
            confidence = 86;
            reasons.push("Driver is outside the allowed route boundary.");
        }
    } else {
        riskLevel = "low";
        confidence = 90;
        reasons.push("Driver is still inside the expected route boundary.");
    }

    return {
        deviated,
        riskLevel,
        distanceFromRouteMeters: distanceRounded,
        nearestRoutePoint,
        confidence,
        reasons,
        recommendation: deviated
            ? "Notify passenger/admin and continue monitoring driver movement."
            : "No alert required. Continue normal ride tracking."
    };
}

/* =====================================================
   POLYLINE DECODER
===================================================== */
function decodePolyline(encoded) {
    if (!encoded || typeof encoded !== "string") {
        return [];
    }

    let index = 0;
    const len = encoded.length;
    const path = [];
    let lat = 0;
    let lng = 0;

    while (index < len) {
        let b;
        let shift = 0;
        let result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlat = result & 1 ? ~(result >> 1) : result >> 1;
        lat += dlat;

        shift = 0;
        result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlng = result & 1 ? ~(result >> 1) : result >> 1;
        lng += dlng;

        path.push({
            lat: lat / 1e5,
            lng: lng / 1e5
        });
    }

    return path;
}

/* =====================================================
   GEO HELPERS
===================================================== */
function distancePointToSegmentMeters(point, segmentStart, segmentEnd) {
    const avgLat = toRadians((point.lat + segmentStart.lat + segmentEnd.lat) / 3);

    const pointXY = latLngToXY(point, avgLat);
    const startXY = latLngToXY(segmentStart, avgLat);
    const endXY = latLngToXY(segmentEnd, avgLat);

    const dx = endXY.x - startXY.x;
    const dy = endXY.y - startXY.y;

    if (dx === 0 && dy === 0) {
        const distanceMeters = calculateDistanceKm(
            point.lat,
            point.lng,
            segmentStart.lat,
            segmentStart.lng
        ) * 1000;

        return {
            distanceMeters,
            nearestPoint: segmentStart
        };
    }

    const t =
        ((pointXY.x - startXY.x) * dx + (pointXY.y - startXY.y) * dy) /
        (dx * dx + dy * dy);

    const clampedT = Math.max(0, Math.min(1, t));

    const nearestXY = {
        x: startXY.x + clampedT * dx,
        y: startXY.y + clampedT * dy
    };

    const nearestPoint = xyToLatLng(nearestXY, avgLat);

    const distanceMeters = calculateDistanceKm(
        point.lat,
        point.lng,
        nearestPoint.lat,
        nearestPoint.lng
    ) * 1000;

    return {
        distanceMeters,
        nearestPoint
    };
}

function latLngToXY(point, avgLatRadians) {
    return {
        x: point.lng * 111320 * Math.cos(avgLatRadians),
        y: point.lat * 110540
    };
}

function xyToLatLng(point, avgLatRadians) {
    return {
        lat: point.y / 110540,
        lng: point.x / (111320 * Math.cos(avgLatRadians))
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
    return (Number(value) * Math.PI) / 180;
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