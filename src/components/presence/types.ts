export type PossibleSessionStatus = 'online' | 'offline';

export type SessionStatusName = 'ONLINE' | 'OFFLINE';

export type SessionStatus = {
  [key in SessionStatusName]: PossibleSessionStatus;
};

export type SessionPayload<T = any> = {
  userId: string;
  organizationId: string;
  startTimestamp?: any;
  endTimestamp?: any;
  status: PossibleSessionStatus;
  data?: T,
};

export type UserSessionId = {
  lastId: string;
};
