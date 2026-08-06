export const appConfig = {
  apiTimeoutInMilliseconds: 15000,
  isMockApiEnabled: true,
  sessionDurationInMilliseconds: 8 * 60 * 60 * 1000,
  simulatedLoginDelayInMilliseconds: 900,
  simulatedRequestDelayInMilliseconds: 500,
  simulatedTicketCreationDelayInMilliseconds: 900,
  supportUrl:
    "https://api.whatsapp.com/send/?phone=558581902506&text=Ol%C3%A1%252C+pode+me+ajudar%253F&type=phone_number&app_absent=0",
} as const;
