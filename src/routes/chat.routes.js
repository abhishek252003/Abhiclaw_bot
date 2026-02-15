const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const checkAuth = require('../middleware/auth.middleware');

router.post('/', checkAuth, chatController.chat);
router.post('/save', checkAuth, chatController.saveMessage);
router.get('/:assistantId', checkAuth, chatController.getMessages);

module.exports = router;
