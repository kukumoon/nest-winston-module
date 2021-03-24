import {Logger, LoggerOptions} from 'winston';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { LoggerService, Type } from '@nestjs/common';

export enum WinstonLoggerProviderKeysEnum {
  core = 'core',
  app = 'app',
  controller = 'controller',
  resolver = 'resolver',
  service = 'service',
  console = 'console',
}

export type WinstonModuleOptions = {
  [key in keyof typeof WinstonLoggerProviderKeysEnum]?: LoggerOptions;
} & {
  directory?: string;
};

export type WinstonProviders = {
  [key in keyof typeof WinstonLoggerProviderKeysEnum]?: Logger;
};

export interface WinstonModuleOptionsFactory {
  createWinstonModuleOptions():
  | Promise<WinstonModuleOptions>
  | WinstonModuleOptions;
}

export interface WinstonModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (
    ...args: any[]
  ) => Promise<WinstonModuleOptions> | WinstonModuleOptions;
  inject?: any[];
  useClass?: Type<WinstonModuleOptionsFactory>;
}

export type NestWinstonLogger = LoggerService & Logger;
