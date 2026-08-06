export enum ApiHttpErrorCode {
  UNAUTHORIZED_401 = "UNAUTHORIZED_401",
  NOT_FOUND_404 = "NOT_FOUND_404",
  VALIDATION_422 = "VALIDATION_422",
  SERVER_ERROR_500 = "SERVER_ERROR_500",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN = "UNKNOWN",
}

export enum BusinessErrorCode {
  HOURS_PACKAGE_EXCEEDED = "HOURS_PACKAGE_EXCEEDED",
  INSTITUTION_BLOCKED = "INSTITUTION_BLOCKED",
  TICKET_ALREADY_CLOSED = "TICKET_ALREADY_CLOSED",
  ENVIRONMENT_UNREACHABLE = "ENVIRONMENT_UNREACHABLE",
}

export const DEFAULT_ERROR_MESSAGES: Record<ApiHttpErrorCode, string> = {
  [ApiHttpErrorCode.UNAUTHORIZED_401]: "Login ou senha inválido",
  [ApiHttpErrorCode.NOT_FOUND_404]: "Não encontramos o que você procurava",
  [ApiHttpErrorCode.VALIDATION_422]: "Verifique os dados informados",
  [ApiHttpErrorCode.SERVER_ERROR_500]: "Algo deu errado. Tente novamente em instantes",
  [ApiHttpErrorCode.NETWORK_ERROR]: "Sem conexão com o servidor. Verifique sua internet",
  [ApiHttpErrorCode.UNKNOWN]: "Ocorreu um erro inesperado",
};

export const BUSINESS_ERROR_MESSAGES: Record<BusinessErrorCode, string> = {
  [BusinessErrorCode.HOURS_PACKAGE_EXCEEDED]:
    "Seu pacote de horas de suporte deste mês foi totalmente consumido. Fale com o time comercial para ampliar o pacote.",
  [BusinessErrorCode.INSTITUTION_BLOCKED]:
    "Sua instituição está com o acesso bloqueado. Entre em contato com o suporte.",
  [BusinessErrorCode.TICKET_ALREADY_CLOSED]:
    "Este chamado já está encerrado e não pode ser alterado.",
  [BusinessErrorCode.ENVIRONMENT_UNREACHABLE]:
    "Não foi possível conectar ao ambiente selecionado. Verifique o endereço informado.",
};
