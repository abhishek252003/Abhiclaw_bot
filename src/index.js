const express = require('express');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const puter = require('@heyputer/puter.js').default;

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL_REJECTION:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('CRITICAL_EXCEPTION:', err);
    process.exit(1);
});

dotenv.config();

if (process.env.PUTER_TOKEN && process.env.PUTER_TOKEN !== 'your_puter_token_here') {
    puter.setAuthToken(process.env.PUTER_TOKEN);
    console.log('Puter.js authenticated with token from environment');
} else {
    console.warn('Warning: PUTER_TOKEN not found or invalid in environment. AI features may fail.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // For production, replace with your frontend URL on Render
    credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
    try {
        const log = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
        fs.appendFileSync('request.log', log);
        console.error(log);
    } catch (e) {
        console.error('Logging error:', e);
    }
    next();
});

// Routes
const authRoutes = require('./routes/auth.routes');
const assistantRoutes = require('./routes/assistant.routes');
const chatRoutes = require('./routes/chat.routes');
const { startBot } = require('./services/telegram.service');

app.use('/api/auth', authRoutes);
app.use('/api/assistants', assistantRoutes);
app.use('/api/chat', chatRoutes);

// Start Telegram Bot
startBot();

// Root route
app.get('/', (req, res) => {
    res.send('AI SaaS Backend is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
