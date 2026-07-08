const Bookings = require("../../../models/booking");
const Cars = require("../../../models/car");
const Price = require("../../../models/price");

/**
 * In current database:
 * status = 1        active
 * isDeleted = 0     not deleted
 * car_status = 0    available
 */

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

        scores[carId].score += 10;
        scores[carId].reasons.push("Customer previously booked this vehicle");

        if (booking.ride_type === rideType) {
            scores[carId].score += 8;
            scores[carId].reasons.push("Matches customer's preferred ride type");
        }

        if (
            fromLocation &&
            booking.from_location &&
            booking.from_location.toLowerCase().includes(fromLocation.toLowerCase())
        ) {
            scores[carId].score += 5;
            scores[carId].reasons.push("Similar pickup location found");
        }

        if (
            toLocation &&
            booking.to_location &&
            booking.to_location.toLowerCase().includes(toLocation.toLowerCase())
        ) {
            scores[carId].score += 5;
            scores[carId].reasons.push("Similar drop-off location found");
        }

        if (booking.booking_status === "completed") {
            scores[carId].score += 5;
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

async function getFallbackRecommendation(rideType) {
    const priceOrderField = rideType === "pr_km" ? "km_price" : "hourly_price";

    const activeCars = await Cars.findAll({
        where: {
            status: 1,
            isDeleted: 0,
            car_status: 0,
        },
        order: [["id", "ASC"]],
    });

    if (!activeCars || activeCars.length === 0) {
        return null;
    }

    let bestCar = null;
    let bestPrice = null;

    for (const car of activeCars) {
        const price = await getCarPrice(car.id);

        if (!price) continue;

        if (!bestPrice) {
            bestCar = car;
            bestPrice = price;
            continue;
        }

        const currentPrice = Number(price[priceOrderField] || 0);
        const selectedPrice = Number(bestPrice[priceOrderField] || 0);

        if (currentPrice > 0 && currentPrice < selectedPrice) {
            bestCar = car;
            bestPrice = price;
        }
    }

    if (!bestCar || !bestPrice) {
        return null;
    }

    return {
        car: bestCar,
        price: bestPrice,
        confidence: 60,
        reasons: [
            "Recommended based on active vehicle availability and suitable pricing",
        ],
    };
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

        const selectedRideType = ride_type || "hourly";

        const previousBookings = await Bookings.findAll({
            where: {
                email,
                isDeleted: 0,
            },
            order: [["id", "DESC"]],
            limit: 20,
        });

        if (previousBookings.length > 0) {
            const scoredCars = scoreCustomerBookings(
                previousBookings,
                selectedRideType,
                from_location,
                to_location
            );

            for (const match of scoredCars) {
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

                return res.send({
                    success: true,
                    message: "AI-assisted ride recommendation generated successfully.",
                    data: {
                        recommendation_type: "history_based",
                        recommended_car: recommendedCar,
                        recommended_price: recommendedPrice,
                        recommended_ride_type: selectedRideType,
                        confidence: Math.min(95, 60 + match.score),
                        reasons: [...new Set(match.reasons)],
                        previous_bookings_count: previousBookings.length,
                    },
                });
            }
        }

        const fallback = await getFallbackRecommendation(selectedRideType);

        if (!fallback) {
            return res.send({
                success: false,
                message:
                    "No active vehicle with active pricing available for recommendation.",
            });
        }

        return res.send({
            success: true,
            message: "AI-assisted fallback recommendation generated successfully.",
            data: {
                recommendation_type: "pricing_based",
                recommended_car: fallback.car,
                recommended_price: fallback.price,
                recommended_ride_type: selectedRideType,
                confidence: fallback.confidence,
                reasons: fallback.reasons,
                previous_bookings_count: previousBookings.length || 0,
            },
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