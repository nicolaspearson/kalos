import { NextFunction, Request, Response } from 'express';
import {
  BaseLoggerOptions,
  FilterRequest,
  FilterResponse,
  logger as expressWinstonLogger,
} from 'express-winston';
import jsonStringify from 'safe-stable-stringify';
import { v4 as uuidv4 } from 'uuid';
import { Logger, config, createLogger, format, transports } from 'winston';
import * as Transport from 'winston-transport';

import { StoreContents, storage } from './async-storage';
import { Config, OptionalConfig } from './config';
import { defaultFormatter, injectErrors, injectMetadata, logstashFormatter } from './formatter';
import { sanitizeRequest, sanitizeResponse } from './sanitizer';

export { Environment, LogLevel } from './config';

export class Ewl {
  readonly config: Config;

  readonly logger: Logger;

  readonly contextMiddleware: (req: Request, res: Response, next: NextFunction) => void;

  requestMiddleware: ((req: Request, res: Response, next: NextFunction) => void) | null = null;

  constructor(options?: OptionalConfig) {
    const { config, errors } = Config.validate(options);
    if (errors.length > 0) {
      throw new Error(jsonStringify(Config.formatValidationErrors(errors)));
    }
    this.config = config;

    const logger = this.create();

    // Proxify the logger instance to use a child logger from async storage if it exists.
    this.logger = new Proxy(logger, {
      get(target: Logger, property: string | symbol, receiver: unknown): Logger {
        const store = storage.getStore();
        target = store?.get(config.label)?.logger || target;
        return Reflect.get(target, property, receiver) as Logger;
      },
    });

    this.contextMiddleware = (_req: Request, _res: Response, next: NextFunction): void => {
      const store = new Map<string, StoreContents>();
      const requestId = uuidv4();
      store.set(config.label, { logger: logger.child({ requestId }), requestId });
      storage.run(store, () => {
        next();
      });
    };

    if (config.enableRequestLogging) {
      this.createRequestMiddleware(config.requestLoggingOptions);
    }
  }

  debug(message: string, context?: string): Logger {
    return this.logger.debug(message, { context });
  }

  error(message: string, trace?: string, context?: string): Logger {
    return this.logger.error(message, { trace, context });
  }

  info(message: string, context?: string): Logger {
    return this.logger.info(message, { context });
  }

  log(message: string, context?: string): Logger {
    return this.logger.info(message, { context });
  }

  verbose(message: string, context?: string): Logger {
    return this.logger.verbose(message, { context });
  }

  warn(message: string, context?: string): Logger {
    return this.logger.warn(message, { context });
  }

  /**
   * Create a labelled `winston` logger instance.
   *
   * @returns The Logger instance with transports attached by environment.
   */
  create(): Logger {
    const logTransporters: Transport[] = [];

    // Array of strings containing the levels to log to stderr instead of stdout
    const stderrLevels = ['error'];
    const consoleTransport = new transports.Console({ stderrLevels });

    if (this.config.useLogstashFormat) {
      consoleTransport.format = format.combine(format.timestamp(), logstashFormatter(this.config));
      logTransporters.push(consoleTransport);
    } else {
      // Default formats
      consoleTransport.format = format.combine(
        format.colorize(),
        format.printf((info) => defaultFormatter(this.config, info)),
      );
      logTransporters.push(consoleTransport);
    }

    return createLogger({
      level: this.config.logLevel,
      levels: config.npm.levels,
      // Global formats
      format: format.combine(
        injectMetadata(this.config),
        injectErrors(),
        format.label({ label: this.config.label }),
      ),
      transports: logTransporters,
    });
  }

  /**
   * Create an express winston logger handler middleware.
   *
   * @param {BaseLoggerOptions} options The express-winston logger options.
   * @returns The middleware handler.
   */
  createRequestMiddleware(options: BaseLoggerOptions): void {
    this.requestMiddleware = expressWinstonLogger({
      requestFilter: /* istanbul ignore next */ (req: FilterRequest, propertyName: string) =>
        sanitizeRequest(req, propertyName, options),
      responseFilter: /* istanbul ignore next */ (res: FilterResponse, propertyName: string) =>
        sanitizeResponse(res, propertyName, options),
      ...options,
      // This is handled internally by the sanitize methods.
      bodyBlacklist: [],
      winstonInstance: this.logger,
    });
  }
}
