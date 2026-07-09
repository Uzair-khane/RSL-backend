const Bookings = require("../../../models/booking");
const Cars = require("../../../models/car");
const Price = require("../../../models/price");
const AiRecommendationLog = require("../../../models/ai_recommendation_log");

/**
 * Current database meaning:
 * status = 1        active
 * isDeleted = 0     not deleted
 * car_status = 0    available
 */

function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
}

function safeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function hashString(value) {
    const text = normalizeText(value);
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
        hash = (hash << 5) - hash + text.charCodeAt(i);
        hash |= 0;
    }

    return Math.abs(hash);
}

function scoreCustomerBookings(bookings, rideType, fromLocation, toLocation) {
    const scores = {};

    bookings.forEach((booking) => {
        const carId = booking.car_id;

        if (!carId) return;

        if (!scores[carId]) {
            scores[carId] = {
                car_id: carId,
                score: 0,
                reasons: [],
            };
        }

        scores[carId].score += 20;
        scores[carId].reasons.push("Customer previously booked this vehicle");

        if (booking.ride_type === rideType) {
            scores[carId].score += 10;
            scores[carId].reasons.push("Matches customer's previous ride type");
        }

        if (
            fromLocation &&
            booking.from_location &&
            normalizeText(booking.from_location).includes(normalizeText(fromLocation))
        ) {
            scores[carId].score += 6;
            scores[carId].reasons.push("Similar pickup location found");
        }

        if (
            toLocation &&
            booking.to_location &&
            normalizeText(booking.to_location).includes(normalizeText(toLocation))
        ) {
            scores[carId].score += 6;
            scores[carId].reasons.push("Similar drop-off location found");
        }

        if (booking.booking_status === "completed") {
            scores[carId].score += 6;
            scores[carId].reasons.push("Previous ride was completed successfully");
        }
    });

    return Object.values(scores).sort((a, b) => b.score - a.score);
}

async function getCarPrice(carId) {
    return await Price.findOne({
        where: {
            car_id: carId,
            status: 1,
            isDeleted: 0,
        },
    });
}

async function getAvailableCarsWithPrices() {
    const cars = await Cars.findAll({
        where: {
            status: 1,
            isDeleted: 0,
            car_status: 0,
        },
        order: [["id", "ASC"]],
    });

    const result = [];

    for (const car of cars) {
        const price = await getCarPrice(car.id);

        if (!price) continue;

        result.push({
            car,
            price,
        });
    }

    return result;
}

async function saveRecommendationLog(data) {
    try {
        await AiRecommendationLog.create({
            email: data.email,
            ride_type: data.ride_type,
            from_location: data.from_location,
            to_location: data.to_location,
            recommendation_type: data.recommendation_type,
            recommended_car_id: data.recommended_car_id,
            recommended_car_title: data.recommended_car_title,
            confidence: data.confidence,
            reasons: JSON.stringify(data.reasons || []),
            previous_bookings_count: data.previous_bookings_count || 0,
        });
    } catch (error) {
        console.error("AI recommendation log save error:", error.message);
    }
}

/**
 * Request-based fallback scoring for new customers.
 * This avoids always returning the first/cheapest car.
 */
function scoreFallbackCars(
    carsWithPrices,
    rideType,
    email,
    fromLocation,
    toLocation
) {
    const priceField =
        rideType === "pr_km" || rideType === "per_km"
            ? "km_price"
            : "hourly_price";

    const emailHash = hashString(email);
    const locationHash = hashString(`${fromLocation}-${toLocation}`);

    const prices = carsWithPrices
        .map((item) => safeNumber(item.price[priceField]))
        .filter((value) => value > 0);

    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    return carsWithPrices
        .map((item, index) => {
            const car = item.car;
            const price = item.price;

            const currentPrice = safeNumber(price[priceField]);

            let score = 50;
            const reasons = [];

            score += 10;
            reasons.push("Vehicle is active and available");

            if (currentPrice > 0 && minPrice > 0 && maxPrice > minPrice) {
                const priceSuitability =
                    ((maxPrice - currentPrice) / (maxPrice - minPrice)) * 18;

                score += priceSuitability;

                reasons.push(
                    rideType === "hourly"
                        ? "Suitable hourly pricing"
                        : "Suitable per KM pricing"
                );
            } else if (currentPrice > 0) {
                score += 8;
                reasons.push("Suitable pricing available");
            }

            if (rideType === "hourly") {
                score += 7;
                reasons.push("Matched with hourly ride request");
            }

            if (rideType === "per_km" || rideType === "pr_km") {
                score += 7;
                reasons.push("Matched with distance-based ride request");
            }

            /**
             * Diversity score:
             * Different email/location combinations produce different recommendations.
             * This prevents same recommendation for every new customer.
             */
            const diversityScore =
                (emailHash + locationHash + car.id * 7 + index * 3) % 22;

            score += diversityScore;
            reasons.push("Selected using request-based vehicle matching");

            return {
                car,
                price,
                score: Math.round(score),
                reasons,
            };
        })
        .sort((a, b) => b.score - a.score);
}

const recommendRide = async (req, res) => {
    try {
        const { email, ride_type, from_location, to_location } = req.body;

        if (!email) {
            return res.send({
                success: false,
                message: "Customer email is required.",
            });
        }

        const selectedRideType = ride_type || "per_km";

        const previousBookings = await Bookings.findAll({
            where: {
                email,
                isDeleted: 0,
            },
            order: [["id", "DESC"]],
            limit: 20,
        });

        /**
         * Case 1: Existing customer history.
         */
        if (previousBookings.length > 0) {
            const scoredHistoryCars = scoreCustomerBookings(
                previousBookings,
                selectedRideType,
                from_location,
                to_location
            );

            for (const match of scoredHistoryCars) {
                const recommendedCar = await Cars.findOne({
                    where: {
                        id: match.car_id,
                        status: 1,
                        isDeleted: 0,
                        car_status: 0,
                    },
                });

                if (!recommendedCar) continue;

                const recommendedPrice = await getCarPrice(match.car_id);

                if (!recommendedPrice) continue;

                const responseData = {
                    recommendation_type: "history_based",
                    recommended_car: recommendedCar,
                    recommended_price: recommendedPrice,
                    recommended_ride_type: selectedRideType,
                    confidence: Math.min(95, 65 + match.score),
                    reasons: [...new Set(match.reasons)],
                    previous_bookings_count: previousBookings.length,
                };

                await saveRecommendationLog({
                    email,
                    ride_type: selectedRideType,
                    from_location,
                    to_location,
                    recommendation_type: responseData.recommendation_type,
                    recommended_car_id: recommendedCar.id,
                    recommended_car_title: recommendedCar.title,
                    confidence: responseData.confidence,
                    reasons: responseData.reasons,
                    previous_bookings_count: previousBookings.length,
                });

                return res.send({
                    success: true,
                    message: "AI-assisted ride recommendation generated successfully.",
                    data: responseData,
                });
            }
        }

        /**
         * Case 2: New customer / no available previous car.
         */
        const carsWithPrices = await getAvailableCarsWithPrices();

        if (!carsWithPrices.length) {
            return res.send({
                success: false,
                message: "No active vehicle with active pricing available.",
            });
        }

        const scoredFallbackCars = scoreFallbackCars(
            carsWithPrices,
            selectedRideType,
            email,
            from_location,
            to_location
        );

        const best = scoredFallbackCars[0];

        if (!best) {
            return res.send({
                success: false,
                message: "Unable to generate recommendation.",
            });
        }

        const responseData = {
            recommendation_type: "request_based",
            recommended_car: best.car,
            recommended_price: best.price,
            recommended_ride_type: selectedRideType,
            confidence: Math.min(90, best.score),
            reasons: [...new Set(best.reasons)],
            previous_bookings_count: previousBookings.length || 0,
        };

        await saveRecommendationLog({
            email,
            ride_type: selectedRideType,
            from_location,
            to_location,
            recommendation_type: responseData.recommendation_type,
            recommended_car_id: best.car.id,
            recommended_car_title: best.car.title,
            confidence: responseData.confidence,
            reasons: responseData.reasons,
            previous_bookings_count: previousBookings.length || 0,
        });

        return res.send({
            success: true,
            message:
                "AI-assisted request-based recommendation generated successfully.",
            data: responseData,
        });
    } catch (error) {
        return res.send({
            success: false,
            message: "Recommendation error: " + error.message,
        });
    }
};

module.exports = {
    recommendRide,
};