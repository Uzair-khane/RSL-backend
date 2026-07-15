const axios = require("axios");

const Booking = require("../../../models/booking");
const { sendEmail } = require("../../../helpers/sendEmail");

const GOOGLE_MAPS_API_KEY =
    process.env.GOOGLE_MAP_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    "";

const DEFAULT_AVG_SPEED_KMPH = Number(process.env.AI_ROUTE_AVG_SPEED_KMPH || 28);
const DEFAULT_DEVIATION_THRESHOLD_METERS = Number(
    process.env.AI_ROUTE_DEVIATION_THRESHOLD_METERS || 500
);
const REQUIRED_OFF_ROUTE_COUNT = Number(
    process.env.AI_REQUIRED_OFF_ROUTE_COUNT || 3
);

/*
  FYP demo storage:
  - optimizedRoutesStore stores fetched route options per booking
  - selectedRouteStore stores driver-selected active route per booking
  - deviationStateStore stores consecutive off-route count per booking/driver

  Later, if you want permanent audit logging, we can move this to MySQL tables:
  booking_routes
  route_deviation_logs
*/
const optimizedRoutesStore = new Map();
const selectedRouteStore = new Map();
const deviationStateStore = new Map();

/* =====================================================
   1. SMART ROUTE OPTIMIZATION — MULTIPLE ROUTES
   Pickup -> Drop fastest traffic-aware route
===================================================== */
exports.optimizeRoutes = async (req, res) => {
    try {
        const {
            booking_id,
            pickup_lat,
            pickup_lng,
            drop_lat,
            drop_lng,
            ride_type,
            price_per_km,
            hourly_rate,
            hours,
            original_fare,
            gps_accuracy_meters
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

        const routeResult = await getOptimizedRoutesData({
            pickupLat,
            pickupLng,
            dropLat,
            dropLng,
            rideType: ride_type,
            pricePerKm: price_per_km,
            hourlyRate: hourly_rate,
            hours,
            originalFare: original_fare,
            gpsAccuracyMeters: gps_accuracy_meters
        });

        const bookingKey = getBookingKey(booking_id);

        if (bookingKey) {
            optimizedRoutesStore.set(bookingKey, {
                booking_id,
                pickup_location: {
                    latitude: pickupLat,
                    longitude: pickupLng
                },
                drop_location: {
                    latitude: dropLat,
                    longitude: dropLng
                },
                routes: routeResult.routes,
                recommended_route_id: routeResult.recommendedRouteId,
                created_at: new Date().toISOString()
            });

            if (!selectedRouteStore.has(bookingKey)) {
                const recommendedRoute = routeResult.routes.find(
                    (route) => route.route_id === routeResult.recommendedRouteId
                );

                if (recommendedRoute) {
                    selectedRouteStore.set(bookingKey, {
                        booking_id,
                        driver_id: null,
                        selected_route_id: recommendedRoute.route_id,
                        selected_by: "system_recommendation",
                        selected_at: new Date().toISOString(),
                        route: recommendedRoute
                    });
                }
            }
        }

        const recommendedRoute = routeResult.routes.find(
            (route) => route.route_id === routeResult.recommendedRouteId
        ) || routeResult.routes[0];

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

            // new response
            recommended_route_id: routeResult.recommendedRouteId,
            routes: routeResult.routes,

            // backward-compatible response for current frontend
            best_route: recommendedRoute
                ? {
                    route_id: recommendedRoute.route_id,
                    summary: recommendedRoute.summary,
                    distance_km: recommendedRoute.distance_km,
                    duration_minutes: recommendedRoute.duration_in_traffic_minutes
                }
                : null,
            alternative_routes: routeResult.routes.map((route) => ({
                route_id: route.route_id,
                rank: route.rank,
                summary: route.summary,
                distance_km: route.distance_km,
                duration_minutes: route.duration_in_traffic_minutes,
                is_recommended: route.is_recommended
            })),
            route_polyline: recommendedRoute?.encoded_polyline || null,
            distance_km: recommendedRoute?.distance_km || 0,
            duration_minutes: recommendedRoute?.duration_in_traffic_minutes || 0,
            traffic_saved_minutes: routeResult.trafficSavedMinutes,
            confidence: recommendedRoute?.confidence || 0,
            source: routeResult.source,
            reasons: recommendedRoute?.reasons || routeResult.reasons,
            recommendation: recommendedRoute?.recommendation || routeResult.recommendation
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

/* Backward compatibility: old endpoint can still call optimizeRoute */
exports.optimizeRoute = exports.optimizeRoutes;

/* =====================================================
   2. DRIVER SELECTS ROUTE
===================================================== */
exports.selectRoute = async (req, res) => {
    try {
        const {
            booking_id,
            driver_id,
            selected_route_id,
            selected_by,
            reason
        } = req.body;

        if (!booking_id || !selected_route_id) {
            return res.status(400).json({
                success: false,
                message: "booking_id and selected_route_id are required."
            });
        }

        const bookingKey = getBookingKey(booking_id);
        const storedRoutes = optimizedRoutesStore.get(bookingKey);

        if (!storedRoutes || !storedRoutes.routes || !storedRoutes.routes.length) {
            return res.status(404).json({
                success: false,
                message: "No optimized routes found for this booking. Run optimize-routes first."
            });
        }

        const selectedRoute = storedRoutes.routes.find(
            (route) => route.route_id === selected_route_id
        );

        if (!selectedRoute) {
            return res.status(404).json({
                success: false,
                message: "Selected route was not found in optimized route options."
            });
        }

        const selectionRecord = {
            booking_id,
            driver_id: driver_id || null,
            selected_route_id,
            selected_by: selected_by || "driver",
            reason: reason || null,
            selected_at: new Date().toISOString(),
            route: selectedRoute
        };

        selectedRouteStore.set(bookingKey, selectionRecord);

        return res.status(200).json({
            success: true,
            message: "Driver selected route saved successfully.",
            active_route: selectedRoute,
            audit: {
                booking_id,
                driver_id: driver_id || null,
                selected_route_id,
                selected_by: selected_by || "driver",
                reason: reason || null,
                selected_at: selectionRecord.selected_at
            }
        });

    } catch (error) {
        console.error("AI Select Route Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while selecting route.",
            error: error.message
        });
    }
};

/* =====================================================
   3. GET ACTIVE SELECTED ROUTE
===================================================== */
exports.getSelectedRoute = async (req, res) => {
    try {
        const bookingId = req.params.booking_id || req.query.booking_id;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "booking_id is required."
            });
        }

        const bookingKey = getBookingKey(bookingId);
        const selectedRoute = selectedRouteStore.get(bookingKey);

        if (!selectedRoute) {
            return res.status(404).json({
                success: false,
                message: "No selected route found for this booking."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Selected route fetched successfully.",
            data: selectedRoute
        });

    } catch (error) {
        console.error("AI Get Selected Route Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching selected route.",
            error: error.message
        });
    }
};

/* =====================================================
   4. IMPROVED ROUTE DEVIATION DETECTION
===================================================== */
exports.checkRouteDeviation = async (req, res) => {
    try {
        const {
            booking_id,
            driver_id,
            driver_lat,
            driver_lng,
            pickup_lat,
            pickup_lng,
            drop_lat,
            drop_lng,
            route_polyline,
            threshold_meters,
            road_type,
            speed_kmph,
            gps_accuracy_meters,
            driver_email
        } = req.body;

        const driverLat = toNumberOrNull(driver_lat);
        const driverLng = toNumberOrNull(driver_lng);

        if (!isValidCoordinatePair(driverLat, driverLng)) {
            return res.status(400).json({
                success: false,
                message: "driver_lat and driver_lng are required and must be valid coordinates."
            });
        }

        const thresholdMeters = getDeviationThresholdMeters({
            thresholdMeters: threshold_meters,
            roadType: road_type,
            speedKmph: speed_kmph
        });

        let finalPolyline = route_polyline || null;
        let routeSource = route_polyline ? "request_polyline" : "selected_route_store";

        if (!finalPolyline && booking_id) {
            const selectedRoute = selectedRouteStore.get(getBookingKey(booking_id));
            finalPolyline = selectedRoute?.route?.encoded_polyline || null;
        }

        if (!finalPolyline) {
            routeSource = "generated_from_google_maps";

            const pickupLat = toNumberOrNull(pickup_lat);
            const pickupLng = toNumberOrNull(pickup_lng);
            const dropLat = toNumberOrNull(drop_lat);
            const dropLng = toNumberOrNull(drop_lng);

            if (!isValidCoordinatePair(pickupLat, pickupLng) || !isValidCoordinatePair(dropLat, dropLng)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "route_polyline is missing. Send route_polyline, select a route first, or send pickup/drop coordinates."
                });
            }

            const optimizedRoute = await getOptimizedRoutesData({
                pickupLat,
                pickupLng,
                dropLat,
                dropLng
            });

            const recommendedRoute = optimizedRoute.routes.find(
                (route) => route.route_id === optimizedRoute.recommendedRouteId
            ) || optimizedRoute.routes[0];

            finalPolyline = recommendedRoute?.encoded_polyline || null;
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
            bookingId: booking_id,
            driverId: driver_id,
            driverLat,
            driverLng,
            routePoints,
            thresholdMeters,
            roadType: road_type,
            gpsAccuracyMeters: gps_accuracy_meters
        });

        let driverNotification = null;

        if (deviationResult.confirmedDeviation) {
            driverNotification =
                "You appear to be away from the selected route. Please confirm if this route change is intentional.";

            if (driver_email) {
                await sendSoftDriverDeviationEmail({
                    driverEmail: driver_email,
                    bookingId: booking_id,
                    distanceFromRouteMeters: deviationResult.distanceFromRouteMeters,
                    thresholdMeters,
                    riskLevel: deviationResult.riskLevel
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: deviationResult.confirmedDeviation
                ? "Route deviation confirmed after consecutive off-route readings."
                : deviationResult.deviated
                    ? "Driver is near/outside route boundary. Monitoring next GPS readings."
                    : "Driver is within the expected route boundary.",
            booking_id: booking_id || null,
            driver_id: driver_id || null,

            deviated: deviationResult.deviated,
            confirmed_deviation: deviationResult.confirmedDeviation,
            deviation_status: deviationResult.deviationStatus,

            risk_level: deviationResult.riskLevel,
            distance_from_route_meters: deviationResult.distanceFromRouteMeters,
            threshold_meters: thresholdMeters,

            off_route_count: deviationResult.offRouteCount,
            required_off_route_count: REQUIRED_OFF_ROUTE_COUNT,

            nearest_route_point: deviationResult.nearestRoutePoint,
            route_source: routeSource,
            road_type: road_type || "auto",
            driver_location: {
                latitude: driverLat,
                longitude: driverLng
            },
            confidence: deviationResult.confidence,
            reasons: deviationResult.reasons,
            recommendation: deviationResult.recommendation,
            driver_notification: driverNotification
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
   5. ETA / FARE RECALCULATION FOR SELECTED ROUTE
===================================================== */
exports.recalculateRouteCost = async (req, res) => {
    try {
        const {
            booking_id,
            selected_route_id,
            ride_type,
            price_per_km,
            hourly_rate,
            hours,
            original_fare
        } = req.body;

        if (!booking_id) {
            return res.status(400).json({
                success: false,
                message: "booking_id is required."
            });
        }

        const bookingKey = getBookingKey(booking_id);
        const storedRoutes = optimizedRoutesStore.get(bookingKey);

        if (!storedRoutes || !storedRoutes.routes || !storedRoutes.routes.length) {
            return res.status(404).json({
                success: false,
                message: "No optimized routes found for this booking."
            });
        }

        let route = null;

        if (selected_route_id) {
            route = storedRoutes.routes.find((item) => item.route_id === selected_route_id);
        }

        if (!route) {
            route = selectedRouteStore.get(bookingKey)?.route || storedRoutes.routes[0];
        }

        const oldRoute = storedRoutes.routes.find((item) => item.is_recommended) || storedRoutes.routes[0];

        const oldFare = calculateEstimatedFare({
            rideType: ride_type,
            distanceKm: oldRoute.distance_km,
            pricePerKm: price_per_km,
            hourlyRate: hourly_rate,
            hours,
            originalFare: original_fare
        });

        const newFare = calculateEstimatedFare({
            rideType: ride_type,
            distanceKm: route.distance_km,
            pricePerKm: price_per_km,
            hourlyRate: hourly_rate,
            hours,
            originalFare: original_fare
        });

        return res.status(200).json({
            success: true,
            message: "ETA and fare recalculated for selected route.",
            booking_id,
            selected_route_id: route.route_id,
            old_distance_km: oldRoute.distance_km,
            new_distance_km: route.distance_km,
            old_eta_minutes: oldRoute.duration_in_traffic_minutes,
            new_eta_minutes: route.duration_in_traffic_minutes,
            old_fare: oldFare,
            new_fare: newFare,
            fare_changed: Number(oldFare) !== Number(newFare),
            ride_type: ride_type || "unknown"
        });

    } catch (error) {
        console.error("AI Route Recalculation Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while recalculating route cost.",
            error: error.message
        });
    }
};

/* =====================================================
   GOOGLE MAPS MULTIPLE ROUTE OPTIMIZER
===================================================== */
async function getOptimizedRoutesData({
    pickupLat,
    pickupLng,
    dropLat,
    dropLng,
    rideType,
    pricePerKm,
    hourlyRate,
    hours,
    originalFare,
    gpsAccuracyMeters
}) {
    const straightDistanceKm = calculateDistanceKm(
        pickupLat,
        pickupLng,
        dropLat,
        dropLng
    );

    if (!GOOGLE_MAPS_API_KEY) {
        return getFallbackRoutes({
            straightDistanceKm,
            rideType,
            pricePerKm,
            hourlyRate,
            hours,
            originalFare
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

            return getFallbackRoutes({
                straightDistanceKm,
                rideType,
                pricePerKm,
                hourlyRate,
                hours,
                originalFare
            });
        }

        const rawRoutes = response.data.routes || [];

        const routeAgeMinutes = 0;
        const hasTrafficData = true;

        const normalizedRoutes = rawRoutes
            .map((route, index) => normalizeGoogleRoute({
                route,
                index,
                rawRouteCount: rawRoutes.length,
                hasTrafficData,
                routeAgeMinutes,
                gpsAccuracyMeters,
                rideType,
                pricePerKm,
                hourlyRate,
                hours,
                originalFare
            }))
            .filter(Boolean)
            .sort((a, b) => a.score - b.score)
            .slice(0, 3)
            .map((route, sortedIndex) => ({
                ...route,
                rank: sortedIndex + 1,
                is_recommended: sortedIndex === 0
            }));

        if (!normalizedRoutes.length) {
            return getFallbackRoutes({
                straightDistanceKm,
                rideType,
                pricePerKm,
                hourlyRate,
                hours,
                originalFare
            });
        }

        const best = normalizedRoutes[0];
        const slowest = normalizedRoutes[normalizedRoutes.length - 1];

        const trafficSavedMinutes =
            normalizedRoutes.length > 1
                ? Math.max(
                    0,
                    Math.ceil(
                        (slowest.duration_in_traffic_seconds - best.duration_in_traffic_seconds) / 60
                    )
                )
                : 0;

        return {
            recommendedRouteId: best.route_id,
            routes: normalizedRoutes,
            trafficSavedMinutes,
            source: "google_maps_directions",
            reasons: [
                "Google Maps Directions API returned available driving routes.",
                "Routes were scored using traffic-aware duration, distance, traffic delay, and route complexity.",
                "The route with the lowest AI route score was selected as recommended."
            ],
            recommendation:
                "Use the recommended route unless the driver has a valid operational reason to choose an alternate route."
        };

    } catch (error) {
        console.log("Google Directions API failed. Fallback route used:", error.message);

        return getFallbackRoutes({
            straightDistanceKm,
            rideType,
            pricePerKm,
            hourlyRate,
            hours,
            originalFare
        });
    }
}

function normalizeGoogleRoute({
    route,
    index,
    rawRouteCount,
    hasTrafficData,
    routeAgeMinutes,
    gpsAccuracyMeters,
    rideType,
    pricePerKm,
    hourlyRate,
    hours,
    originalFare
}) {
    const leg = route.legs?.[0] || {};

    const distanceMeters = Number(leg.distance?.value || 0);
    const durationSeconds = Number(leg.duration?.value || 0);
    const durationInTrafficSeconds = Number(
        leg.duration_in_traffic?.value ||
        leg.duration?.value ||
        0
    );

    if (!distanceMeters || !durationSeconds || !durationInTrafficSeconds) {
        return null;
    }

    const distanceKm = Number((distanceMeters / 1000).toFixed(2));
    const durationMinutes = Math.ceil(durationSeconds / 60);
    const durationInTrafficMinutes = Math.ceil(durationInTrafficSeconds / 60);
    const trafficDelayMinutes = Math.max(0, durationInTrafficMinutes - durationMinutes);
    const stepsCount = leg.steps?.length || 0;
    const routeComplexityScore = Math.min(10, Math.ceil(stepsCount / 4));

    const score = calculateRouteScore({
        durationInTrafficMinutes,
        distanceKm,
        trafficDelayMinutes,
        routeComplexityScore
    });

    const confidence = calculateRouteConfidence({
        hasTrafficData,
        gpsAccuracyMeters: Number(gpsAccuracyMeters || 25),
        alternativeRouteCount: rawRouteCount,
        routeAgeMinutes,
        hasValidPolyline: Boolean(route.overview_polyline?.points)
    });

    const estimatedFare = calculateEstimatedFare({
        rideType,
        distanceKm,
        pricePerKm,
        hourlyRate,
        hours,
        originalFare
    });

    const reasons = [
        `Traffic-aware ETA is ${durationInTrafficMinutes} minute(s).`,
        `Total route distance is ${distanceKm} km.`,
        `Traffic delay is estimated at ${trafficDelayMinutes} minute(s).`,
        `Route complexity score is ${routeComplexityScore}/10 based on driving steps.`
    ];

    return {
        route_id: `route_${index + 1}`,
        original_index: index,
        summary: route.summary || `Route ${index + 1}`,
        distance_meters: distanceMeters,
        distance_km: distanceKm,
        duration_seconds: durationSeconds,
        duration_minutes: durationMinutes,
        duration_in_traffic_seconds: durationInTrafficSeconds,
        duration_in_traffic_minutes: durationInTrafficMinutes,
        traffic_delay_minutes: trafficDelayMinutes,
        route_complexity_score: routeComplexityScore,
        encoded_polyline: route.overview_polyline?.points || null,
        bounds: route.bounds || null,
        score: Number(score.toFixed(2)),
        confidence,
        estimated_fare: estimatedFare,
        is_recommended: false,
        rank: index + 1,
        reasons,
        recommendation:
            "This route can be selected for navigation. The recommended badge is based on route score."
    };
}

function calculateRouteScore({
    durationInTrafficMinutes,
    distanceKm,
    trafficDelayMinutes,
    routeComplexityScore
}) {
    return (
        durationInTrafficMinutes * 0.60 +
        distanceKm * 1.50 +
        trafficDelayMinutes * 0.80 +
        routeComplexityScore * 0.30
    );
}

function calculateRouteConfidence({
    hasTrafficData,
    gpsAccuracyMeters,
    alternativeRouteCount,
    routeAgeMinutes,
    hasValidPolyline
}) {
    let score = 0;

    score += hasTrafficData ? 30 : 15;

    if (gpsAccuracyMeters <= 20) score += 20;
    else if (gpsAccuracyMeters <= 50) score += 15;
    else if (gpsAccuracyMeters <= 100) score += 8;
    else score += 3;

    if (alternativeRouteCount >= 3) score += 15;
    else if (alternativeRouteCount === 2) score += 10;
    else score += 5;

    if (routeAgeMinutes <= 2) score += 20;
    else if (routeAgeMinutes <= 10) score += 14;
    else if (routeAgeMinutes <= 30) score += 8;
    else score += 3;

    score += hasValidPolyline ? 15 : 0;

    return Math.max(40, Math.min(score, 98));
}

/* =====================================================
   FALLBACK ROUTE IF GOOGLE MAPS FAILS
===================================================== */
function getFallbackRoutes({
    straightDistanceKm,
    rideType,
    pricePerKm,
    hourlyRate,
    hours,
    originalFare
}) {
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
    const distanceKm = Number(estimatedRoadDistanceKm.toFixed(2));

    const fallbackRoute = {
        route_id: "route_1",
        rank: 1,
        original_index: 0,
        summary: "AI fallback route estimation",
        distance_meters: Math.round(distanceKm * 1000),
        distance_km: distanceKm,
        duration_seconds: durationMinutes * 60,
        duration_minutes: durationMinutes,
        duration_in_traffic_seconds: durationMinutes * 60,
        duration_in_traffic_minutes: durationMinutes,
        traffic_delay_minutes: trafficBufferMinutes,
        route_complexity_score: 5,
        encoded_polyline: null,
        score: Number(
            calculateRouteScore({
                durationInTrafficMinutes: durationMinutes,
                distanceKm,
                trafficDelayMinutes: trafficBufferMinutes,
                routeComplexityScore: 5
            }).toFixed(2)
        ),
        confidence: 55,
        estimated_fare: calculateEstimatedFare({
            rideType,
            distanceKm,
            pricePerKm,
            hourlyRate,
            hours,
            originalFare
        }),
        is_recommended: true,
        reasons: [
            "Google Maps Directions API was unavailable or returned no valid route.",
            "Straight-line distance was adjusted to estimate road distance.",
            "Traffic buffer was added using AI-assisted route scoring rules."
        ],
        recommendation:
            "Use this estimated route only as a fallback. Google Maps route should be preferred when available."
    };

    return {
        recommendedRouteId: fallbackRoute.route_id,
        routes: [fallbackRoute],
        trafficSavedMinutes: 0,
        source: "fallback_ai_estimation",
        reasons: fallbackRoute.reasons,
        recommendation: fallbackRoute.recommendation
    };
}

function calculateEstimatedFare({
    rideType,
    distanceKm,
    pricePerKm,
    hourlyRate,
    hours,
    originalFare
}) {
    const normalizedRideType = String(rideType || "").toLowerCase();

    if (normalizedRideType === "per_km" || normalizedRideType === "perkm" || normalizedRideType === "distance") {
        const rate = Number(pricePerKm || 0);

        if (rate > 0) {
            return Math.round(Number(distanceKm || 0) * rate);
        }
    }

    if (normalizedRideType === "hourly") {
        const rate = Number(hourlyRate || 0);
        const totalHours = Number(hours || 0);

        if (rate > 0 && totalHours > 0) {
            return Math.round(rate * totalHours);
        }
    }

    if (originalFare !== undefined && originalFare !== null && originalFare !== "") {
        return Math.round(Number(originalFare));
    }

    return null;
}

/* =====================================================
   ROUTE DEVIATION CALCULATION
===================================================== */
function calculateRouteDeviation({
    bookingId,
    driverId,
    driverLat,
    driverLng,
    routePoints,
    thresholdMeters,
    roadType,
    gpsAccuracyMeters
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

    const stateKey = getDeviationStateKey(bookingId, driverId);
    const previousState = deviationStateStore.get(stateKey) || {
        offRouteCount: 0,
        lastRiskLevel: "low"
    };

    const offRouteCount = deviated ? previousState.offRouteCount + 1 : 0;
    const confirmedDeviation = offRouteCount >= REQUIRED_OFF_ROUTE_COUNT;

    const riskLevel = calculateRiskLevel({
        distanceMeters: distanceRounded,
        thresholdMeters,
        offRouteCount
    });

    deviationStateStore.set(stateKey, {
        offRouteCount,
        lastDistanceFromRouteMeters: distanceRounded,
        lastRiskLevel: riskLevel,
        lastCheckedAt: new Date().toISOString()
    });

    const confidence = calculateDeviationConfidence({
        gpsAccuracyMeters: Number(gpsAccuracyMeters || 25),
        routePointCount: routePoints.length,
        confirmedDeviation,
        distanceMeters: distanceRounded,
        thresholdMeters
    });

    const reasons = [
        "Driver GPS location was compared with the selected route polyline.",
        `Dynamic route deviation threshold is ${thresholdMeters} meters.`,
        `Current off-route count is ${offRouteCount}/${REQUIRED_OFF_ROUTE_COUNT}.`
    ];

    if (roadType) {
        reasons.push(`Road type used for threshold calculation: ${roadType}.`);
    }

    if (deviated && !confirmedDeviation) {
        reasons.push("Driver is outside the allowed boundary, but deviation is not confirmed yet because more readings are needed.");
    } else if (confirmedDeviation) {
        reasons.push("Deviation was confirmed after consecutive off-route GPS readings.");
    } else {
        reasons.push("Driver is still inside the expected route boundary.");
    }

    return {
        deviated,
        confirmedDeviation,
        deviationStatus: confirmedDeviation ? "confirmed" : deviated ? "watching" : "on_route",
        riskLevel,
        distanceFromRouteMeters: distanceRounded,
        nearestRoutePoint,
        offRouteCount,
        confidence,
        reasons,
        recommendation: confirmedDeviation
            ? "Send soft notification to driver and notify passenger/admin if the deviation continues."
            : deviated
                ? "Continue monitoring. Do not trigger final alert until consecutive readings confirm deviation."
                : "No alert required. Continue normal ride tracking."
    };
}

function getDeviationThresholdMeters({ thresholdMeters, roadType, speedKmph }) {
    if (Number(thresholdMeters) > 0) {
        return Number(thresholdMeters);
    }

    const normalizedRoadType = String(roadType || "").toLowerCase();
    const speed = Number(speedKmph || 0);

    if (normalizedRoadType === "highway") return 900;
    if (normalizedRoadType === "main_road") return 650;
    if (normalizedRoadType === "city") return 500;
    if (normalizedRoadType === "dense_city") return 350;

    if (speed >= 70) return 900;
    if (speed >= 45) return 650;

    return DEFAULT_DEVIATION_THRESHOLD_METERS;
}

function calculateRiskLevel({
    distanceMeters,
    thresholdMeters,
    offRouteCount
}) {
    if (distanceMeters <= thresholdMeters) {
        return "low";
    }

    if (distanceMeters > thresholdMeters && distanceMeters <= thresholdMeters * 1.5) {
        return offRouteCount >= REQUIRED_OFF_ROUTE_COUNT ? "medium" : "low";
    }

    if (distanceMeters > thresholdMeters * 1.5 && distanceMeters <= thresholdMeters * 2.5) {
        return "medium";
    }

    return "high";
}

function calculateDeviationConfidence({
    gpsAccuracyMeters,
    routePointCount,
    confirmedDeviation,
    distanceMeters,
    thresholdMeters
}) {
    let score = 50;

    if (gpsAccuracyMeters <= 20) score += 20;
    else if (gpsAccuracyMeters <= 50) score += 14;
    else if (gpsAccuracyMeters <= 100) score += 8;
    else score += 3;

    if (routePointCount >= 100) score += 15;
    else if (routePointCount >= 40) score += 10;
    else score += 5;

    if (confirmedDeviation) score += 10;

    if (distanceMeters > thresholdMeters * 2) {
        score += 5;
    }

    return Math.max(45, Math.min(score, 96));
}

async function sendSoftDriverDeviationEmail({
    driverEmail,
    bookingId,
    distanceFromRouteMeters,
    thresholdMeters,
    riskLevel
}) {
    try {
        const result = await sendEmail({
            to: driverEmail,
            subject: "RSL — Route Change Confirmation Required",
            html: `
                <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:20px;">
                    <h2 style="color:#0693E3;">Real Smart Limousine</h2>
                    <p>Hello Driver,</p>
                    <p>The tracking system noticed that your vehicle may be away from the selected route.</p>

                    <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:12px;margin:18px 0;">
                        <p><strong>Booking ID:</strong> #${bookingId || "N/A"}</p>
                        <p><strong>Distance From Route:</strong> ${distanceFromRouteMeters} meters</p>
                        <p><strong>Allowed Threshold:</strong> ${thresholdMeters} meters</p>
                        <p><strong>Risk Level:</strong> ${riskLevel}</p>
                    </div>

                    <p>If this route change is intentional due to traffic, road closure, or customer request, please confirm with the passenger/admin.</p>

                    <hr/>
                    <p style="color:#64748b;font-size:12px;">RSL — Smart Route Intelligence</p>
                </div>
            `
        });

        if (!result.success) {
            console.log("Driver soft deviation email failed:", result.message);
        }
    } catch (error) {
        console.log("Driver soft deviation email error:", error.message);
    }
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

function getBookingKey(bookingId) {
    if (!bookingId && bookingId !== 0) return null;
    return String(bookingId);
}

function getDeviationStateKey(bookingId, driverId) {
    return `${bookingId || "unknown_booking"}_${driverId || "unknown_driver"}`;
}