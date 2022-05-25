import { IsArray, IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import {
  BaseLoggerOptions,
  DynamicLevelFunction,
  DynamicMetaFunction,
  MessageTemplate,
  RequestFilter,
  ResponseFilter,
  RouteFilter,
  StatusLevels,
} from 'express-winston';
import { Format } from 'logform';

export class RequestLoggingConfig implements BaseLoggerOptions {
  @IsObject()
  @IsOptional()
  readonly baseMeta?: object;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  readonly bodyBlacklist: string[] = ['accessToken', 'password', 'refreshToken', 'token'];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  readonly bodyWhitelist?: string[];

  @IsBoolean()
  @IsOptional()
  readonly colorize = false;

  @IsOptional()
  readonly dynamicMeta?: DynamicMetaFunction;

  @IsBoolean()
  @IsOptional()
  readonly expressFormat = true;

  @IsOptional()
  readonly format?: Format;

  @IsOptional()
  readonly ignoreRoute: RouteFilter = /* istanbul ignore next */ (): boolean => false;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  readonly ignoredRoutes?: string[];

  @IsOptional()
  readonly level?: string | DynamicLevelFunction;

  @IsBoolean()
  @IsOptional()
  readonly meta = true;

  @IsString()
  @IsOptional()
  readonly metaField = 'express';

  @IsString()
  @IsOptional()
  readonly requestField?: string | null;

  @IsString()
  @IsOptional()
  readonly responseField?: string | null;

  @IsString()
  @IsOptional()
  readonly msg: MessageTemplate = '{{req.method}} {{req.url}}';

  @IsOptional()
  readonly requestFilter?: RequestFilter;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  readonly requestWhitelist: string[] = ['body', 'headers', 'method', 'params', 'query', 'url'];

  @IsOptional()
  readonly responseFilter?: ResponseFilter;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  readonly responseWhitelist: string[] = ['body', 'headers', 'statusCode'];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  readonly headerBlacklist: string[] = ['cookie', 'token'];

  @IsOptional()
  readonly skip?: RouteFilter;

  @IsOptional()
  readonly statusLevels: boolean | StatusLevels = true;

  @IsBoolean()
  @IsOptional()
  readonly allowFilterOutWhitelistedRequestBody?: boolean;
}
