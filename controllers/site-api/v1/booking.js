const { Sequelize, Op, DataTypes } = require("sequelize");
const Bookings = require("../../../models/booking");
const Drivers_Cars = require("../../../models/drivers_cars");
const Drivers = require("../../../models/driver");
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const isParam = (param) => {
  if (param && param != undefined && param != "") {
    return true;
  }
  return false;
};

// Driver ko email bhejo
async function sendDriverNotification(driverEmail, driverName, booking) {
  const msg = {
    to: driverEmail,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'RSL — A new booking has arrived!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0693E3;">Real Smart Limousine</h2>
        <p>Hello <strong>${driverName}</strong>,</p>
        <p>A new booking has arrived for you.:</p>
        <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Customer:</strong> ${booking.name}</p>
          <p><strong>Phone:</strong> ${booking.contact_no}</p>
          <p><strong>Pickup:</strong> ${booking.from_location}</p>
          <p><strong>Drop:</strong> ${booking.to_location || 'Hourly Ride'}</p>
          <p><strong>Date:</strong> ${booking.pickup_date}</p>
          <p><strong>Time:</strong> ${booking.pickup_time}</p>
          <p><strong>Ride Type:</strong> ${booking.ride_type}</p>
          <p><strong>Amount:</strong> PKR ${booking.amount}</p>
        </div>
        <p>Please contact the customer as soon as possible.</p>
        <hr/>
        <p style="color: #999; font-size: 12px;">Real Smart Limousine — Luxury Ride Booking</p>
      </div>
    `
  };
  await sgMail.send(msg);
}

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

      // Driver ko email bhejo
      try {
        const driverCar = await Drivers_Cars.findOne({
          where: { car_id: car_id, status: 1, isDeleted: 0 },
          include: [{
            model: Drivers,
            as: 'driver',
            attributes: ['name', 'email']
          }]
        });

        if (driverCar && driverCar.driver && driverCar.driver.email) {
          await sendDriverNotification(
            driverCar.driver.email,
            driverCar.driver.name,
            newBooking
          );
          console.log('✅ I have sent the email to the driver:', driverCar.driver.email);
        } else {
          console.log('⚠️The driver was not found, or their email address is not available');
        }
      } catch (emailError) {
        console.log('⚠️ Email error:', emailError.message);
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

// ✅ 2. BOOKING HISTORY
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