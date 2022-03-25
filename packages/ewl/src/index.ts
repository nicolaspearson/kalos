import { Handler, NextFunction, Request, Response } from 'express';
import * as httpContext from 'express-http-context';
import {
  BaseLoggerOptions,
  FilterRequest,
  FilterResponse,
  logger as expressWinstonLogger,
} from 'express-winston';
import jsonStringify from 'safe-stable-stringify';
import { Logger, config, createLogger, format, transports } from 'winston';
import * as Transport from 'winston-transport';

import { Config, OptionalConfig } from '$/config';
import { defaultFormatter, injectErrors, injectMetadata, logstashFormatter } from '$/formatter';
import { requestIdHandler } from '$/request-id';
import { sanitizeRequest, sanitizeResponse } from '$/sanitizer';

export class Ewl {
  public readonly config: Config;

  public readonly logger: Logger;

  /**
   * The http context middleware to be called right before the
   * next handler that needs to retrieve information from it.
   */
  public readonly httpContextMiddleware = httpContext.middleware;

  constructor(options?: OptionalConfig) {
    const { config, errors } = Config.validate(options);
    if (errors.length > 0) {
      throw new Error(jsonStringify(Config.formatValidationErrors(errors)));
    }
    this.config = config;
    this.logger = this.create();
  }

  public log(message: string, context?: string): Logger {
    return this.logger.info(message, { context });
  }

  public error(message: string, trace?: string, context?: string): Logger {
    return this.logger.error(message, { trace, context });
  }

  public warn(message: string, context?: string): Logger {
    return this.logger.warn(message, { context });
  }

  public debug(message: string, context?: string): Logger {
    return this.logger.debug(message, { context });
  }

  public verbose(message: string, context?: string): Logger {
    return this.logger.verbose(message, { context });
  }

  /**
   * Create a labelled `winston` logger instance.
   *
   * @returns The Logger instance with transports attached by environment.
   */
  public create(): Logger {
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
  public createHandler(options: BaseLoggerOptions): Handler {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return expressWinstonLogger({
      expressFormat: false,
      ignoreRoute: /* istanbul ignore next */ () => false,
      meta: true,
      metaField: 'express',
      msg: '{{req.method}} {{req.url}}',
      requestFilter: /* istanbul ignore next */ (req: FilterRequest, propertyName: string) =>
        sanitizeRequest(req, propertyName),
      responseFilter: /* istanbul ignore next */ (res: FilterResponse, propertyName: string) =>
        sanitizeResponse(res, propertyName, options),
      ...options,
      winstonInstance: this.logger,
    });
  }

  public getRequestIdHandler(): (_: Request, __: Response, next: NextFunction) => void {
    return requestIdHandler;
  }
}
