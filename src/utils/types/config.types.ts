export type AppConfig = {
  nodeEnv: string;
  name: string;
  description: string;
  version: string;
  apiPrefix: string;
  frontendDomain?: string;
  jwtSecret: string;
  tokenExpiresIn: string;
};

export type DatabaseConfig = {
  mongoUri?: string;
};

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
};
