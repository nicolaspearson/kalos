import * as expressWinston from 'express-winston';

import { LogLevel } from '$/config';
import { Ewl } from '$/index';

const expressWinstonLoggerMock = jest.fn().mockReturnThis();
jest.mock('express-winston', () => ({
  logger: (options: expressWinston.BaseLoggerOptions): unknown => expressWinstonLoggerMock(options),
}));

describe('EWL', () => {
  let ewl: Ewl;

  beforeAll(() => {
    ewl = new Ewl();
  });

  beforeEach(jest.clearAllMocks);

  describe('constructor', () => {
    test('throws if invalid options are provided', () => {
      const options = {
        attachRequestId: true,
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

    test('should proxy log correctly', () => {
      jest.spyOn(ewl.logger, 'log');
      ewl.log('log message');
      expect(ewl.logger.log).toBeCalledWith('info', 'log message', { context: undefined });
    });

    test('should proxy error correctly', () => {
      jest.spyOn(ewl.logger, 'error');
      ewl.error('error message');
      expect(ewl.logger.error).toBeCalledWith('error message', {
        context: undefined,
        trace: undefined,
      });
    });

    test('should proxy warn correctly', () => {
      jest.spyOn(ewl.logger, 'warn');
      ewl.warn('warn message');
      expect(ewl.logger.warn).toBeCalledWith('warn message', { context: undefined });
    });

    test('should proxy debug correctly', () => {
      jest.spyOn(ewl.logger, 'debug');
      ewl.debug('debug message');
      expect(ewl.logger.debug).toBeCalledWith('debug message', { context: undefined });
    });

    test('should proxy verbose correctly', () => {
      jest.spyOn(ewl.logger, 'verbose');
      ewl.verbose('verbose message');
      expect(ewl.logger.verbose).toBeCalledWith('verbose message', { context: undefined });
    });
  });

  describe('createHandler', () => {
    test('should be created correctly', () => {
      ewl.createHandler({
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

  describe('getRequestIdHandler', () => {
    test('should retrieve the request id handler correctly', () => {
      expect(ewl.getRequestIdHandler()).toBeDefined();
    });
  });
});
