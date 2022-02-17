import type * as grpc from '@grpc/grpc-js';
import GrpcBoom from 'grpc-boom';

import { HealthCheckRequest__Output as HealthCheckRequest } from './proto/grpc/health/v1/HealthCheckRequest';
import {
  _grpc_health_v1_HealthCheckResponse_ServingStatus as ServingStatus,
  HealthCheckResponse,
} from './proto/grpc/health/v1/HealthCheckResponse';

export class GrpcHealthCheck {
  private watchStatusMap: { [key: string]: ServingStatus } = {};
  private watchErrorMap: { [key: string]: Error } = {};

  constructor(private statusMap: { [key: string]: ServingStatus }) {}

  private setStatus(service: string, status: ServingStatus): void {
    this.statusMap[service] = status;
  }

  check(
    call: grpc.ServerUnaryCall<HealthCheckRequest, HealthCheckResponse>,
    callback: (error?: grpc.ServiceError, result?: HealthCheckResponse) => void,
  ): void {
    const service: string = call.request.service;
    const status: number = this.statusMap[service];
    if (!status) {
      callback(GrpcBoom.notFound(`Unknown service: ${service}`), undefined);
    } else {
      callback(undefined, { status });
    }
  }

  watch(call: grpc.ServerWritableStream<HealthCheckRequest, HealthCheckResponse | Error>): void {
    const service: string = call.request.service;
    // tslint:disable no-console
    const interval = setInterval(() => {
      // Updated status is used for getting service status updates.
      let updatedStatus = ServingStatus.SERVING;
      if (!this.statusMap[service]) {
        // Set the initial status
        updatedStatus = ServingStatus.SERVICE_UNKNOWN;
        this.setStatus(service, updatedStatus);
        call.write({ status: updatedStatus });
      }
      // Add to the watch status map
      this.watchStatusMap[service] = updatedStatus;
      if (!this.watchErrorMap[service]) {
        const lastStatus = this.statusMap[service] || -1;
        if (lastStatus !== updatedStatus) {
          // Status has changed
          this.setStatus(service, updatedStatus);
          call.write({ status: updatedStatus }, (error?: Error) => {
            if (error) {
              // Terminate stream on next tick
              this.watchErrorMap[service] = error;
            }
          });
        }
      } else {
        clearInterval(interval);
        // Terminate the stream
        call.end(this.watchErrorMap[service]);
      }
    }, 1000);
  }
}
