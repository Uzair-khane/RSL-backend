const users = new Map();
const socketio = async (io) => {
    io.on("connection", (socket) => {
        // Store the user's socket and assigned room
        const userId = socket.handshake.query.uuid;
        console.log('uuid: ', userId)
        users.set(userId, socket.id);
        // Delete user if disconnected
        socket.on("disconnect", () => {
            users.delete(userId);
            console.log('A user disconnected');
        });

        // User Chat Messages event
        socket.on("user-chat-message", (data) => {
            console.log('data ON: ', data)
            const { to, message } = data;
            const sender = users.get(userId);
            console.log("Sender: ", sender)
            // if (sender && users.has(to)) {
                const receiver = users.get(to);
                console.log("Receiver: ", receiver)
                // Emit the private message to the receiver
                socket.to(receiver).emit('user-chat-message', { from: userId, message });
            // }
        })
        // User is typing event
        socket.on("is-typing", function (data) {
            const { to } = data;
            console.log('istypingTo: ', to)
            const sender = users.get(userId);
            // if (sender && users.has(to)) {
                const receiver = users.get(to);
                console.log('isTypingReceiver: ', receiver)
                socket.to(receiver).emit("is-typing", { from: userId, message: 'Typing...' });
            // }
        });
    });
}

module.exports = {
    socketio,
    users
};