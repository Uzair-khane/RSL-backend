const { Sequelize, Op, DataTypes } = require("sequelize");
const Bookings = require("../../../models/booking");
const Drivers_Cars = require("../../../models/drivers_cars");
const Drivers = require("../../../models/driver");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const isParam = (param) => {
  return param !== undefined && param !== null && param !== "";
};

/* =====================================================
   DRIVER EMAIL
===================================================== */
async function sendDriverNotification(driverEmail, driverName, booking) {
  const msg = {
    to: driverEmail,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "RSL — New Booking Assigned",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
        <h2 style="color:#0693E3;">Real Smart Limousine</h2>
        <p>Hello <strong>${driverName}</strong>,</p>
        <p>A new booking has been assigned to you.</p>

        <div style="background:#f4f4f4;padding:18px;border-radius:10px;margin:20px 0;">
          <p><strong>Customer:</strong> ${booking.name}</p>
          <p><strong>Phone:</strong> ${booking.contact_no}</p>
          <p><strong>Pickup:</strong> ${booking.from_location}</p>
          <p><strong>Drop:</strong> ${booking.to_location || "Hourly Ride"}</p>
          <p><strong>Date:</strong> ${booking.pickup_date}</p>
          <p><strong>Time:</strong> ${booking.pickup_time}</p>
          <p><strong>Ride Type:</strong> ${booking.ride_type}</p>
          <p><strong>Amount:</strong> PKR ${booking.amount}</p>
        </div>

        <p>Please contact the customer as soon as possible.</p>
        <hr/>
        <p style="color:#999;font-size:12px;">RSL — Luxury Ride Booking</p>
      </div>
    `
  };

  await sgMail.send(msg);
}

/* =====================================================
   PASSENGER TRACKING EMAIL
===================================================== */
async function sendPassengerTrackingEmail(passengerEmail, passengerName, booking, trackingUrl) {
  const msg = {
    to: passengerEmail,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "RSL — Your Ride Tracking Link",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
        <h2 style="color:#0693E3;">Your RSL Ride is Confirmed</h2>

        <p>Hello <strong>${passengerName}</strong>,</p>
        <p>Your ride has been booked successfully. You can track your ride anytime using the link below.</p>

        <div style="background:#f4f8fb;padding:18px;border-radius:10px;margin:20px 0;">
          <p><strong>Booking ID:</strong> #${booking.id}</p>
          <p><strong>Pickup:</strong> ${booking.from_location}</p>
          <p><strong>Drop:</strong> ${booking.to_location || "Hourly Ride"}</p>
          <p><strong>Date:</strong> ${booking.pickup_date}</p>
          <p><strong>Time:</strong> ${booking.pickup_time}</p>
          <p><strong>Amount:</strong> PKR ${booking.amount}</p>
        </div>

        <div style="text-align:center;margin:25px 0;">
          <a href="${trackingUrl}" 
             style="background:#0693E3;color:white;padding:14px 24px;text-decoration:none;border-radius:10px;font-weight:bold;display:inline-block;">
            Track My Ride
          </a>
        </div>

        <p>You can share this link with your family so they can view the live ride location.</p>

        <p style="font-size:13px;color:#666;word-break:break-all;">
          ${trackingUrl}
        </p>

        <hr/>
        <p style="color:#999;font-size:12px;">RSL — Real Smart Limousine</p>
      </div>
    `
  };

  await sgMail.send(msg);
}

/* =====================================================
   1. NEW BOOKING ADD
===================================================== */
const bookingAdd = async (req, res) => {
  try {
    const {
      car_id,
      name,
      contact_no,
      email,
      from_location,
      to_location,
      pickup_time,
      pickup_date,
      ride_type,
      price,
      distance,
      cost,
      hours,
      description
    } = req.body;

    if (
      isParam(car_id) &&
      isParam(name) &&
      isParam(contact_no) &&
      isParam(email) &&
      isParam(from_location) &&
      isParam(pickup_time) &&
      isParam(pickup_date) &&
      isParam(ride_type) &&
      isParam(price) &&
      isParam(cost)
    ) {
      const newBooking = await Bookings.create({
        car_id,
        name,
        contact_no,
        email,
        from_location,
        to_location,
        pickup_time,
        pickup_date,
        ride_type,
        price,
        distance,
        hours,
        amount: cost,
        description,
        booking_status: "pending"
      });

      if (!newBooking) {
        return res.send({
          success: false,
          message: "Booking failed. Try again."
        });
      }

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const trackingUrl = `${frontendUrl}/tracking?booking_id=${newBooking.id}`;

      try {
        await sendPassengerTrackingEmail(email, name, newBooking, trackingUrl);
        console.log("✅ Passenger tracking email sent:", email);
      } catch (emailError) {
        console.log("⚠️ Passenger email error:", emailError.message);
      }

      try {
        const driverCar = await Drivers_Cars.findOne({
          where: {
            car_id: car_id,
            status: 1,
            isDeleted: 0
          },
          include: [
            {
              model: Drivers,
              as: "driver",
              attributes: [
                "id",
                "name",
                "contact",
                "email",
                "image",
                "license_no",
                "id_card_no",
                "passport_no",
                "address",
                "driver_status",
                "rating",
                "total_rides",
                "experience_years",
                "emergency_contact",
                "verified_status",
                "current_address"
              ]
            }
          ]
        });

        if (driverCar && driverCar.driver && driverCar.driver.email) {
          await sendDriverNotification(
            driverCar.driver.email,
            driverCar.driver.name,
            newBooking
          );

          console.log("✅ Driver email sent:", driverCar.driver.email);
        } else {
          console.log("⚠️ Driver not found or driver email missing");
        }
      } catch (emailError) {
        console.log("⚠️ Driver email error:", emailError.message);
      }

      return res.send({
        success: true,
        message: "Booking confirmed! Tracking link has been sent to passenger email.",
        booking_id: newBooking.id,
        tracking_url: trackingUrl
      });

    } else {
      throw new Error("Please fill all required fields.");
    }

  } catch (error) {
    return res.send({
      success: false,
      message: "Error: " + error.message
    });
  }
};

/* =====================================================
   2. BOOKING HISTORY
===================================================== */
const bookingHistory = async (req, res) => {
  try {
    const { email } = req.query;

    if (!isParam(email)) {
      return res.send({
        success: false,
        message: "Email is required."
      });
    }

    const bookings = await Bookings.findAll({
      where: {
        email: email,
        isDeleted: 0
      },
      order: [["createdAt", "DESC"]]
    });

    return res.send({
      success: true,
      message: "Booking history fetched.",
      data: bookings
    });

  } catch (error) {
    return res.send({
      success: false,
      message: "Error: " + error.message
    });
  }
};

/* =====================================================
   3. SINGLE BOOKING STATUS + FULL DRIVER DETAIL
===================================================== */
const bookingStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Bookings.findOne({
      where: {
        id: id,
        isDeleted: 0
      }
    });

    if (!booking) {
      return res.send({
        success: false,
        message: "Booking not found."
      });
    }

    const driverCar = await Drivers_Cars.findOne({
      where: {
        car_id: booking.car_id,
        status: 1,
        isDeleted: 0
      },
      include: [
        {
          model: Drivers,
          as: "driver",
          attributes: [
            "id",
            "name",
            "contact",
            "email",
            "image",
            "license_no",
            "id_card_no",
            "passport_no",
            "address",
            "driver_status",
            "rating",
            "total_rides",
            "experience_years",
            "emergency_contact",
            "verified_status",
            "current_address"
          ]
        }
      ]
    });

    const driver =
      driverCar && driverCar.driver
        ? {
            id: driverCar.driver.id,
            name: driverCar.driver.name,
            contact: driverCar.driver.contact,
            email: driverCar.driver.email,
            image: driverCar.driver.image,
            license_no: driverCar.driver.license_no,
            id_card_no: driverCar.driver.id_card_no,
            passport_no: driverCar.driver.passport_no,
            address: driverCar.driver.address,
            driver_status: driverCar.driver.driver_status,
            rating: driverCar.driver.rating,
            total_rides: driverCar.driver.total_rides,
            experience_years: driverCar.driver.experience_years,
            emergency_contact: driverCar.driver.emergency_contact,
            verified_status: driverCar.driver.verified_status,
            current_address: driverCar.driver.current_address
          }
        : null;

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const trackingUrl = `${frontendUrl}/tracking?booking_id=${booking.id}`;

    return res.send({
      success: true,
      message: "Booking found.",
      data: {
        ...booking.toJSON(),
        driver
      },
      tracking_url: trackingUrl
    });

  } catch (error) {
    return res.send({
      success: false,
      message: "Error: " + error.message
    });
  }
};

/* =====================================================
   4. BOOKING CANCEL
===================================================== */
const bookingCancel = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Bookings.findOne({
      where: {
        id: id,
        isDeleted: 0
      }
    });

    if (!booking) {
      return res.send({
        success: false,
        message: "Booking not found."
      });
    }

    if (booking.booking_status !== "pending") {
      return res.send({
        success: false,
        message: `Booking cannot be cancelled. Status is: ${booking.booking_status}`
      });
    }

    await booking.update({
      booking_status: "completed",
      status: 0
    });

    return res.send({
      success: true,
      message: "Booking cancelled successfully."
    });

  } catch (error) {
    return res.send({
      success: false,
      message: "Error: " + error.message
    });
  }
};

module.exports = {
  bookingAdd,
  bookingHistory,
  bookingStatus,
  bookingCancel
};