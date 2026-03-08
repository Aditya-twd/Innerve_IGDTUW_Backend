const prisma = require('../config/prisma');

// Initialize mock analytics for a building when it is created.
async function initializeBuildingAnalytics(buildingId) {
  const baseValue = Math.random();

  const avg_stress = Math.min(1, Math.max(0, baseValue + (Math.random() - 0.5) * 0.3));
  const avg_sadness = Math.min(1, Math.max(0, baseValue + (Math.random() - 0.5) * 0.3));
  const avg_hope = Math.min(1, Math.max(0, 1 - baseValue + (Math.random() - 0.5) * 0.3));

  const top_topics = ['onboarding', 'environment', 'social life'];
  const risk_distribution = {
    low: Number((0.6 + (Math.random() - 0.5) * 0.2).toFixed(2)),
    moderate: Number((0.3 + (Math.random() - 0.5) * 0.2).toFixed(2)),
    high: Number((0.1 + (Math.random() - 0.5) * 0.1).toFixed(2)),
  };

  await prisma.aggregatedStats.upsert({
    where: { building_id: buildingId },
    create: {
      building_id: buildingId,
      avg_stress,
      avg_sadness,
      avg_hope,
      top_topics,
      risk_distribution,
    },
    update: {
      avg_stress,
      avg_sadness,
      avg_hope,
      top_topics,
      risk_distribution,
    },
  });
}

// Returns buildings for a college with stress indicator and avatar counts.
async function getCampusBuildings(collegeId) {
  const buildings = await prisma.building.findMany({
    where: { college_id: collegeId },
    include: {
      stats: true,
    },
  });

  // Approximate avatar counts as number of messages associated with the building
  const messageGroups = await prisma.message.groupBy({
    by: ['building_id'],
    _count: {
      user_id: true,
    },
    where: {
      college_id: collegeId,
    },
  });

  const avatarCountMap = new Map();
  messageGroups.forEach((g) => {
    avatarCountMap.set(g.building_id, g._count.user_id);
  });

  return buildings.map((b) => ({
    id: b.id,
    name: b.name,
    type: b.type,
    x_position: b.x_position,
    y_position: b.y_position,
    stress_level: b.stats ? b.stats.avg_stress : null,
    avatars: avatarCountMap.get(b.id) || 0,
  }));
}

module.exports = {
  initializeBuildingAnalytics,
  getCampusBuildings,
};

