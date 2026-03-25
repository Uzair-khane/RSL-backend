const { Sequelize, Op, Model, DataTypes, QueryTypes } = require("sequelize"),
  fs = require("fs"),
  { randomString } = require("../../../middleware/random-string");
const Bookings = require("../../../models/booking");

const baseUrl = "/api/site/v1";
const routeUrl = "/api/site/v1/booking";

const isParam = (param) => {
  if (param && param != undefined && param != "") {
    return true;
  }
  return false;
};

// new booking controller
const bookingAdd = async (req, res) => {
  try {
    const { car_id, name, contact_no, email, from_location, to_location, pickup_time,
      pickup_date, ride_type, price, distance, cost,hours, description } = req.body;

    if (isParam(car_id) &&
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
      let newBooking = await Bookings.create({
        car_id: car_id,
        name: name,
        contact_no: contact_no,
        email: email,
        from_location: from_location,
        to_location: to_location,
        pickup_time: pickup_time,
        pickup_date: pickup_date,
        ride_type: ride_type,
        price: price,
        distance: distance,
        hours:hours,
        amount: cost,
        description: description,
      });
      if (!newBooking) {
        return res.status(401).send({
          success: false,
          message: "Booking is not done Something is worrng ❌",
        });
      }
      return res.status(200).send({
        success: true,
        message: "Thank you for your booking! Our driver will contact you shortly.",
      });

    } else {
      throw new Error("Please fill all the required fields")
    }

  } catch (error) {
    console.log(error);
    
    return res.send({
      success: false,
      message: "Oops! something went wrong. " + error,
    });
  }
};

module.exports = {
  bookingAdd,
};
