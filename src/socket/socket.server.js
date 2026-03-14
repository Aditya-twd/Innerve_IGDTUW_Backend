const { Server } = require('socket.io');
const prisma = require('../config/prisma');
const config = require('../config/env');
const analyticsService = require('../services/analytics.service');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: config.corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const { department, hostel, userId, collegeId } = socket.handshake.query;

    if (department) {
      socket.join(`dept:${department}`);
    }

    if (hostel) {
      socket.join(`hostel:${hostel}`);
    }

    socket.on('group_message', async (payload) => {
      try {
        const { text, room, buildingId } = payload || {};

        if (!room || !text || !userId) {
          return;
        }

        const message = await prisma.message.create({
          data: {
            user_id: String(userId),
            college_id: collegeId ? String(collegeId) : null,
            building_id: buildingId ? String(buildingId) : null,
            chat_type: 'group',
            text,
          },
        });

        await prisma.user
          .update({
            where: { id: String(userId) },
            data: { message_count: { increment: 1 } },
          })
          .catch(() => {});

        if (collegeId && buildingId) {
          const stress = Math.random();
          const sadness = Math.random();
          const hope = Math.random();
          const risk_level = 'low';
          const topics = ['group-chat'];

          await prisma.emotionSignal.create({
            data: {
              user_id: String(userId),
              college_id: String(collegeId),
              building_id: String(buildingId),
              stress,
              sadness,
              hope,
              topics,
              risk_level,
            },
          });

          await analyticsService.recomputeBuildingStats(String(buildingId));
        }

        io.to(room).emit('group_message', {
          id: message.id,
          user_id: message.user_id,
          room,
          text: message.text,
          timestamp: message.timestamp,
        });
      } catch (error) {
        console.error('Error handling group_message', error);
      }
    });

    socket.on('disconnect', () => {
      // no-op for now
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
}

module.exports = {
  initSocket,
  getIO,
};

