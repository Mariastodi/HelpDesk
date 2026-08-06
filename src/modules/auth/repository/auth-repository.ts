import { AxiosInstance } from "axios";
import { EnvironmentType } from "@core/enums/environment-type";
import { ApiHttpErrorCode } from "@core/enums/api-error-code";
import { AppApiError } from "@core/services/api/app-api-error";
import { DataLoggedUser } from "@core/contexts/auth/auth-context-type";
import { appConfig } from "@core/config/app-config";

interface ILoginParams {
  username: string;
  password: string;
  environment: EnvironmentType;
}

interface ILoginResponseBody {
  codUser: number;
  userName: string;
  jwtToken: string;
}

export async function loginRequest(
  apiClient: AxiosInstance,
  loginPayload: ILoginParams,
): Promise<DataLoggedUser> {
  if (appConfig.isMockApiEnabled) {
    return mockLoginRequest(loginPayload);
  }

  const { data: loginResponsePayload } = await apiClient.post<ILoginResponseBody>("/auth/login", {
    usuario: loginPayload.username,
    senha: loginPayload.password,
    ambiente: loginPayload.environment,
  });

  return {
    codUser: loginResponsePayload.codUser,
    userName: loginResponsePayload.userName,
    userLogin: loginPayload.username,
    jwtToken: loginResponsePayload.jwtToken,
    environment: loginPayload.environment,
    sessionExpiresAt: Date.now() + appConfig.sessionDurationInMilliseconds,
  };
}

function mockLoginRequest({
  username,
  password,
  environment,
}: ILoginParams): Promise<DataLoggedUser> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!username || !password) {
        reject(new AppApiError({ httpCode: ApiHttpErrorCode.VALIDATION_422 }));
        return;
      }

      if (password !== "1234") {
        reject(new AppApiError({ httpCode: ApiHttpErrorCode.UNAUTHORIZED_401 }));
        return;
      }

      resolve({
        codUser: 1,
        userName: "Maria Santos",
        userLogin: username,
        jwtToken: "mock.jwt.token",
        environment,
        sessionExpiresAt: Date.now() + appConfig.sessionDurationInMilliseconds,
      });
    }, appConfig.simulatedLoginDelayInMilliseconds);
  });
}
