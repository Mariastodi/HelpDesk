import axios, { AxiosError, AxiosInstance } from "axios";
import { EnvironmentType } from "@core/enums/environment-type";
import { ApiHttpErrorCode, BusinessErrorCode } from "@core/enums/api-error-code";
import { AppApiError } from "./app-api-error";
import { appConfig } from "@core/config/app-config";

const ENVIRONMENT_BASE_URL: Record<EnvironmentType, string> = {
  [EnvironmentType.DESENVOLVIMENTO]: "https://dev.api.gpmobile.example.com",
  [EnvironmentType.HOMOLOGACAO]: "https://hml.api.gpmobile.example.com",
  [EnvironmentType.OPERACAO]: "https://api.gpmobile.example.com",
};

interface IApiErrorResponseBody {
  message?: string;
  businessCode?: BusinessErrorCode;
}

function mapStatusToHttpErrorCode(status: number | undefined): ApiHttpErrorCode {
  switch (status) {
    case 401:
      return ApiHttpErrorCode.UNAUTHORIZED_401;
    case 404:
      return ApiHttpErrorCode.NOT_FOUND_404;
    case 422:
      return ApiHttpErrorCode.VALIDATION_422;
    case 500:
      return ApiHttpErrorCode.SERVER_ERROR_500;
    default:
      return ApiHttpErrorCode.UNKNOWN;
  }
}

export function createApiClient(environment: EnvironmentType, jwtToken?: string): AxiosInstance {
  const instance = axios.create({
    baseURL: ENVIRONMENT_BASE_URL[environment],
    timeout: appConfig.apiTimeoutInMilliseconds,
    headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : undefined,
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<IApiErrorResponseBody>) => {
      if (!error.response) {
        throw new AppApiError({ httpCode: ApiHttpErrorCode.NETWORK_ERROR });
      }

      const { status, data: errorResponseBody } = error.response;
      const httpCode = mapStatusToHttpErrorCode(status);

      throw new AppApiError({
        httpCode,
        statusCode: status,
        businessCode: errorResponseBody?.businessCode,
        message: errorResponseBody?.message,
      });
    },
  );

  return instance;
}
