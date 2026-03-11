const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Map: userId -> socketId
const onlineUsers = new Map();

const setupSocket = (io) => {
  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error('User not found'));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${socket.user.username} (${userId})`);

    // Register user as online
    onlineUsers.set(userId, socket.id);

    // Broadcast online users list to everyone
    io.emit('online-users', Array.from(onlineUsers.keys()));

    // ─── WebRTC Signaling ───────────────────────────────────────────

    // Caller sends call request to callee
    socket.on('call-user', ({ targetUserId, offer }) => {
      const targetSocketId = onlineUsers.get(targetUserId);
      if (!targetSocketId) {
        socket.emit('call-error', { message: 'User is not online' });
        return;
      }

      io.to(targetSocketId).emit('incoming-call', {
        callerId: userId,
        callerName: socket.user.username,
        callerAvatar: socket.user.avatar,
        offer
      });
    });

    // Callee accepts the call
    socket.on('accept-call', ({ callerId, answer }) => {
      const callerSocketId = onlineUsers.get(callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-accepted', { answer });
      }
    });

    // Callee rejects the call
    socket.on('reject-call', ({ callerId }) => {
      const callerSocketId = onlineUsers.get(callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-rejected', {
          message: `${socket.user.username} rejected the call`
        });
      }
    });

    // Either party ends the call
    socket.on('end-call', ({ targetUserId }) => {
      const targetSocketId = onlineUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call-ended');
      }
    });

    // ICE candidate exchange
    socket.on('ice-candidate', ({ targetUserId, candidate }) => {
      const targetSocketId = onlineUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('ice-candidate', { candidate });
      }
    });

    // ─── Disconnect ─────────────────────────────────────────────────

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
      onlineUsers.delete(userId);
      io.emit('online-users', Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = setupSocket;
