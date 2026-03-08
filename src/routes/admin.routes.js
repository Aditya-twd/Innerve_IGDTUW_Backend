const express = require('express');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// Admin onboarding
router.post('/admin/register', adminController.registerAdmin);
router.post('/admin/login', adminController.loginAdmin);

// College and building management
router.get('/admin/me', adminController.getAdminMe);
router.post('/admin/college', adminController.createCollege);
router.post('/admin/building', adminController.createBuilding);
router.delete('/admin/building/:id', adminController.deleteBuilding);

module.exports = router;

