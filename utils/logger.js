const { createLogger, format, transports } = require('winston');

const isProd = process.env.NODE_ENV === "production";

const logger = createLogger({
  level: 'info',
  format: isProd
    ? format.combine(
        format.timestamp(),
        format.json()
      )
    : format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        })
      ),
  transports: [new transports.Console()]
});

module.exports = logger;