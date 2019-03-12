'use strict';

const {createLogger, format, transports} = require('winston');

// Формат отображения логов
const loggerFormat = format.combine(
    format.timestamp(),
    format.align(),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

const logger = createLogger({
    level: 'info',
    format: loggerFormat,
    defaultMeta: {service: 'chat-server'},
    transports: [
        new transports.File({filename: './logs/chat-server-error.log', level: 'error', handleExceptions: false}), // Лог только с ошибками
        new transports.File({filename: './logs/chat-server-combined.log', handleExceptions: false}) // Все сообщения начиная от info сюда
    ],
    exitOnError: false
});

// В разработки логи кидаются помимо файлов в консоль
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: loggerFormat
    }));
}

module.exports = logger;