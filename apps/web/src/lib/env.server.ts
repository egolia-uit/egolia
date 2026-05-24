import {
  type PublicRuntimeEnv,
  defaultPublicRuntimeEnv,
  publicRuntimeEnvKeys,
} from './env';

export function getPublicRuntimeEnvFromProcess(): PublicRuntimeEnv {
  return publicRuntimeEnvKeys.reduce((env, key) => {
    env[key] = process.env[key] || defaultPublicRuntimeEnv[key];
    return env;
  }, {} as PublicRuntimeEnv);
}
