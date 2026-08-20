export type PrepSession = {
  authenticated: boolean;
  email: string | null;
  userId: string | null;
  entitled: boolean;
  displayName: string | null;
  firstTestUsed: boolean;
  message: string;
  loginUrl: string;
};
