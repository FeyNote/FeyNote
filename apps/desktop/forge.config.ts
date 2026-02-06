import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'FeyNote',
    executableName: 'feynote',
    appBundleId: 'com.feynote.desktop',
    extraResource: ['./renderer'],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'FeyNote',
    }),
    new MakerZIP({}, ['darwin', 'linux']),
    new MakerDMG({
      name: 'FeyNote',
    }),
    new MakerRpm({}),
    new MakerDeb({
      options: {
        maintainer: 'FeyNote',
        homepage: 'https://feynote.com',
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
