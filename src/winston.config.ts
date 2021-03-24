import * as path from 'path';
import {
  WinstonLogLevels,
  formatForFile,
  getConsoleTransportInstance,
  getFileLogTransportInstance,
  winstonLogLevels,
} from './winston.utilities';
import { LoggerOptions } from 'winston';
import { WinstonLoggerProviderKeysEnum } from './winston.interfaces';

/**
 * @description core logger(替换nest默认logger) 预设配置
 */
export const coreOptions: LoggerOptions = {
  levels: winstonLogLevels,
  level: WinstonLogLevels.info,
  format: formatForFile,
  transports: [
    getConsoleTransportInstance(),
    getFileLogTransportInstance({
      providerType: WinstonLoggerProviderKeysEnum.core,
      directory: path.resolve(process.cwd(), './logs/'),
    }),
  ],
};

/**
 * @description app logger(应用层面日志) 预设配置
 */
export const appOptions: LoggerOptions = {
  levels: winstonLogLevels,
  level: WinstonLogLevels.info,
  format: formatForFile,
  transports: [
    getConsoleTransportInstance(),
    getFileLogTransportInstance({
      providerType: WinstonLoggerProviderKeysEnum.app,
      directory: path.resolve(process.cwd(), './logs/'),
    }),
  ],
};

/**
 * @description resolve logger(GraphQL resolve日志) 预设配置
 */
export const resolverOptions: LoggerOptions = {
  levels: winstonLogLevels,
  level: WinstonLogLevels.info,
  format: formatForFile,
  transports: [
    getConsoleTransportInstance(),
    getFileLogTransportInstance({
      providerType: WinstonLoggerProviderKeysEnum.resolver,
      directory: path.resolve(process.cwd(), './logs/'),
      levelAt: WinstonLogLevels.warn,
    }),
    getFileLogTransportInstance({
      providerType: WinstonLoggerProviderKeysEnum.resolver,
      directory: path.resolve(process.cwd(), './logs/'),
      levelAt: WinstonLogLevels.error,
    }),
    getFileLogTransportInstance({
      providerType: WinstonLoggerProviderKeysEnum.app,
      directory: path.resolve(process.cwd(), './logs/'),
    }),
  ],
};

/**
 * @description controller logger(RESTful controller日志) 预设配置
 */
export const controllerOptions: LoggerOptions = {
  levels: winstonLogLevels,
  level: WinstonLogLevels.info,
  format: formatForFile,
  transports: [
    getConsoleTransportInstance(),
    getFileLogTransportInstance({
      providerType: WinstonLoggerProviderKeysEnum.controller,
      directory: path.resolve(process.cwd(), './logs/'),
      levelAt: WinstonLogLevels.warn,
    }),
    getFileLogTransportInstance({
      providerType: WinstonLoggerProviderKeysEnum.controller,
      directory: path.resolve(process.cwd(), './logs/'),
      levelAt: WinstonLogLevels.error,
    }),
    getFileLogTransportInstance({
      providerType: WinstonLoggerProviderKeysEnum.app,
      directory: path.resolve(process.cwd(), './logs/'),
    }),
  ],
};

/**
 * @description resolve logger(各种业务service日志) 预设配置
 */
export const serviceOptions: LoggerOptions = {
  levels: winstonLogLevels,
  level: WinstonLogLevels.info,
  format: formatForFile,
  transports: [
    getConsoleTransportInstance(),
    getFileLogTransportInstance({
      providerType: WinstonLoggerProviderKeysEnum.service,
      directory: path.resolve(process.cwd(), './logs/'),
      levelAt: WinstonLogLevels.warn,
    }),
    getFileLogTransportInstance({
      providerType: WinstonLoggerProviderKeysEnum.service,
      directory: path.resolve(process.cwd(), './logs/'),
      levelAt: WinstonLogLevels.error,
    }),
    getFileLogTransportInstance({
      providerType: WinstonLoggerProviderKeysEnum.app,
      directory: path.resolve(process.cwd(), './logs/'),
    }),
  ],
};

export const consoleOptions: LoggerOptions = {
  levels: winstonLogLevels,
  level: WinstonLogLevels.info,
  transports: [getConsoleTransportInstance()],
};
