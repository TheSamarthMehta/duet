import * as SecureStore from 'expo-secure-store';

const ACCESS = 'duet_access_token';
const REFRESH = 'duet_refresh_token';

export const tokenStorage = {
  async save(access: string, refresh: string) {
    await SecureStore.setItemAsync(ACCESS, access);
    await SecureStore.setItemAsync(REFRESH, refresh);
  },
  async getAccess() {
    return SecureStore.getItemAsync(ACCESS);
  },
  async getRefresh() {
    return SecureStore.getItemAsync(REFRESH);
  },
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS);
    await SecureStore.deleteItemAsync(REFRESH);
  },
};
