// eslint-disable-next-line @typescript-eslint/no-var-requires
const winston = require('winston');
require('winston-daily-rotate-file');

import * as path from 'path';
import { format, transports } from 'winston';

import { WinstonLoggerProviderKeysEnum } from './winston.interfaces';
import dayjs from 'dayjs';

const { combine, colorize, printf, timestamp } = format;

// 错误级别定义
export enum WinstonLogLevels {
  error = 'error',
  warn = 'warn',
  info = 'info',
  debug = 'debug',
  trace = 'trace',
}

// levels constant
export const winstonLogLevels = {
  [WinstonLogLevels.error]: 0,
  [WinstonLogLevels.warn]: 1,
  [WinstonLogLevels.info]: 2,
  [WinstonLogLevels.debug]: 3,
  [WinstonLogLevels.trace]: 4,
};

// 错误级别颜色定义
export const winstonLogColors = {
  [WinstonLogLevels.error.toUpperCase()]: 'red',
  [WinstonLogLevels.warn.toUpperCase()]: 'yellow',
  [WinstonLogLevels.info.toUpperCase()]: 'green',
  [WinstonLogLevels.debug.toUpperCase()]: 'blue',
  [WinstonLogLevels.trace.toUpperCase()]: 'magenta',
};

// 获取日志输出所在文件及行号
const getFileNameAndLineNumber = () => {
  Error.stackTraceLimit = 100;
  const oldStackTrace = Error.prepareStackTrace;

  // 设置
  const boilerplateLines = (line: { getFileName: () => string | string[] }) => {
    if (line && line.getFileName()) {
      if (line.getFileName().indexOf('winston.utilities.js') > 0) {
        return false;
      }
      if (
        line.getFileName().indexOf('<My Module Name>') &&
        line.getFileName().indexOf('/node_modules/') < 0
      ) {
        return line.getFileName();
      }
    }
    return false;
  };

  try {
    // eslint-disable-next-line handle-callback-err
    Error.prepareStackTrace = (err, structuredStackTrace) =>
      structuredStackTrace;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Error.captureStackTrace(this);
    // we need to "peel" the first CallSites (frames) in order to get to the caller we're looking for
    // in our case we're removing frames that come from logger module or from winston
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const callSites = this.stack.filter(boilerplateLines);
    // const callSites = this.stack;
    if (0 === callSites.length) {
      // bail gracefully: even though we shouldn't get here, we don't want to crash for a log print!
      return null;
    }
    const results = [];
    let baseDir = process.env.INIT_CWD || process.env.PWD;

    if (process.env.pm_cwd) {
      baseDir = process.env.pm_cwd;
    }
    for (let i = 0; i < callSites.length; i++) {
      const callSite = callSites[i];
      const fileName = callSite.getFileName();
      if (fileName.indexOf(baseDir) >= 0) {
        results.push(`${fileName} line:${callSite.getLineNumber()}`);
        break;
      }
    }
    return results.join('\n');
  } catch (err) {
    console.log(err.stack);
  } finally {
    Error.prepareStackTrace = oldStackTrace;
  }
};

// 错误级别转大写
const upperCaseLevel = format(info => {
  info.level = info.level.toUpperCase();
  return info;
});

// 日志输出格式
const logFormat = printf(info => {
  const items = [
    dayjs(info.timestamp).format('YYYY-MM-DD HH:mm:ss.SSS'),
    info.level,
  ];

  info.label && items.push(`[${info.label}]`);
  info.traceId ? items.push(`${info.traceId}`) : items.push('##TRACE ID##');
  items.push(':');
  info.spanId ? items.push(`${info.spanId}`) : items.push('##SPAN ID##');
  items.push(<string>getFileNameAndLineNumber());
  items.push('-');
  items.push(info.message);

  if (info.durationMs !== undefined) {
    items.push(`${info.durationMs}ms`);
  }

  return items.join(' ');
});

// 文件日志格式
export const formatForFile = combine(upperCaseLevel(), timestamp(), logFormat);

// 控制台日志格式
export const formatForConsole = combine(
  upperCaseLevel(),
  timestamp(),
  colorize({
    level: true,
    colors: winstonLogColors,
  }),
  logFormat,
);

export const getConsoleTransportInstance = () =>
  new transports.Console({
    format: formatForConsole,
  });

export const getFileLogTransportInstance = ({
  providerType,
  directory,
  levelAt,
}: {
  providerType: WinstonLoggerProviderKeysEnum;
  directory: string;
  levelAt?: WinstonLogLevels;
}) => {
  const filename = path.resolve(
    directory,
    `${providerType}-${levelAt || 'full'}-%DATE%.log`,
  );

  return new winston.transports.DailyRotateFile({
    filename,
    level: levelAt,
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
  });
};
