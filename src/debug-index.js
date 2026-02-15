const express = require('express');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const prisma = require('./prisma');

process.on('unhandledRejection', (reason, promise) => {
    console.error('GLOBAL_UNHANDLED_REJECTION:', reason);
    fs.appendFileSync('crash.log', `REJECTION: ${reason.stack || reason}\n`);
});

process.on('uncaughtException', (err) => {
    console.error('GLOBAL_UNCAUGHT_EXCEPTION:', err);
    fs.appendFileSync('crash.log', `EXCEPTION: ${err.stack || err}\n`);
    process.exit(1);
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('DEBUG_SERVER_ALIVE'));

app.listen(PORT, () => {
    console.log(`Debug server listening on ${PORT}`);
    // Try to use prisma to see if it crashes
    prisma.assistant.findFirst()
        .then(res => console.log('Prisma test success'))
        .catch(err => console.error('Prisma test fail:', err));
});
