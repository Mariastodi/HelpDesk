import { EnvironmentType } from "@core/enums/environment-type";

export interface DataLoggedUser {
  codUser: number;
  userName: string;
  userLogin: string;
  jwtToken: string;
  environment: EnvironmentType;
  sessionExpiresAt: number;
}

export interface IAuthContextValue {
  loggedUser: DataLoggedUser | null;
  isLogged: boolean;
  isRestoringSession: boolean;
  login: (loginPayload: {
    username: string;
    password: string;
    environment: EnvironmentType;
  }) => Promise<void>;
  logout: () => Promise<void>;
}
