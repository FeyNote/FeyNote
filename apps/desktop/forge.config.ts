import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';

const { APPLE_API_KEY_PATH, APPLE_API_KEY_ID, APPLE_API_ISSUER } = process.env;

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'FeyNote',
    icon: './icons/feynote',
    executableName: 'feynote-desktop',
    appBundleId: 'com.feynote.desktop',
    extraResource: ['./renderer', './icons'],
    osxSign: {
      ...(process.env.CI ? { keychain: 'build.keychain' } : {}),
    },
    ...(APPLE_API_KEY_PATH && APPLE_API_KEY_ID && APPLE_API_ISSUER
      ? {
          osxNotarize: {
            appleApiKey: APPLE_API_KEY_PATH,
            appleApiKeyId: APPLE_API_KEY_ID,
            appleApiIssuer: APPLE_API_ISSUER,
          },
        }
      : {}),
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'FeyNote',
      setupIcon: './icons/feynote.ico',
      iconUrl: 'https://static.feynote.com/assets/favicon-20240925.ico',
      loadingGif: './icons/feynote-installing.gif',
      description: 'A fantasy themed note taking app oriented towards TTRPGs',
      remoteReleases:
        'https://feynote-public.s3.us-east-1.amazonaws.com/desktop/prod/win32/x64',
    }),
    new MakerZIP(
      {
        macUpdateManifestBaseUrl:
          'https://feynote-public.s3.us-east-1.amazonaws.com/desktop/prod/darwin',
      },
      ['darwin', 'linux'],
    ),
    new MakerDMG({
      name: 'FeyNote',
      icon: './icons/feynote.icns',
    }),
    new MakerRpm({
      options: {
        icon: './icons/feynote.png',
        description: 'A fantasy themed note taking app oriented towards TTRPGs',
      },
    }),
    new MakerDeb({
      options: {
        maintainer: 'FeyNote',
        homepage: 'https://feynote.com',
        icon: './icons/feynote.png',
        description: 'A fantasy themed note taking app oriented towards TTRPGs',
      },
    }),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      build: [
        {
          entry: 'src/main/main.ts',
          config: 'vite.config.ts',
          target: 'main',
        },
        {
          entry: 'src/main/preload.ts',
          config: 'vite.config.ts',
          target: 'preload',
        },
      ],
      renderer: [],
    }),
  ],
};

export default config;
