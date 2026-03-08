const prisma = require('../config/prisma');

// POST /api/student/register
async function registerStudent(req, res) {
  try {
    const { college_id, department, hostel, year, avatar } = req.body;

    if (!college_id || !department) {
      return res.status(400).json({
        message: 'college_id and department are required',
      });
    }

    const college = await prisma.college.findUnique({
      where: { id: college_id },
    });

    if (!college) {
      return res.status(400).json({ message: 'Invalid college_id' });
    }

    const student = await prisma.user.create({
      data: {
        role: 'student',
        college_id,
        department,
        hostel: hostel || null,
        year: year !== undefined ? Number(year) : null,
        avatar: avatar || null,
      },
    });

    return res.status(201).json({
      student_id: student.id,
      college_id: college.id,
    });
  } catch (error) {
    console.error('Error registering student', error);
    return res.status(500).json({ message: 'Failed to register student' });
  }
}

// DELETE /api/user/delete/:user_id
async function deleteUserAccount(req, res) {
  const { user_id } = req.params;

  try {
    const existing = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete related emotion signals and messages first to satisfy FKs
    await prisma.emotionSignal.deleteMany({
      where: { user_id },
    });

    await prisma.message.deleteMany({
      where: { user_id },
    });

    await prisma.user.delete({
      where: { id: user_id },
    });

    return res.json({ message: 'User account and related data deleted' });
  } catch (error) {
    console.error('Error deleting user account', error);
    return res.status(500).json({ message: 'Failed to delete user account' });
  }
}

module.exports = {
  registerStudent,
  deleteUserAccount,
};

