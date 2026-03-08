const prisma = require('../config/prisma');
const campusService = require('../services/campus.service');

// GET /api/campus/colleges - list colleges for student onboarding
async function getColleges(req, res) {
  try {
    const colleges = await prisma.college.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return res.json({ colleges });
  } catch (error) {
    console.error('Error fetching colleges', error);
    return res.status(500).json({ message: 'Failed to fetch colleges' });
  }
}

// GET /api/campus/buildings/:college_id
async function getCampusBuildings(req, res) {
  const { college_id } = req.params;

  try {
    if (!college_id) {
      return res.status(400).json({ message: 'college_id is required' });
    }

    const buildings = await campusService.getCampusBuildings(college_id);

    return res.json({ buildings });
  } catch (error) {
    console.error('Error fetching campus buildings', error);
    return res.status(500).json({ message: 'Failed to fetch campus buildings' });
  }
}

module.exports = {
  getColleges,
  getCampusBuildings,
};

