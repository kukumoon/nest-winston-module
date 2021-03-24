<p align="center">
  <a href="http://nestjs.com"><img src="https://nestjs.com/img/logo_text.svg" alt="Nest Logo" width="320" /></a>
</p>

<p align="center">
  <a href="https://github.com/kukumoon/nest-winston-module/blob/main/README-zh.md">中文文档</a>
</p>

<p align="center">
  A <a href="https://github.com/nestjs/nest">Nest</a> module wrapper for <a href="https://github.com/winstonjs/winston">winston</a> , provides multi type of loggers.
  
  Inspired by <a href="https://github.com/gremo/nest-winston">nest-winston</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/nest-winston-module"><img src="https://img.shields.io/npm/v/nest-winston-module.svg" alt="NPM version" /></a>
  <a href="https://www.npmjs.com/package/nest-winston-module"><img src="https://img.shields.io/npm/dw/nest-winston-module.svg" alt="NPM downloads" /></a>
  <a href="https://travis-ci.org/kukumoon/nest-winston-module"><img src="https://travis-ci.org/kukumoon/nest-winston-module.svg?branch=master" alt="Travis build" /></a>
  <a href="https://github.com/kukumoon/nest-winston-module/issues"><img src="https://img.shields.io/github/issues/kukumoon/nest-winston-module.svg" alt="GitHub issues" /></a>
  <a href="https://david-dm.org/kukumoon/nest-winston-module"><img src="https://img.shields.io/david/kukumoon/nest-winston-module.svg" alt="dependencies status"></a>
  <a href="https://david-dm.org/kukumoon/nest-winston-module?type=dev"><img src="https://david-dm.org/kukumoon/nest-winston-module/dev-status.svg" alt="devDependencies status" /></a>
</p>

## Installation

```bash
npm install --save nest-winston-module winston
```

## Quick Start

Import `WinstonModule` into the root `AppModule` and use the `forRoot()` method to configure it. This method accepts the same options object as [`createLogger()`](https://github.com/winstonjs/winston#usage) function from the winston package:

```typescript
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston-module';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      // options
    }),
  ],
})
export class AppModule {}
```

Afterward, the winston instance will be available to inject across entire project using the `winston` injection token, 
`nest-winston-module` provide a token enum for you, to make handling different type of logs easier. here is what the injection token enum looks like:
```typescript
enum WinstonProviderEnum {
  /**
   * @description for replacing nest core logger
   */
  coreProvider = 'winstonCoreProvider',
  /**
   * @description application level logger
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
   * @description all logger providers map 
   */
  loggersProvider = 'winstonLoggersProvider',
}
```  

Here is an example using winston logger in `Nest Controller`:
```typescript
import { Controller, Inject } from '@nestjs/common';
import { WinstonProviderEnum, NestWinstonLogger } from 'nest-winston-module';

@Controller('cats')
export class CatsController {
  constructor(@Inject(WinstonProviderEnum.controllerProvider) private readonly logger: NestWinstonLogger) { }
}
```

Note that `WinstonModule` is a global module, it will be available in all your feature modules.

## Async configuration

> **Caveats**: because the way Nest works, you can't inject dependencies exported from the root module itself (using `exports`). If you use `forRootAsync()` and need to inject a service, that service must be either imported using the `imports` options or exported from a [global module](https://docs.nestjs.com/modules#global-modules).

Maybe you need to asynchronously pass your module options, for example when you need a configuration service. In such case, use the `forRootAsync()` method, returning an options object from the `useFactory` method:

```typescript
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston-module';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: () => ({
        // options
      }),
      inject: [],
    }),
  ],
})
export class AppModule {}
```

The factory might be async, can inject dependencies with `inject` option and import other modules using the `imports` option.

Alternatively, you can use the `useClass` syntax:

```typescript
WinstonModule.forRootAsync({
  useClass: WinstonConfigService,
})
```

With the above code, Nest will create a new instance of `WinstonConfigService` and its method `createWinstonModuleOptions` will be called in order to provide the module options.

## Use as the main Nest logger

Apart from application logging, this module also provides the `WinstonLogger` custom implementation, for use with the Nest logging system. Example `main.ts` file:

```typescript
import { WinstonProviderEnum } from 'nest-winston-module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WinstonProviderEnum.coreProvider));
}
bootstrap();
```

Here the `get()` method on the NestApplication instance is used to retrieve the singleton instance of `WinstonLogger` class, which is still configured using either `WinstonModule.forRoot` or `WinstonModule.forRootAsync` methods.

When using this technique, you can only inject the logger using the `WinstonProviderEnum.coreProvider` token. Because `winston` logger interface is different from `Nest` logger interface.  

## Use as the main Nest logger (also for bootstrapping)

Using the dependency injection has one minor drawback. Nest has to bootstrap the application first (instantiating modules and providers, injecting dependencies, etc) and during this process the instance of `WinstonLogger` is not yet available, which means that Nest falls back to the internal logger.

One solution is to create the logger outside of the application lifecycle, using the `createLogger` function, and pass it to `NestFactory.create`:

```typescript
import { WinstonModule } from 'nest-winston-module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      // options (same as WinstonModule.forRoot() options)
    })
  });
}
bootstrap();
```

By doing this, you give up the dependency injection, meaning that `WinstonModule.forRoot` and `WinstonModule.forRootAsync` are not needed anymore.

To use the logger also in your application, change your main module to provide the `Logger` service from `@nestjs/common`:

```typescript
import { Logger, Module } from '@nestjs/common';

@Module({
    providers: [Logger],
})
export class AppModule {}
```

Then simply inject the `Logger`:

```typescript
import { Controller, Inject, Logger, LoggerService } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  constructor(@Inject(Logger) private readonly logger: LoggerService) { }
}
```

This works because Nest `Logger` wraps our winston logger (the same instance returned by the `createLogger` method) and will forward all calls to it.

## Utilities

The module also provides a custom Nest-like special formatter for console transports:

```typescript
import { Module } from '@nestjs/common';
import {
  coreOptions,
  appOptions,
  controllerOptions,
  resolverOptions,
  serviceOptions,
  consoleOptions,
} from 'nest-winston-module';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRoot({
        core: coreOptions,
        app: appOptions,
        resolver: resolverOptions,
        controller: controllerOptions,
        service: serviceOptions,
        console: consoleOptions,
        directory: process.cwd() + '/logs',
    }),
  ],
})
export class AppModule {}
```
