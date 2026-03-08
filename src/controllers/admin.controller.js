const prisma = require('../config/prisma');
const campusService = require('../services/campus.service');
const bcrypt = require('bcryptjs');

// POST /api/admin/register
// Admin onboarding: create an admin user with email/password and return ID + token.
async function registerAdmin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(409).json({ message: 'Admin with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        role: 'admin',
        email,
        password_hash,
      },
    });

    return res.status(201).json({
      admin_id: admin.id,
      email: admin.email,
      token: `admin-token-${admin.id}`,
    });
  } catch (error) {
    console.error('Error registering admin', error);
    return res.status(500).json({ message: 'Failed to register admin' });
  }
}

// POST /api/admin/login
// Login by email/password and return a simple token.
async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const admin = await prisma.user.findFirst({
      where: { email, role: 'admin' },
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const valid = admin.password_hash
      ? await bcrypt.compare(password, admin.password_hash)
      : false;

    if (!valid) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = `admin-token-${admin.id}`;

    return res.json({
      admin_id: admin.id,
      email: admin.email,
      token,
    });
  } catch (error) {
    console.error('Error logging in admin', error);
    return res.status(500).json({ message: 'Failed to login admin' });
  }
}

// POST /api/admin/college
async function createCollege(req, res) {
  try {
    const { name, admin_id, location, counsellor_name, counsellor_phone, counsellor_email } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    let resolvedAdminId = admin_id;

    // If admin_id not provided explicitly, try to derive it from the Bearer token.
    if (!resolvedAdminId) {
      const authHeader = req.headers.authorization || '';
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        if (token.startsWith('admin-token-')) {
          resolvedAdminId = token.replace('admin-token-', '');
        }
      }
    }

    if (!resolvedAdminId) {
      return res.status(400).json({ message: 'admin_id is required (in body or token)' });
    }

    const admin = await prisma.user.findFirst({
      where: { id: resolvedAdminId, role: 'admin' },
    });

    if (!admin) {
      return res.status(400).json({ message: 'Invalid admin_id' });
    }

    const college = await prisma.college.create({
      data: {
        name,
        location: location || null,
        admin_id: resolvedAdminId,
        counsellor_name: counsellor_name || null,
        counsellor_phone: counsellor_phone || null,
        counsellor_email: counsellor_email || null,
      },
    });

    return res.status(201).json(college);
  } catch (error) {
    console.error('Error creating college', error);
    return res.status(500).json({ message: 'Failed to create college' });
  }
}

// POST /api/admin/building
async function createBuilding(req, res) {
  try {
    const { college_id, name, type, x_position, y_position } = req.body;

    if (!college_id || !name || !type || x_position === undefined || y_position === undefined) {
      return res.status(400).json({
        message: 'college_id, name, type, x_position and y_position are required',
      });
    }

    const college = await prisma.college.findUnique({
      where: { id: college_id },
    });

    if (!college) {
      return res.status(400).json({ message: 'Invalid college_id' });
    }

    const building = await prisma.building.create({
      data: {
        college_id,
        name,
        type,
        x_position: Number(x_position),
        y_position: Number(y_position),
      },
    });

    // Initialize mock analytics for this building
    await campusService.initializeBuildingAnalytics(building.id);

    return res.status(201).json(building);
  } catch (error) {
    console.error('Error creating building', error);
    return res.status(500).json({ message: 'Failed to create building' });
  }
}

// GET /api/admin/me - current admin + college from Bearer token
function getAdminIdFromToken(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  if (!token.startsWith('admin-token-')) return null;
  return token.replace('admin-token-', '');
}

async function getAdminMe(req, res) {
  try {
    const adminId = getAdminIdFromToken(req);
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const admin = await prisma.user.findFirst({
      where: { id: adminId, role: 'admin' },
      select: { id: true, email: true },
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin' });
    }

    const college = await prisma.college.findFirst({
      where: { admin_id: adminId },
    });

    return res.json({
      admin_id: admin.id,
      email: admin.email,
      college_id: college?.id ?? null,
      college: college ?? null,
    });
  } catch (error) {
    console.error('Error in getAdminMe', error);
    return res.status(500).json({ message: 'Failed to get admin info' });
  }
}

// DELETE /api/admin/building/:id
async function deleteBuilding(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Building id is required' });
    }

    const building = await prisma.building.findUnique({
      where: { id },
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    await prisma.aggregatedStats.deleteMany({ where: { building_id: id } });
    await prisma.emotionSignal.deleteMany({ where: { building_id: id } });
    await prisma.message.updateMany({
      where: { building_id: id },
      data: { building_id: null },
    });
    await prisma.building.delete({ where: { id } });

    return res.json({ message: 'Building deleted' });
  } catch (error) {
    console.error('Error deleting building', error);
    return res.status(500).json({ message: 'Failed to delete building' });
  }
}

module.exports = {
  registerAdmin,
  loginAdmin,
  createCollege,
  createBuilding,
  getAdminMe,
  deleteBuilding,
};

