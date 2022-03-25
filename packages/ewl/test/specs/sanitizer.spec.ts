import * as expressWinston from 'express-winston';

import { sanitizeRequest, sanitizeResponse } from '../../src/sanitizer';

const expressWinstonLoggerMock = jest.fn().mockReturnThis();
jest.mock('express-winston', () => ({
  logger: (options: expressWinston.BaseLoggerOptions): unknown => expressWinstonLoggerMock(options),
}));

describe('Sanitizer', () => {
  describe('requestFilter', () => {
    const req = {
      headers: {
        authorization: 'Bearer SOME-JWT',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'if-none-match': 'SOME-VALUE',
        cookie: 'AccessToken=Secret; RefreshToken=Secret; OtherCookie=NoSecret',
      },
      fake: { param: 'isFake' },
    } as unknown as expressWinston.FilterRequest;

    test('should redact headers correctly', () => {
      expect(sanitizeRequest(req, 'headers')).toEqual({
        authorization: 'Bearer [REDACTED]',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'if-none-match': 'EXCLUDED',
        cookie: 'AccessToken=REDACTED; RefreshToken=REDACTED; OtherCookie=NoSecret',
      });
    });

    test('should return other properties unaltered', () => {
      expect(sanitizeRequest(req, 'fake')).toEqual(req.fake);
    });

    test('should not alter other headers', () => {
      expect(
        sanitizeRequest(
          { headers: { test: '1' } } as unknown as expressWinston.FilterRequest,
          'headers',
        ),
      ).toEqual({ test: '1' });
    });
  });

  describe('responseFilter', () => {
    test('should skip an undefined body', () => {
      expect(
        sanitizeResponse({ body: undefined } as unknown as expressWinston.FilterResponse, 'body', {
          bodyBlacklist: ['sensitive'],
          colorize: true,
        }),
      ).toEqual({});
    });

    test('should not alter whitelisted properties', () => {
      expect(
        sanitizeResponse(
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
        sanitizeResponse(
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
        sanitizeResponse(
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
