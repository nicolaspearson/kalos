import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { getRequestIdContext, requestIdHandler } from '$/request-id';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const uuidv4Mock: typeof uuidv4 & jest.Mock = uuidv4 as any;

const requestId = '75e10ee1-6c92-4c58-b639-8a5875da1820';

const httpContextGetMock = jest.fn().mockReturnValue(requestId);
const httpContextSetMock = jest.fn().mockReturnValue(undefined);
jest.mock('express-http-context', () => ({
  get: (key: string): unknown => httpContextGetMock(key) as unknown,
  set: (key: string, value: string): unknown => httpContextSetMock(key, value) as unknown,
}));

jest.mock('uuid');

describe('Request ID', () => {
  beforeEach(jest.clearAllMocks);

  describe('getRequestIdContext', () => {
    test('should return the correct request id', () => {
      httpContextGetMock.mockReturnValueOnce(requestId);
      expect(requestId).toBe(getRequestIdContext());
      expect(httpContextGetMock).toBeCalledWith('requestId');
      expect(httpContextGetMock).toBeCalledTimes(1);
    });

    test('should return null if the request id is not set', () => {
      httpContextGetMock.mockReturnValueOnce(undefined);
      expect(getRequestIdContext()).toBeNull();
      expect(httpContextGetMock).toBeCalledWith('requestId');
    });
  });

  describe('requestIdHandler', () => {
    test('should set the request id correctly via the handler', () => {
      uuidv4Mock.mockImplementation(jest.fn(() => requestId));
      const nextMock = jest.fn();
      requestIdHandler({} as Request, {} as Response, nextMock);
      expect(httpContextSetMock).toBeCalledWith('requestId', requestId);
      expect(nextMock).toBeCalledWith();
    });
  });
});
