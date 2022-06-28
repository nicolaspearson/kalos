import { Format, TransformableInfo, format as logformFormat } from 'logform';
import jsonStringify from 'safe-stable-stringify';
import { MESSAGE } from 'triple-beam';
import { format } from 'winston';

import { storage } from './async-storage';
import { Config } from './config';

type LogMessage = string | Record<string, unknown>;

function attachMetadata(config: Config, info: TransformableInfo): TransformableInfo {
  info.environment = config.environment;
  info.version = config.version;
  if (!info.requestId) {
    const store = storage.getStore();
    info.requestId = store?.get(config.label)?.requestId;
  }
  return info;
}

export function injectMetadata(config: Config): Format {
  return format((info: TransformableInfo) => attachMetadata(config, info))();
}

function attachError(error: Error): {
  message: string;
  name: string;
  stack: string[] | null;
  cause?: Error | undefined;
} {
  const { stack, message, name } = error;
  return {
    ...error,
    message,
    name,
    stack: !!stack ? stack.split('/n') : null,
  };
}

export function injectErrors(): Format {
  return format((info) => {
    if (info.level === 'error' && info.error) {
      info.error = attachError(info.error as Error);
    }
    return info;
  })();
}

function attachMessage(message: LogMessage): string {
  if (message instanceof Object) {
    return jsonStringify(message);
  }
  return message;
}

export function defaultFormatter(config: Config, info: TransformableInfo): string {
  attachMetadata(config, info);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { environment, level, label, timestamp, message, meta, splat, ...rest } = info;
  return `[${environment}] ${level}: [${label}] ${attachMessage(
    message as LogMessage,
  )} ${jsonStringify(rest)}`;
}

/**
 * Returns a new instance of the LogStash Format that turns a log
 * `info` object into pure JSON with the appropriate logstash options.
 */
export function logstashFormatter(config: Config): Format {
  return logformFormat((info) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const logstash: { '@fields'?: unknown; '@message'?: string; '@timestamp'?: unknown } = {};
    attachMetadata(config, info);
    const { message, timestamp, ...rest } = info;
    info = rest as TransformableInfo;
    if (message) {
      logstash['@message'] = attachMessage(message as LogMessage);
    }
    if (timestamp) {
      logstash['@timestamp'] = timestamp;
    }
    logstash['@fields'] = rest;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    info[MESSAGE] = jsonStringify(logstash);
    return info;
  })();
}
