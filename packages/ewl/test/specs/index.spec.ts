import { Request, Response } from 'express';
import * as expressWinston from 'express-winston';
import { v4 as uuidv4 } from 'uuid';

import { LogLevel } from '$/config';
import { Ewl } from '$/index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const uuidv4Mock: typeof uuidv4 & jest.Mock = uuidv4 as any;

const requestId = '75e10ee1-6c92-4c58-b639-8a5875da1820';

const httpContextGetMock = jest.fn().mockReturnValue(requestId);
const httpContextSetMock = jest.fn().mockReturnValue(undefined);
jest.mock('express-http-context', () => ({
  get: (key: string): unknown => httpContextGetMock(key) as unknown,
  set: (key: string, value: string): unknown => httpContextSetMock(key, value) as unknown,
}));

const expressWinstonLoggerMock = jest.fn().mockReturnThis();
jest.mock('express-winston', () => ({
  logger: (options: expressWinston.BaseLoggerOptions): unknown => expressWinstonLoggerMock(options),
}));

jest.mock('uuid');

describe('EWL', () => {
  describe('HttpContext', () => {
    let ewl: Ewl;

    beforeAll(() => {
      ewl = new Ewl();
    });

    beforeEach(jest.clearAllMocks);

    describe('getRequestIdContext', () => {
      test('should return the correct request id', () => {
        httpContextGetMock.mockReturnValueOnce(requestId);
        expect(requestId).toBe(ewl.getRequestIdContext());
        expect(httpContextGetMock).toBeCalledWith('requestId');
        expect(httpContextGetMock).toBeCalledTimes(1);
      });

      test('should return null if the request id is not set', () => {
        httpContextGetMock.mockReturnValueOnce(undefined);
        expect(ewl.getRequestIdContext()).toBeNull();
        expect(httpContextGetMock).toBeCalledWith('requestId');
      });
    });

    describe('requestIdHandler', () => {
      test('should set the request id correctly via the handler', () => {
        uuidv4Mock.mockImplementation(jest.fn(() => requestId));
        const nextMock = jest.fn();
        ewl.requestIdHandler({} as Request, {} as Response, nextMock);
        expect(httpContextSetMock).toBeCalledWith('requestId', requestId);
        expect(nextMock).toBeCalledWith();
      });
    });
  });

  describe('Logger', () => {
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

    describe('proxy', () => {
      let ewl: Ewl;

      beforeAll(() => {
        ewl = new Ewl();
      });

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

    describe('formatLogstash', () => {
      let ewl: Ewl;

      beforeAll(() => {
        const options = {
          environment: 'development',
          label: 'app',
          logLevel: 'log' as LogLevel,
          useLogstashFormat: true,
          version: 'unknown',
        };
        ewl = new Ewl(options);
      });

      test('should format a message string correctly', () => {
        const expectedPrintfFormat = {
          level: 'info',
          [Symbol('message')]:
            '{"@fields":{"level":"info"},"@message":"string-test","@timestamp":"2021-05-18T19:32:31.495Z"}',
        };
        expect(
          ewl.formatLogstash().transform({
            level: 'info',
            message: 'string-test',
            timestamp: '2021-05-18T19:32:31.495Z',
          }),
        ).toMatchObject(expectedPrintfFormat);
      });

      test('should format a message object correctly', () => {
        const expectedPrintfFormat = {
          level: 'info',
          [Symbol('message')]:
            '{"@fields":{"level":"info"},"@message":"{\\"description\\":\\"unit-test\\"}"}',
        };
        expect(
          ewl.formatLogstash().transform({
            level: 'info',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message: { description: 'unit-test' } as any,
          }),
        ).toMatchObject(expectedPrintfFormat);
      });

      test('should format correctly without a message', () => {
        const expectedPrintfFormat = {
          level: 'info',
          [Symbol('message')]: '{"@fields":{"level":"info"}}',
        };
        expect(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ewl.formatLogstash().transform({ level: 'info', message: undefined as any }),
        ).toMatchObject(expectedPrintfFormat);
      });
    });

    describe('createHandler', () => {
      let ewl: Ewl;

      beforeAll(() => {
        ewl = new Ewl();
      });

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

      describe('requestFilter', () => {
        const req = {
          headers: {
            authorization: 'Bearer SOME-JWT',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'if-none-match': 'W/"2da-0kj/eLumj9c7RIVAqQqLv+KH0h4"',
            cookie: 'AccessToken=Secret; RefreshToken=Secret; OtherCookie=NoSecret',
          },
          fake: { param: 'isFake' },
        } as unknown as expressWinston.FilterRequest;

        test('should redact headers correctly', () => {
          expect(ewl['sanitizeRequest'](req, 'headers')).toEqual({
            authorization: 'Bearer [REDACTED]',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'if-none-match': 'EXCLUDED',
            cookie: 'AccessToken=REDACTED; RefreshToken=REDACTED; OtherCookie=NoSecret',
          });
        });

        test('should return other properties unaltered', () => {
          expect(ewl['sanitizeRequest'](req, 'fake')).toEqual(req.fake);
        });

        test('should not alter other headers', () => {
          expect(
            ewl['sanitizeRequest'](
              { headers: { test: '1' } } as unknown as expressWinston.FilterRequest,
              'headers',
            ),
          ).toEqual({ test: '1' });
        });
      });

      describe('responseFilter', () => {
        test('should skip an undefined body', () => {
          expect(
            ewl['sanitizeResponse'](
              { body: undefined } as unknown as expressWinston.FilterResponse,
              'body',
              {
                bodyBlacklist: ['sensitive'],
                colorize: true,
              },
            ),
          ).toEqual({});
        });

        test('should not alter whitelisted properties', () => {
          expect(
            ewl['sanitizeResponse'](
              { body: { param: 'isFake' } } as unknown as expressWinston.FilterResponse,
              'body',
              {
                bodyBlacklist: ['sensitive'],
              },
            ),
          ).toEqual({
            param: 'isFake',
          });
        });

        test('should not alter headers', () => {
          expect(
            ewl['sanitizeResponse'](
              {
                headers: { sensitive: 'should not be redacted' },
              } as unknown as expressWinston.FilterResponse,
              'headers',
              {
                bodyBlacklist: ['sensitive'],
              },
            ),
          ).toEqual({
            sensitive: 'should not be redacted',
          });
        });

        test('should redact blacklisted properties', () => {
          expect(
            ewl['sanitizeResponse'](
              {
                body: { sensitive: 'should be redacted' },
              } as unknown as expressWinston.FilterResponse,
              'body',
              {
                bodyBlacklist: ['sensitive'],
              },
            ),
          ).toEqual({
            sensitive: 'REDACTED',
          });
        });
      });
    });
  });
});
