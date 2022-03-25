import { Format, TransformableInfo, format as logformFormat } from 'logform';
import jsonStringify from 'safe-stable-stringify';
import { MESSAGE } from 'triple-beam';
import { format } from 'winston';

import { Config } from '$/config';
import { getRequestIdContext } from '$/request-id';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
function attachMetadata(config: Config, info: TransformableInfo): TransformableInfo {
  if (config.attachRequestId) {
    info.requestId = getRequestIdContext();
  }
  // Add extra metadata from the config
  info.environment = config.environment;
  info.version = config.version;
  return info;
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment */

export function injectMetadata(config: Config): Format {
  return format((info) => attachMetadata(config, info))();
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

function attachMessage(message: string | Record<string, unknown>): string {
  if (message instanceof Object) {
    return jsonStringify(message);
  }
  return message;
}

export function defaultFormatter(config: Config, info: TransformableInfo): string {
  // Collect all fields independently, ignore meta and stringify the rest
  attachMetadata(config, info);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { environment, level, label, timestamp, message, meta, splat, ...rest } = info;
  return `[${environment}] ${level}: [${label}] ${attachMessage(message)} ${jsonStringify(rest)}`;
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
      logstash['@message'] = attachMessage(message);
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
