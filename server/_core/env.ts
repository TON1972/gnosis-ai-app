export const ENV = {
  // Clerk Authentication
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
  clerkSecretKey: process.env.CLERK_SECRET_KEY ?? "",
  
  // Database
  databaseUrl: process.env.DATABASE_URL ?? "",
  
  // Legacy (manter por enquanto para compatibilidade)
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  
  // Environment
  isProduction: process.env.NODE_ENV === "production",
  
  // OpenAI (para as ferramentas de IA)
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  
  // Mercado Pago
  mercadoPagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "",
  
  // Forge API (manter para compatibilidade)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};

