const express = require('express');
const chatController = require('../controllers/chat.controller');

const router = express.Router();

// Companion chat (AI placeholder)
router.post('/chat/companion', chatController.companionChat);

// Rant chat (AI placeholder)
router.post('/chat/rant', chatController.rantChat);

// Chat history for a user
router.get('/chat/history/:user_id', chatController.getChatHistory);

module.exports = router;

