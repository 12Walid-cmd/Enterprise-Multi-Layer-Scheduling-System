const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const cleanOldLogs = () => {
  const files = fs.readdirSync(logsDir);
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  files.forEach(file => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);
    if (now - stats.mtimeMs > sevenDays) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old log file: ${file}`);
    }
  });
};

cleanOldLogs();

module.exports = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const status = res.statusCode;

    // Label log level based on status code
    const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';

    const logLine = `[${timestamp}] [${level}] ${req.method} ${req.originalUrl} - ${status} - ${duration}ms\n`;

    process.stdout.write(logLine);

    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `${date}.log`);

    fs.appendFile(logFile, logLine, (err) => {
      if (err) console.error('Failed to write to log file:', err);
    });
  });

  next();
};
