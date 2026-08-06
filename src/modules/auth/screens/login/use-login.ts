import { useState } from "react";
import { EnvironmentType } from "@core/enums/environment-type";
import { useAuth } from "@core/contexts/auth";
import { AppApiError } from "@core/services/api/app-api-error";
import { ApiHttpErrorCode } from "@core/enums/api-error-code";

interface IUseLoginParams {
  environment: EnvironmentType;
}

export function useLogin({ environment }: IUseLoginParams) {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string>();

  async function handleLoginSubmit() {
    setLoginErrorMessage(undefined);
    setIsSubmitting(true);

    try {
      await login({ username, password, environment });
    } catch (error) {
      if (error instanceof AppApiError && error.httpCode === ApiHttpErrorCode.UNAUTHORIZED_401) {
        setLoginErrorMessage("Login ou senha inválido");
      } else if (error instanceof AppApiError) {
        setLoginErrorMessage(error.message);
      } else {
        setLoginErrorMessage("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    username,
    setUsername,
    password,
    setPassword,
    isSubmitting,
    loginErrorMessage,
    handleLoginSubmit,
    isSubmitDisabled: !username.trim() || !password.trim(),
  };
}
