const prisma = require('../config/prisma');

async function recomputeBuildingStats(buildingId) {
  const signals = await prisma.emotionSignal.findMany({
    where: { building_id: buildingId },
  });

  if (signals.length === 0) {
    return null;
  }

  let sumStress = 0;
  let sumSadness = 0;
  let sumHope = 0;

  const topicCounts = {};
  const riskCounts = {
    low: 0,
    moderate: 0,
    high: 0,
  };

  signals.forEach((s) => {
    sumStress += s.stress;
    sumSadness += s.sadness;
    sumHope += s.hope;

    if (Array.isArray(s.topics)) {
      s.topics.forEach((t) => {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      });
    }

    if (s.risk_level && riskCounts[s.risk_level] !== undefined) {
      riskCounts[s.risk_level] += 1;
    }
  });

  const count = signals.length;

  const avg_stress = sumStress / count;
  const avg_sadness = sumSadness / count;
  const avg_hope = sumHope / count;

  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);

  const risk_distribution = {};
  const totalRisk = riskCounts.low + riskCounts.moderate + riskCounts.high || 1;
  Object.entries(riskCounts).forEach(([k, v]) => {
    risk_distribution[k] = Number((v / totalRisk).toFixed(2));
  });

  const stats = await prisma.aggregatedStats.upsert({
    where: { building_id: buildingId },
    create: {
      building_id: buildingId,
      avg_stress,
      avg_sadness,
      avg_hope,
      top_topics: sortedTopics,
      risk_distribution,
    },
    update: {
      avg_stress,
      avg_sadness,
      avg_hope,
      top_topics: sortedTopics,
      risk_distribution,
    },
  });

  return stats;
}

async function getBuildingAnalytics(buildingId) {
  const building = await prisma.building.findUnique({
    where: { id: buildingId },
    include: {
      stats: true,
      emotionSignals: {
        orderBy: { timestamp: 'desc' },
        take: 50,
      },
    },
  });

  if (!building) {
    return null;
  }

  return {
    id: building.id,
    name: building.name,
    type: building.type,
    college_id: building.college_id,
    coordinates: {
      x: building.x_position,
      y: building.y_position,
    },
    stats: building.stats || null,
    recent_emotion_signals: building.emotionSignals,
  };
}

module.exports = {
  recomputeBuildingStats,
  getBuildingAnalytics,
};

