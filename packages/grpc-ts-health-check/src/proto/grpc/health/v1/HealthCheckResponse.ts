// Original file: src/proto/health.proto


// Original file: src/proto/health.proto

export enum _grpc_health_v1_HealthCheckResponse_ServingStatus {
  UNKNOWN = 0,
  SERVING = 1,
  NOT_SERVING = 2,
  SERVICE_UNKNOWN = 3,
}

export interface HealthCheckResponse {
  'status'?: (_grpc_health_v1_HealthCheckResponse_ServingStatus | keyof typeof _grpc_health_v1_HealthCheckResponse_ServingStatus);
}

export interface HealthCheckResponse__Output {
  'status': (keyof typeof _grpc_health_v1_HealthCheckResponse_ServingStatus);
}
