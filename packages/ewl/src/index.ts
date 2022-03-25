/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Handler, NextFunction, Request, Response } from 'express';
import * as httpContext from 'express-http-context';
import * as expressWinston from 'express-winston';
import { Format, TransformableInfo, format as logformFormat } from 'logform';
import jsonStringify from 'safe-stable-stringify';
import { MESSAGE } from 'triple-beam';
import { v4 as uuidv4 } from 'uuid';
import { Logger, config, createLogger, format, transports } from 'winston';
import * as Transport from 'winston-transport';

import { Config, Options } from '$/config';

export class Ewl {
  private config: Config;

  public logger: Logger;

  constructor(options?: Options) {
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
   * The express handler that injects a generated uuid into the context.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public requestIdHandler = (_: Request, __: Response, next: NextFunction): void => {
    httpContext.set('requestId', uuidv4());
    next();
  };

  /**
   * The http context middleware to be called right before the next handler that needs to
   * retrieve information from it.
   */
  public httpContextMiddleware = httpContext.middleware;

  /**
   * Retrieve the injected request id.
   *
   * @returns The injected request id retrieved from the http context.
   */
  public getRequestIdContext(): string | null {
    const requestId: unknown = httpContext.get('requestId');
    if (requestId) {
      return String(requestId);
    }
    return null;
  }

  /**
   * Attach metadata to the request.
   *
   * @param {TransformableInfo} info The information about the request that was made.
   * @returns The `attachMetadata` function returns a `TransformableInfo` object.
   */
  private attachMetadata(info: TransformableInfo): TransformableInfo {
    info.requestId = this.getRequestIdContext();
    // Add extra metadata from the config
    info.environment = this.config.environment;
    info.version = this.config.version;
    return info;
  }

  /* istanbul ignore next */
  private injectMetadata(): Format {
    return format((info) => this.attachMetadata(info))();
  }

  /* istanbul ignore next */
  private serializeError(error: Error): {
    message: string;
    name: string;
    stack: string[] | null;
    cause?: Error | undefined;
  } {
    const { stack, message, name } = error;
    const serializedStack = !!stack ? stack.split('/n') : null;
    return {
      ...error,
      message,
      name,
      stack: serializedStack,
    };
  }

  /* istanbul ignore next */
  private injectErrors(): Format {
    return format((info) => {
      if (info.level === 'error' && info.error) {
        info.error = this.serializeError(info.error as Error);
      }
      return info;
    })();
  }

  private formatMessage(message: string | Record<string, unknown>): string {
    if (message instanceof Object) {
      return jsonStringify(message);
    }
    return message;
  }

  /**
   * Retrieve a custom log formatted entry.
   *
   * @param info The information about the log entry.
   * @returns The pretty formatted log information.
   */
  private formatLog(info: TransformableInfo): string {
    // Collect all fields independently, ignore meta and stringify the rest
    this.attachMetadata(info);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { environment, level, label, timestamp, message, meta, splat, ...rest } = info;
    return `[${environment}] ${level}: [${label}] ${this.formatMessage(message)} ${jsonStringify(
      rest,
    )}`;
  }

  /**
   * Returns a new instance of the LogStash Format that turns a log
   * `info` object into pure JSON with the appropriate logstash options.
   */
  public formatLogstash(): Format {
    return logformFormat((info) => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const logstash: { '@fields'?: unknown; '@message'?: string; '@timestamp'?: unknown } = {};
      this.attachMetadata(info);
      const { message, timestamp, ...rest } = info;
      info = rest as TransformableInfo;
      if (message) {
        logstash['@message'] = this.formatMessage(message);
      }
      if (timestamp) {
        logstash['@timestamp'] = timestamp;
      }
      logstash['@fields'] = rest;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      info[MESSAGE] = jsonStringify(logstash);
      return info;
    })();
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
      consoleTransport.format = format.combine(format.timestamp(), this.formatLogstash());
      logTransporters.push(consoleTransport);
    } else {
      // Default formats
      consoleTransport.format = format.combine(
        format.colorize(),
        format.printf((info) => this.formatLog(info)),
      );
      logTransporters.push(consoleTransport);
    }

    return createLogger({
      level: this.config.logLevel,
      levels: config.npm.levels,
      // Global formats
      format: format.combine(
        this.injectMetadata(),
        this.injectErrors(),
        format.label({ label: this.config.label }),
      ),
      transports: logTransporters,
    });
  }

  /**
   * Redact sensitive information in the request, e.g. the JWT in the Authorization header.
   *
   * @param req The request object.
   * @param {string} propertyName The name of the property to sanitize.
   * @returns The request object with the headers redacted.
   */
  private sanitizeRequest(
    req: expressWinston.FilterRequest,
    propertyName: string,
  ): expressWinston.FilterRequest {
    if (propertyName === 'headers') {
      // The 'if-none-match' header can break logstash JSON format.
      if ('if-none-match' in req.headers) req.headers['if-none-match'] = 'EXCLUDED';
      // The 'authorization' header has the plaintext jwt, we should never log it.
      if (req.headers.authorization) req.headers.authorization = 'Bearer [REDACTED]';
      // The 'cookie' headers could contain jwt's.
      if (req.headers.cookie) {
        const cookies = req.headers.cookie.split('; ');
        req.headers.cookie = cookies
          .map((cookie: string) => {
            if (cookie.startsWith('AccessToken=')) {
              return 'AccessToken=REDACTED';
            }
            if (cookie.startsWith('RefreshToken=')) {
              return 'RefreshToken=REDACTED';
            }
            return cookie;
          })
          .join('; ');
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (req as any)[propertyName] as expressWinston.FilterRequest;
  }

  /**
   * It takes the response object and a property name, and if the property name is `body`, it will
   * sanitizes the response body.
   *
   * @param res The response object that is being logged.
   * @param {string} propertyName The name of the property to sanitize.
   * @param options The express-winston logger options.
   * @returns The response object.
   */
  private sanitizeResponse(
    res: expressWinston.FilterResponse,
    propertyName: string,
    options: expressWinston.BaseLoggerOptions,
  ): expressWinston.FilterResponse {
    if (propertyName === 'body') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      res['body'] = this.bodySanitizer({ ...res['body'] }, options.bodyBlacklist);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (res as any)[propertyName] as expressWinston.FilterResponse;
  }

  /**
   * Redacts blacklisted body properties from the request / response body.
   *
   * @param body The express-winston request / response body.
   * @param bodyBlacklist The express-winston body blacklist.
   * @returns The sanitized 'body'.
   */
  private bodySanitizer(
    body: Record<string, unknown> | undefined,
    bodyBlacklist: string[] | undefined,
  ): Record<string, unknown> | undefined {
    /* istanbul ignore else: else path does not matter */
    if (body && bodyBlacklist) {
      for (const key of bodyBlacklist) {
        if (body && body[key]) {
          body[key] = 'REDACTED';
        }
      }
    }
    return body;
  }

  /**
   * Create express winston logger handler middleware.
   *
   * @param options The express-winston logger options.
   * @returns The express winston logger handler that serves as middleware.
   */
  public createHandler(options: expressWinston.BaseLoggerOptions): Handler {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return expressWinston.logger({
      expressFormat: false,
      ignoreRoute: /* istanbul ignore next */ () => false,
      meta: true,
      metaField: 'express',
      msg: '{{req.method}} {{req.url}}',
      requestFilter: /* istanbul ignore next */ (
        req: expressWinston.FilterRequest,
        propertyName: string,
      ) => this.sanitizeRequest(req, propertyName),
      responseFilter: /* istanbul ignore next */ (
        res: expressWinston.FilterResponse,
        propertyName: string,
      ) => this.sanitizeResponse(res, propertyName, options),
      ...options,
      winstonInstance: this.logger,
    });
  }
}
/* eslint-enable @typescript-eslint/no-unsafe-call */
/* eslint-enable @typescript-eslint/no-unsafe-assignment */
