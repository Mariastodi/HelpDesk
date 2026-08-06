import {
  ApiHttpErrorCode,
  BusinessErrorCode,
  BUSINESS_ERROR_MESSAGES,
  DEFAULT_ERROR_MESSAGES,
} from "@core/enums/api-error-code";

interface IAppApiErrorParams {
  httpCode: ApiHttpErrorCode;
  businessCode?: BusinessErrorCode;
  message?: string;
  statusCode?: number;
}

export class AppApiError extends Error {
  readonly httpCode: ApiHttpErrorCode;
  readonly businessCode?: BusinessErrorCode;
  readonly statusCode?: number;

  constructor({ httpCode, businessCode, message, statusCode }: IAppApiErrorParams) {
    const resolvedMessage =
      message ??
      (businessCode ? BUSINESS_ERROR_MESSAGES[businessCode] : DEFAULT_ERROR_MESSAGES[httpCode]);

    super(resolvedMessage);
    this.name = "AppApiError";
    this.httpCode = httpCode;
    this.businessCode = businessCode;
    this.statusCode = statusCode;
  }

  get isBusinessError(): boolean {
    return Boolean(this.businessCode);
  }

  get isAuthError(): boolean {
    return this.httpCode === ApiHttpErrorCode.UNAUTHORIZED_401;
  }
}
