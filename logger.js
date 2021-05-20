const winston = require("winston");
const { combine, timestamp, printf, prettyPrint, metadata, colorize } = winston.format;
require("winston-daily-rotate-file");


const timezoned = () => {
	return new Date().toLocaleString("en-GB", {
		timeZone: "Europe/Helsinki",
	});
};

const logFormat = printf(info => `[${info.timestamp}] [${info.level}] ${info.message}`);
const logger = winston.createLogger({
	format: combine(
		timestamp({ format : timezoned }),
		prettyPrint(),
		metadata({ fillExcept: ["message", "level", "timestamp"] }),
	),
	transports: [
		new winston.transports.Console({
			format: combine(
				colorize(),
				logFormat),
			handleRejections: true,
		}),
		new winston.transports.DailyRotateFile({
			format: logFormat,
			dirname: "logs",
			filename: "picasso-%DATE%.log",
			datePattern: "DD-MM-YYYY",
			maxSize: "20m",
			maxFiles: "14d",
		}),
	],
});

module.exports = logger;
