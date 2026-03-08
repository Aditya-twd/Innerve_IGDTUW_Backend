const chatService = require('../services/chat.service');

// POST /api/chat/companion
async function companionChat(req, res) {
  try {
    const { user_id, college_id, building_id, text } = req.body;

    if (!user_id || !text) {
      return res.status(400).json({ message: 'user_id and text are required' });
    }

    const result = await chatService.createChatMessageWithMockEmotion({
      user_id,
      college_id: college_id || null,
      building_id: building_id || null,
      chat_type: 'companion',
      text,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error in companion chat', error);
    return res.status(500).json({ message: 'Failed to process companion chat' });
  }
}

// POST /api/chat/rant
async function rantChat(req, res) {
  try {
    const { user_id, college_id, building_id, text } = req.body;

    if (!user_id || !text) {
      return res.status(400).json({ message: 'user_id and text are required' });
    }

    const result = await chatService.createChatMessageWithMockEmotion({
      user_id,
      college_id: college_id || null,
      building_id: building_id || null,
      chat_type: 'rant',
      text,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error in rant chat', error);
    return res.status(500).json({ message: 'Failed to process rant chat' });
  }
}

// GET /api/chat/history/:user_id
async function getChatHistory(req, res) {
  const { user_id } = req.params;

  try {
    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required' });
    }

    const messages = await chatService.getUserMessages(user_id);

    return res.json({ messages });
  } catch (error) {
    console.error('Error fetching chat history', error);
    return res.status(500).json({ message: 'Failed to fetch chat history' });
  }
}

module.exports = {
  companionChat,
  rantChat,
  getChatHistory,
};

