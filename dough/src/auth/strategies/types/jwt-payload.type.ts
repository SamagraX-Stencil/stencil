export type JwtPayloadType = Pick<any, 'id' | 'role'> & {
  sessionId: string;
  iat: number;
  exp: number;
};
