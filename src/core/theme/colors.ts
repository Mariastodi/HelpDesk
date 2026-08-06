export const colors = {
  brand: {
    primary: "#A31E24",
    primaryPressed: "#8A181D",
  },
  background: {
    screen: "#FFFFFF",
    subtle: "#F5F5F5",
  },
  text: {
    primary: "#1A1A1A",
    secondary: "#6B6B6B",
    onPrimary: "#FFFFFF",
    error: "#D32F2F",
  },
  border: {
    default: "#E0E0E0",
  },
  status: {
    aguardandoAnalise: "#2F80ED",
    aguardandoAtendimento: "#F2994A",
    emValidacao: "#27AE60",
    encerrado: "#4F4F4F",
    prazoOk: "#27AE60",
    prazoProximo: "#F2C94C",
    prazoVencido: "#EB5757",
  },
} as const;

export type AppColors = typeof colors;
