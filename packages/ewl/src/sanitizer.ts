import * as expressWinston from 'express-winston';

/**
 * Redacts blacklisted body properties from the request / response body.
 *
 * @param body The express-winston request / response body.
 * @param bodyBlacklist The express-winston body blacklist.
 * @returns The sanitized 'body'.
 */
function bodySanitizer(
  body: Record<string, unknown> | undefined,
  bodyBlacklist: string[] | undefined,
): Record<string, unknown> | undefined {
  if (body && bodyBlacklist) {
    for (const key of bodyBlacklist) {
      if (body && body[key]) {
        body[key] = '[REDACTED]';
      }
    }
  }
  return body;
}

/**
 * Redact sensitive information in the request, e.g. the JWT in the Authorization header.
 *
 * @param req The request object.
 * @param {string} propertyName The name of the property to sanitize.
 * @returns The request object with the headers redacted.
 */
export function sanitizeRequest(
  req: expressWinston.FilterRequest,
  propertyName: string,
  options: expressWinston.BaseLoggerOptions,
): expressWinston.FilterRequest {
  if (propertyName === 'body') {
    req['body'] = bodySanitizer(req['body'] as Record<string, unknown>, options.bodyBlacklist);
  }
  if (propertyName === 'headers') {
    // The 'if-none-match' header can break logstash JSON format.
    if ('if-none-match' in req.headers) req.headers['if-none-match'] = '[EXCLUDED]';
    // The 'authorization' header has the plaintext jwt, we should never log it.
    if (req.headers.authorization) req.headers.authorization = 'Bearer [REDACTED]';
    // The 'cookie' headers could contain jwt's.
    if (req.headers.cookie) {
      const cookies = req.headers.cookie.split('; ');
      req.headers.cookie = cookies
        .map((cookie: string) => {
          if (cookie.startsWith('AccessToken=')) {
            return 'AccessToken=[REDACTED]';
          }
          if (cookie.startsWith('RefreshToken=')) {
            return 'RefreshToken=[REDACTED]';
          }
          return cookie;
        })
        .join('; ');
    }
  }
  return (req[propertyName] || {}) as expressWinston.FilterRequest;
}

/**
 * Redact sensitive information in the response, e.g. a token in the response body.
 *
 * @param res The response object that is being logged.
 * @param {string} propertyName The name of the property to sanitize.
 * @param options The express-winston logger options.
 * @returns The response object.
 */
export function sanitizeResponse(
  res: expressWinston.FilterResponse,
  propertyName: string,
  options: expressWinston.BaseLoggerOptions,
): expressWinston.FilterResponse {
  if (propertyName === 'body') {
    res['body'] = bodySanitizer(res['body'] as Record<string, unknown>, options.bodyBlacklist);
  }
  return (res[propertyName] || {}) as expressWinston.FilterResponse;
}
