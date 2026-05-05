import { client } from '../../../../../packages/api-gen/src/client.gen';
import { authClient } from '../auth';

client.interceptors.request.use(async (config) => {
  try {
    const { data } = await authClient.getAccessToken({
      providerId: 'authentik',
    });
    if (data?.accessToken) {
      config.headers.set('Authorization', `Bearer ${data.accessToken}`);
    }
  } catch (error) {
    console.warn('Failed to attach token', error);
  }

  // KHÔNG return config ở đây nữa
});

export const apiClient = client;
