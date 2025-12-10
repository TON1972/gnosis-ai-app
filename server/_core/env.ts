export const ENV = {
  // Manus OAuth
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  
  // Database
  databaseUrl: process.env.DATABASE_URL ?? "",
  
  // Environment
  isProduction: process.env.NODE_ENV === "production",
  
  // OpenAI (para as ferramentas de IA)
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  
  // Mercado Pago
  mercadoPagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "",
  
  // Forge API
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  
  // OAuth Google & Facebook
  googleClientId: process.env.ID_DO_CLIENTE_DO_GOOGLE ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  facebookClientId: process.env.ID_DO_CLIENTE_DO_FACEBOOK ?? "",
  facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
};

