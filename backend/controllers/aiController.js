const { handleChat } = require('../ai/aiService');

const chatWithAI = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    const aiResponse = await handleChat(message);
    res.json({ reply: aiResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { chatWithAI };
