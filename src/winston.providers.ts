import { Logger, createLogger } from 'winston';
import { Provider, Type } from '@nestjs/common';
import {
  WinstonLoggerProviderKeysEnum,
  WinstonModuleAsyncOptions,
  WinstonModuleOptions, WinstonModuleOptionsFactory,
  WinstonProviders,
} from './winston.interfaces';
import {
  WinstonProviderEnum,
  winstonModuleOptions,
} from './winston.constants';
import { WinstonLogger } from './winston.classes';

export function createCoreLogger(
  loggerOptionsMap: WinstonModuleOptions,
): WinstonLogger {
  return new WinstonLogger(createLogger(loggerOptionsMap.core));
}

export function createWinstonProviders(
  loggerOptionsMap: WinstonModuleOptions,
): Provider[] {
  return [
    {
      provide: WinstonProviderEnum.coreProvider,
      useFactory: () => createLogger(loggerOptionsMap.core),
    },
    {
      provide: WinstonProviderEnum.appProvider,
      useFactory: () => createLogger(loggerOptionsMap.app),
    },
    {
      provide: WinstonProviderEnum.consoleProvider,
      useFactory: () => createLogger(loggerOptionsMap.console),
    },
    {
      provide: WinstonProviderEnum.controllerProvider,
      useFactory: () => createLogger(loggerOptionsMap.controller),
    },
    {
      provide: WinstonProviderEnum.resolverProvider,
      useFactory: () => createLogger(loggerOptionsMap.resolver),
    },
    {
      provide: WinstonProviderEnum.serviceProvider,
      useFactory: () => createLogger(loggerOptionsMap.service),
    },
    {
      provide: WinstonProviderEnum.loggersProvider,
      useFactory: (
        coreLogger: Logger,
        appLogger: Logger,
        consoleLogger: Logger,
        controllerLogger: Logger,
        resolverLogger: Logger,
        serviceLogger: Logger,
      ): WinstonProviders => {
        return {
          [WinstonLoggerProviderKeysEnum.core]: coreLogger,
          [WinstonLoggerProviderKeysEnum.app]: appLogger,
          [WinstonLoggerProviderKeysEnum.console]: consoleLogger,
          [WinstonLoggerProviderKeysEnum.controller]: controllerLogger,
          [WinstonLoggerProviderKeysEnum.resolver]: resolverLogger,
          [WinstonLoggerProviderKeysEnum.service]: serviceLogger,
        };
      },
      inject: [
        WinstonProviderEnum.coreProvider,
        WinstonProviderEnum.appProvider,
        WinstonProviderEnum.consoleProvider,
        WinstonProviderEnum.controllerProvider,
        WinstonProviderEnum.resolverProvider,
        WinstonProviderEnum.serviceProvider,
      ],
    },
  ];
}

export function createWinstonAsyncProviders(
  options: WinstonModuleAsyncOptions,
): Provider[] {
  const providers: Provider[] = [
    {
      provide: WinstonProviderEnum.coreProvider,
      useFactory: (loggerOptionsMap: WinstonModuleOptions) =>
        createLogger(loggerOptionsMap.core),
      inject: [winstonModuleOptions],
    },
    {
      provide: WinstonProviderEnum.appProvider,
      useFactory: (loggerOptionsMap: WinstonModuleOptions) =>
        createLogger(loggerOptionsMap.app),
      inject: [winstonModuleOptions],
    },
    {
      provide: WinstonProviderEnum.consoleProvider,
      useFactory: (loggerOptionsMap: WinstonModuleOptions) =>
        createLogger(loggerOptionsMap.console),
      inject: [winstonModuleOptions],
    },
    {
      provide: WinstonProviderEnum.controllerProvider,
      useFactory: (loggerOptionsMap: WinstonModuleOptions) =>
        createLogger(loggerOptionsMap.controller),
      inject: [winstonModuleOptions],
    },
    {
      provide: WinstonProviderEnum.resolverProvider,
      useFactory: (loggerOptionsMap: WinstonModuleOptions) =>
        createLogger(loggerOptionsMap.resolver),
      inject: [winstonModuleOptions],
    },
    {
      provide: WinstonProviderEnum.serviceProvider,
      useFactory: (loggerOptionsMap: WinstonModuleOptions) =>
        createLogger(loggerOptionsMap.service),
      inject: [winstonModuleOptions],
    },
    {
      provide: WinstonProviderEnum.loggersProvider,
      useFactory: (
        coreLogger: Logger,
        appLogger: Logger,
        consoleLogger: Logger,
        controllerLogger: Logger,
        resolverLogger: Logger,
        serviceLogger: Logger,
      ): WinstonProviders => {
        return {
          [WinstonLoggerProviderKeysEnum.core]: coreLogger,
          [WinstonLoggerProviderKeysEnum.app]: appLogger,
          [WinstonLoggerProviderKeysEnum.console]: consoleLogger,
          [WinstonLoggerProviderKeysEnum.controller]: controllerLogger,
          [WinstonLoggerProviderKeysEnum.resolver]: resolverLogger,
          [WinstonLoggerProviderKeysEnum.service]: serviceLogger,
        };
      },
      inject: [
        WinstonProviderEnum.coreProvider,
        WinstonProviderEnum.appProvider,
        WinstonProviderEnum.consoleProvider,
        WinstonProviderEnum.controllerProvider,
        WinstonProviderEnum.resolverProvider,
        WinstonProviderEnum.serviceProvider,
      ],
    },
  ];

  if (options.useClass) {
    const useClass = options.useClass as Type<WinstonModuleOptionsFactory>;
    providers.push(...[
      {
        provide: winstonModuleOptions,
        useFactory: async (optionsFactory: WinstonModuleOptionsFactory) =>
          await optionsFactory.createWinstonModuleOptions(),
        inject: [useClass],
      },
      {
        provide: useClass,
        useClass,
      },
    ]);
  }

  providers.push({
    provide: winstonModuleOptions,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    useFactory: options.useFactory,
    inject: options.inject || [],
  });

  return providers;
}
