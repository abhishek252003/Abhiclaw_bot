const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistant.controller');
const checkAuth = require('../middleware/auth.middleware');

router.post('/', checkAuth, assistantController.createAssistant);
router.get('/', checkAuth, assistantController.getAssistants);
router.get('/:id', checkAuth, assistantController.getAssistantById);

module.exports = router;
