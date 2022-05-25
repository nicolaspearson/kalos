import { Request, Response } from 'express';
import * as expressWinston from 'express-winston';
import { v4 as uuidv4 } from 'uuid';

import { LogLevel } from '../../src/config';
import { Ewl } from '../../src/index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const uuidv4Mock: typeof uuidv4 & jest.Mock = uuidv4 as any;
jest.mock('uuid');

const requestId = '75e10ee1-6c92-4c58-b639-8a5875da1820';

const expressWinstonLoggerMock = jest.fn().mockReturnThis();
jest.mock('express-winston', () => ({
  logger: (options: expressWinston.BaseLoggerOptions): unknown => expressWinstonLoggerMock(options),
}));

describe('EWL', () => {
  let ewl: Ewl;

  beforeAll(() => {
    ewl = new Ewl({
      environment: 'development',
      label: 'app',
      logLevel: 'debug' as LogLevel,
      requestLoggingOptions: {
        colorize: true,
      },
      useLogstashFormat: false,
      version: 'unknown',
    });
  });

  beforeEach(jest.clearAllMocks);

  describe('constructor', () => {
    test('throws if invalid options are provided', () => {
      const options = {
        environment: 'development',
        label: 'app',
        logLevel: 'not-valid' as LogLevel,
        useLogstashFormat: false,
        version: 'unknown',
      };
      expect(() => new Ewl(options)).toThrowError();
    });
  });

  describe('logging', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should proxy debug correctly', () => {
      jest.spyOn(ewl.logger, 'debug');
      ewl.debug('debug message');
      expect(ewl.logger.debug).toBeCalledWith('debug message', { context: undefined });
    });

    test('should proxy error correctly', () => {
      jest.spyOn(ewl.logger, 'error');
      ewl.error('error message');
      expect(ewl.logger.error).toBeCalledWith('error message', {
        context: undefined,
        trace: undefined,
      });
    });

    test('should proxy info correctly', () => {
      jest.spyOn(ewl.logger, 'info');
      ewl.info('info message');
      expect(ewl.logger.info).toBeCalledWith('info message', { context: undefined });
    });

    test('should proxy log correctly', () => {
      jest.spyOn(ewl.logger, 'log');
      ewl.log('log message');
      expect(ewl.logger.log).toBeCalledWith('info', 'log message', { context: undefined });
    });

    test('should proxy verbose correctly', () => {
      jest.spyOn(ewl.logger, 'verbose');
      ewl.verbose('verbose message');
      expect(ewl.logger.verbose).toBeCalledWith('verbose message', { context: undefined });
    });

    test('should proxy warn correctly', () => {
      jest.spyOn(ewl.logger, 'warn');
      ewl.warn('warn message');
      expect(ewl.logger.warn).toBeCalledWith('warn message', { context: undefined });
    });
  });

  describe('createRequestMiddleware', () => {
    test('should be created correctly', () => {
      ewl.createRequestMiddleware({
        bodyBlacklist: ['sensitive'],
        colorize: true,
      });
      expect(expressWinstonLoggerMock).toHaveBeenCalledTimes(1);
      // expect(expressWinstonLoggerMock).toHaveBeenCalledWith({
      //   bodyBlacklist: ['sensitive'],
      //   colorize: true,
      //   expressFormat: false,
      //   ignoreRoute: () => false,
      //   meta: true,
      //   metaField: 'express',
      //   msg: '{{req.method}} {{req.url}}',
      //   winstonInstance: ewl.logger,
      // });
    });
  });

  describe('contextMiddleware', () => {
    test('should set the request id correctly via the context middleware', () => {
      uuidv4Mock.mockImplementation(jest.fn(() => requestId));
      const nextMock = jest.fn();
      ewl.contextMiddleware({} as Request, {} as Response, nextMock);
      expect(nextMock).toBeCalledTimes(1);
    });
  });
});
