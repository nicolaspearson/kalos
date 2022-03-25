import * as expressWinston from 'express-winston';

import { LogLevel } from '$/config';
import { injectErrors, logstashFormatter } from '$/formatter';
import { Ewl } from '$/index';

const expressWinstonLoggerMock = jest.fn().mockReturnThis();
jest.mock('express-winston', () => ({
  logger: (options: expressWinston.BaseLoggerOptions): unknown => expressWinstonLoggerMock(options),
}));

describe('Formatter', () => {
  describe('injectErrors', () => {
    test('should format an error correctly', () => {
      const expectedPrintfFormat = {
        error: expect.objectContaining({ message: 'Simulated error' }),
        level: 'error',
        [Symbol('message')]:
          '{"@fields":{"level":"error"},"@message":"error-test","@timestamp":"2021-05-18T19:32:31.495Z"}',
      };
      expect(
        injectErrors().transform({
          error: new Error('Simulated error'),
          level: 'error',
          message: 'error-test',
          timestamp: '2021-05-18T19:32:31.495Z',
        }),
      ).toMatchObject(expectedPrintfFormat);
    });

    test('should format an error without a stack correctly', () => {
      const expectedPrintfFormat = {
        error: expect.objectContaining({ message: 'Simulated error' }),
        level: 'error',
        [Symbol('message')]:
          '{"@fields":{"level":"error"},"@message":"error-test","@timestamp":"2021-05-18T19:32:31.495Z"}',
      };
      expect(
        injectErrors().transform({
          error: { message: 'Simulated error' },
          level: 'error',
          message: 'error-test',
          timestamp: '2021-05-18T19:32:31.495Z',
        }),
      ).toMatchObject(expectedPrintfFormat);
    });
  });

  describe('logstashFormatter', () => {
    let ewl: Ewl;

    beforeAll(() => {
      const options = {
        attachRequestId: true,
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
        logstashFormatter(ewl.config).transform({
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
        logstashFormatter(ewl.config).transform({
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
        logstashFormatter(ewl.config).transform({ level: 'info', message: undefined as any }),
      ).toMatchObject(expectedPrintfFormat);
    });
  });
});
