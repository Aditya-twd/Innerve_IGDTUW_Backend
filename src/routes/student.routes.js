const express = require('express');
const studentController = require('../controllers/student.controller');

const router = express.Router();

// Student onboarding
router.post('/student/register', studentController.registerStudent);

// User settings
router.delete('/user/delete/:user_id', studentController.deleteUserAccount);

module.exports = router;

