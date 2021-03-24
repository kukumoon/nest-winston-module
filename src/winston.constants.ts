export enum WinstonProviderEnum {
  /**
   * @description 替换nest core logger
   */
  coreProvider = 'winstonCoreProvider',
  /**
   * @description 应用 logger
   */
  appProvider = 'winstonAppProvider',
  /**
   * @description controller logger
   */
  controllerProvider = 'winstonControllerProvider',
  /**
   * @description graphQL resolver logger
   */
  resolverProvider = 'winstonResolverProvider',
  /**
   * @description service logger
   */
  serviceProvider = 'winstonServiceProvider',
  /**
   * @description console logger
   */
  consoleProvider = 'winstonConsoleProvider',
  /**
   * @description loggers provider
   */
  loggersProvider = 'winstonLoggersProvider',
}

export const winstonModuleOptions = 'winstonModuleOptions';
