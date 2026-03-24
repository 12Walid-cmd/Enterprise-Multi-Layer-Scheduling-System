const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');

module.exports = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms\n`;

    process.stdout.write(logLine);

    fs.appendFile(logFile, logLine, (err) => {
      if (err) console.error('Failed to write to log file:', err);
    });
  });

  next();
};