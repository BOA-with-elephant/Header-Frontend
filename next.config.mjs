import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isDev, isServer }) => {
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }

    const currentDir = path.dirname(new URL(import.meta.url).pathname);

    // jsconfig.json과 동일한 alias 설정 (JS/TS용)
    config.resolve.alias['@'] = path.resolve(currentDir, 'src');
    config.resolve.alias['@/styles'] = path.resolve(currentDir, 'src/styles');
    config.resolve.alias['@/components'] = path.resolve(currentDir, 'src/components');
    config.resolve.alias['@/hooks'] = path.resolve(currentDir, 'src/hooks');
    config.resolve.alias['@/constants'] = path.resolve(currentDir, 'src/constants');

    return config;
  },
};

export default nextConfig;
