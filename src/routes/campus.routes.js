const express = require('express');
const campusController = require('../controllers/campus.controller');

const router = express.Router();

router.get('/campus/colleges', campusController.getColleges);
router.get('/campus/buildings/:college_id', campusController.getCampusBuildings);

module.exports = router;

