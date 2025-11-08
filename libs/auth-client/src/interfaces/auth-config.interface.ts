const Kind = {
  access_token: 'access_token',
  id_token: 'id_token',
} as const;

export type Kind = typeof Kind[keyof typeof Kind];

export interface AuthTokenConfig {
  url: string;
  userkey: string;
  key: string;
  kind?: Kind;
}