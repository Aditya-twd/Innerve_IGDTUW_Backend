const analyticsService = require('../services/analytics.service');

// GET /api/admin/building/:id
async function getBuildingAnalytics(req, res) {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ message: 'building id is required' });
    }

    const analytics = await analyticsService.getBuildingAnalytics(id);

    if (!analytics) {
      return res.status(404).json({ message: 'Building not found' });
    }

    return res.json(analytics);
  } catch (error) {
    console.error('Error fetching building analytics', error);
    return res.status(500).json({ message: 'Failed to fetch building analytics' });
  }
}

module.exports = {
  getBuildingAnalytics,
};

