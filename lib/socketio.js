const users = new Map();
const driverLocations = new Map();

const socketio = async (io) => {
    io.on("connection", (socket) => {
        const userId = socket.handshake.query.uuid;
        const userType = socket.handshake.query.type; // 'driver' or 'customer'
        console.log('uuid: ', userId, 'type:', userType);
        users.set(userId, socket.id);

        // Delete user if disconnected
        socket.on("disconnect", () => {
            users.delete(userId);
            driverLocations.delete(userId);
            console.log('A user disconnected');
        });

        // ✅ Driver sends location
        socket.on("driver-location", async (data) => {
            try {
                const { booking_id, latitude, longitude, customer_id } = data;
                console.log('Driver location received:', latitude, longitude);

                // Save to database
                const DriverLocation = require('../models/driver_location');
                await DriverLocation.create({
                    driver_id: Number(userId),
                    booking_id: Number(booking_id),
                    latitude,
                    longitude,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                // Store in memory
                driverLocations.set(userId, { latitude, longitude, booking_id });

                // Send to customer
                const customerSocket = users.get(String(customer_id));
                if (customerSocket) {
                    io.to(customerSocket).emit('driver-location-update', {
                        driver_id: userId,
                        latitude,
                        longitude,
                        booking_id
                    });
                    console.log('✅ Location sent to customer:', customer_id);
                }
            } catch (error) {
                console.log('❌ Location error:', error.message);
            }
        });

        // ✅ Customer joins booking room
        socket.on("join-booking", (data) => {
            const { booking_id } = data;
            socket.join(`booking_${booking_id}`);
            console.log(`Customer ${userId} joined booking room: ${booking_id}`);
        });

        // ✅ Driver joins booking room
        socket.on("driver-join-booking", (data) => {
            const { booking_id } = data;
            socket.join(`booking_${booking_id}`);
            console.log(`Driver ${userId} joined booking room: ${booking_id}`);
        });

        // User Chat Messages event
        socket.on("user-chat-message", (data) => {
            console.log('data ON: ', data);
            const { to, message } = data;
            const receiver = users.get(to);
            socket.to(receiver).emit('user-chat-message', { from: userId, message });
        });

        // User is typing event
        socket.on("is-typing", function (data) {
            const { to } = data;
            const receiver = users.get(to);
            socket.to(receiver).emit("is-typing", { from: userId, message: 'Typing...' });
        });
    });
}

module.exports = {
    socketio,
    users,
    driverLocations
};