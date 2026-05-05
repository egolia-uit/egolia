import { client } from '../../../../../packages/api-gen/src/client.gen';
import { authClient } from '../auth';

client.interceptors.request.use(async (config) => {
  try {
    const session = await authClient.getSession();
    const { accessToken } = await authClient.getAccessToken({
      providerId: 'authentik',
    });
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
  } catch (error) {
    console.warn('Failed to attach token', error);
  }

  // KHÔNG return config ở đây nữa
});

export const apiClient = client;
