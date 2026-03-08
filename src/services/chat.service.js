const prisma = require('../config/prisma');
const analyticsService = require('./analytics.service');

function randomFloat0to1() {
  return Math.random();
}

function randomRiskLevel() {
  const r = Math.random();
  if (r < 0.6) return 'low';
  if (r < 0.9) return 'moderate';
  return 'high';
}

function randomTopics() {
  const pool = [
    'academics',
    'exams',
    'hostel',
    'relationships',
    'mental health',
    'career',
    'peer pressure',
  ];
  const count = 1 + Math.floor(Math.random() * 3);
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Creates a chat message, a mock EmotionSignal and updates aggregated stats.
async function createChatMessageWithMockEmotion({ user_id, college_id, building_id, chat_type, text }) {
  const message = await prisma.message.create({
    data: {
      user_id,
      college_id,
      building_id,
      chat_type,
      text,
    },
  });

  // Increment user's message count (best-effort)
  await prisma.user
    .update({
      where: { id: user_id },
      data: { message_count: { increment: 1 } },
    })
    .catch(() => {});

  let emotionSignal = null;

  if (college_id && building_id) {
    const stress = randomFloat0to1();
    const sadness = randomFloat0to1();
    const hope = randomFloat0to1();
    const risk_level = randomRiskLevel();
    const topics = randomTopics();

    emotionSignal = await prisma.emotionSignal.create({
      data: {
        user_id,
        college_id,
        building_id,
        stress,
        sadness,
        hope,
        topics,
        risk_level,
      },
    });

    // Update aggregated stats based on all emotion signals for this building
    await analyticsService.recomputeBuildingStats(building_id);
  }

  // Placeholder AI response
  const aiReply = {
    reply:
      'This is a placeholder response from Safe Sphere companion. AI-powered replies will be integrated later.',
  };

  return {
    message,
    emotionSignal,
    ai: aiReply,
  };
}

async function getUserMessages(user_id) {
  const messages = await prisma.message.findMany({
    where: { user_id },
    orderBy: { timestamp: 'asc' },
  });

  return messages;
}

module.exports = {
  createChatMessageWithMockEmotion,
  getUserMessages,
};

