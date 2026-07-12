import { api } from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  inviteCode: string;
}

export interface Message {
  id: string;
  coupleId: string;
  senderId: string;
  content: string;
  imageUrl?: string | null;
  seenAt?: string | null;
  createdAt: string;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface CoupleInfo {
  paired: boolean;
  couple: {
    id: string;
    partner: Partner;
    anniversary: string | null;
    daysTogether: number;
    since: string;
  } | null;
}

export const authApi = {
  register: (email: string, name: string, password: string) =>
    api.post('/auth/register', { email, name, password }).then((r) => r.data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
};

export const usersApi = {
  me: () => api.get<User>('/users/me').then((r) => r.data),
};

export const couplesApi = {
  me: () => api.get<CoupleInfo>('/couples/me').then((r) => r.data),
  pair: (inviteCode: string) =>
    api.post<CoupleInfo>('/couples/pair', { inviteCode }).then((r) => r.data),
  setAnniversary: (anniversary: string) =>
    api.patch<CoupleInfo>('/couples/me', { anniversary }).then((r) => r.data),
};

export const chatApi = {
  history: (limit = 50) =>
    api.get<Message[]>('/chat/messages', { params: { limit } }).then((r) => r.data),
};

export const callApi = {
  room: () => api.get<{ room: string; domain: string; url: string }>('/call/room').then((r) => r.data),
};
