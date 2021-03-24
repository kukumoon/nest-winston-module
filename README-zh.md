<p align="center">
  <a href="http://nestjs.com"><img src="https://nestjs.com/img/logo_text.svg" alt="Nest Logo" width="320" /></a>
</p>

<p align="center">
  Nestjs Winston模块，提供灵活的日志记录方式。
  
  参考自 <a href="https://github.com/gremo/nest-winston">nest-winston</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/nest-winston-module"><img src="https://img.shields.io/npm/v/nest-winston-module.svg" alt="NPM version" /></a>
  <a href="https://www.npmjs.com/package/nest-winston-module"><img src="https://img.shields.io/npm/dw/nest-winston-module.svg" alt="NPM downloads" /></a>
  <a href="https://travis-ci.org/kukumoon/nest-winston-module"><img src="https://travis-ci.org/kukumoon/nest-winston-module.svg?branch=master" alt="Travis build" /></a>
  <a href="https://github.com/kukumoon/nest-winston-module/issues"><img src="https://img.shields.io/github/issues/kukumoon/nest-winston-module.svg" alt="GitHub issues" /></a>
  <a href="https://david-dm.org/kukumoon/nest-winston-module"><img src="https://img.shields.io/david/kukumoon/nest-winston-module.svg" alt="dependencies status"></a>
  <a href="https://david-dm.org/kukumoon/nest-winston-module?type=dev"><img src="https://david-dm.org/kukumoon/nest-winston-module/dev-status.svg" alt="devDependencies status" /></a>
</p>

## 安装

```bash
npm install --save nest-winston-module winston
```

## 快速开始

导入 `WinstonModule` 至 nest应用的根`module`（通常是`AppModule`），并使用`forRoot()`方法来配置`nest-winston-module`.  创建参数与winston.createLogger方法所需的参数一致，可参考`winston`官方文档：[`createLogger()`](https://github.com/winstonjs/winston#usage)

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

在此之后，我们便可以使用`Winstontoken`将`Winston`实例注入我们的`nest`应用中去，
`nest-winston-module`为应用的不同模块提供了一个token枚举，从而使处理不同类型的日志更加容易。看看下边这个示例：
```typescript
enum WinstonProviderEnum {
  /**
   * @description 替换 nest core Logger
   */
  coreProvider = 'winstonCoreProvider',
  /**
   * @description 应用层级 level Logger
   */
  appProvider = 'winstonAppProvider',
  /**
   * @description controller Logger
   */
  controllerProvider = 'winstonControllerProvider',
  /**
   * @description graphQL resolver Logger
   */
  resolverProvider = 'winstonResolverProvider',
  /**
   * @description service Logger
   */
  serviceProvider = 'winstonServiceProvider',
  /**
   * @description 控制台 Logger
   */
  consoleProvider = 'winstonConsoleProvider',
  /**
   * @description  所有Loggers的集合 
   */
  loggersProvider = 'winstonLoggersProvider',
}
```  
这是在`Nest Contrroler`中使用WinstonLogger的示例：
```typescript
import { Controller, Inject } from '@nestjs/common';
import { WinstonProviderEnum, NestWinstonLogger } from 'nest-winston-module';

@Controller('cats')
export class CatsController {
  // 使用提供的WinstonProviderEnum枚举来注入Winstoncontroller Logger至Cats Controller中去
  constructor(@Inject(WinstonProviderEnum.controllerProvider) private readonly logger: NestWinstonLogger) { }
}
```

请注意，`WinstonModule`是一个全局模块，它将在所有功能模块中可用。

## Nest Async configuration(异步配置注入)

> **注意事项⚠️**: 因为Nest的工作方式，所以我们无法注入从根模块本身导出的依赖项（使用`exports`）。 当我们使用`forRootAsync（）`并且需要注入服务，则必须使用`imports`选项导入该服务，或者必须从[global module](https://docs.nestjs.com/modules#global-module) 导出该服务

有时我们需要异步传递options，例如，当服务的启动依赖于动态配置项的读取。 在这种情况下，请使用`forRootAsync（）`方法，并从`useFactory`方法返回一个选项对象：

```typescript
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston-module';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: () => ({
        // options, 后续会有配置示例
      }),
      inject: [],
    }),
  ],
})
export class AppModule {}
```

`useFactory`创建模块的步骤可能是异步的，我们可以使用`inject`选项注入依赖项，并可以使用`imports`选项导入其他模块。

另外，我们可以使用`useClass`语法：

```typescript
WinstonModule.forRootAsync({
  useClass: WinstonConfigService,
})
```

使用上述代码，`Nest`将创建一个新的`WinstonConfigService`实例，并调用其方法`createWinstonModuleOptions`以提供模块选项。

## 替换Nest Core Logger

除了应用程序层级的日志记录之外，`nest-winston-module`还提供了`WinstonLogger`定制实现，可与`Nest`自带的日志记录系统一起使用。 以下是示例`main.ts`文件：

```typescript
import { WinstonProviderEnum } from 'nest-winston-module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WinstonProviderEnum.coreProvider));
}
bootstrap();
```

`NestApplication`实例上的`get()`方法用于检索`WinstonLogger`类的实例，该实例仍使用`WinstonModule.forRoot`或`WinstonModule.forRootAsync`方法进行配置。

注意，当我们替换Nest Core Logger时，只能使用`WinstonProviderEnum.coreProvider` token来做替换。 因为`Winston`与`Nest`所遵循的`Logger`接口并不完全相同，我们在框架内部对`coreProvider`做了微妙的适配。

## 替换Nest Core Logger (并且用作启动服务实例)

使用如上方式有一个小缺点。 `Nest`必须先引导应用程序（实例化模块和提供程序，注入依赖关系等），在此过程中，`WinstonLogger`实例尚不可用，这意味着`Nest`会退回到内部`Logger`。

这里还有一种解决方案，是使用`createLogger`函数在应用程序生命周期之外创建`Logger`，并将其传递给`NestFactory.create`：

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
不过使用这种方式，我们便无法使用`Nest`的依赖注入特性了。这意味着`WinstonModule.forRoot`和`WinstonModule.forRootAsync`方法么得用了。

要在我们的应用程序中也使用`core Logger`，请看如下示例：

```typescript
import { Logger, Module } from '@nestjs/common';

@Module({
    providers: [Logger],
})
export class AppModule {}
```

```typescript
import { Controller, Inject, Logger, LoggerService } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  constructor(@Inject(Logger) private readonly logger: LoggerService) { }
}
```

上述代码之所以可行，是因为`Nest Logger`包装了我们的`WinstonLogger`（由`createLogger`方法返回的相同实例）并将所有调用转发给它。

## 配置

我们可以使用`nest-winston-module`提供的默认配置项，或者根据业务的不同进行自定义操作：

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
