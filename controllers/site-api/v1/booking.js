const { Sequelize, Op, DataTypes } = require("sequelize");
const Bookings = require("../../../models/booking");

const isParam = (param) => {
  if (param && param != undefined && param != "") {
    return true;
  }
  return false;
};

// ✅ 1. NEW BOOKING ADD
const bookingAdd = async (req, res) => {
  try {
    const { car_id, name, contact_no, email, from_location, to_location,
      pickup_time, pickup_date, ride_type, price, distance, cost, hours, description } = req.body;

    if (isParam(car_id) && isParam(name) && isParam(contact_no) &&
      isParam(email) && isParam(from_location) && isParam(pickup_time) &&
      isParam(pickup_date) && isParam(ride_type) && isParam(price) && isParam(cost)) {

      let newBooking = await Bookings.create({
        car_id, name, contact_no, email, from_location, to_location,
        pickup_time, pickup_date, ride_type, price, distance, hours,
        amount: cost, description,
        booking_status: 'pending'
      });

      if (!newBooking) {
        return res.send({ success: false, message: "Booking failed. Try again." });
      }

      return res.send({
        success: true,
        message: "Booking confirmed! Driver will contact you shortly.",
        booking_id: newBooking.id
      });

    } else {
      throw new Error("Please fill all required fields.");
    }

  } catch (error) {
    return res.send({ success: false, message: "Error: " + error.message });
  }
};

// ✅ 2. BOOKING HISTORY — email se dhundo
const bookingHistory = async (req, res) => {
  try {
    const { email } = req.query;

    if (!isParam(email)) {
      return res.send({ success: false, message: "Email is required." });
    }

    const bookings = await Bookings.findAll({
      where: { email: email, isDeleted: 0 },
      order: [['createdAt', 'DESC']]
    });

    return res.send({
      success: true,
      message: "Booking history fetched.",
      data: bookings
    });

  } catch (error) {
    return res.send({ success: false, message: "Error: " + error.message });
  }
};

// ✅ 3. SINGLE BOOKING STATUS
const bookingStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Bookings.findOne({
      where: { id: id, isDeleted: 0 }
    });

    if (!booking) {
      return res.send({ success: false, message: "Booking not found." });
    }

    return res.send({
      success: true,
      message: "Booking found.",
      data: booking
    });

  } catch (error) {
    return res.send({ success: false, message: "Error: " + error.message });
  }
};

// ✅ 4. BOOKING CANCEL
const bookingCancel = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Bookings.findOne({
      where: { id: id, isDeleted: 0 }
    });

    if (!booking) {
      return res.send({ success: false, message: "Booking not found." });
    }

    // Sirf pending booking cancel ho sakti hai
    if (booking.booking_status !== 'pending') {
      return res.send({
        success: false,
        message: `Booking cannot be cancelled. Status is: ${booking.booking_status}`
      });
    }

    await booking.update({ booking_status: 'completed', status: 0 });

    return res.send({
      success: true,
      message: "Booking cancelled successfully."
    });

  } catch (error) {
    return res.send({ success: false, message: "Error: " + error.message });
  }
};

module.exports = { bookingAdd, bookingHistory, bookingStatus, bookingCancel };