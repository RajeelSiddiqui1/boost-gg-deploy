const { Server } = require('socket.io');

let io;

module.exports = {
    init: (httpServer) => {
        io = new Server(httpServer, {
            cors: {
                origin: '*', // Adjust to process.env.CORS_ORIGIN in production
                methods: ['GET', 'POST', 'PUT', 'DELETE']
            }
        });

        io.on('connection', (socket) => {
            console.log('Socket Client connected:', socket.id);

            // Join a specific order room
            socket.on('joinOrder', (orderId) => {
                socket.join(orderId);
                console.log(`Socket ${socket.id} joined order room: ${orderId}`);
            });

            // Leave an order room
            socket.on('leaveOrder', (orderId) => {
                socket.leave(orderId);
                console.log(`Socket ${socket.id} left order room: ${orderId}`);
            });

            // --- Support Chat Socket Events ---
            socket.on('joinSupport', (conversationId) => {
                socket.join(conversationId);
                console.log(`Socket ${socket.id} joined support room: ${conversationId}`);
            });

            socket.on('leaveSupport', (conversationId) => {
                socket.leave(conversationId);
                console.log(`Socket ${socket.id} left support room: ${conversationId}`);
            });

            socket.on('joinAdmins', () => {
                socket.join('admins_support');
                console.log(`Socket ${socket.id} joined global admins support room`);
            });
            // -----------------------------------

            socket.on('disconnect', () => {
                console.log('Socket Client disconnected:', socket.id);
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};
