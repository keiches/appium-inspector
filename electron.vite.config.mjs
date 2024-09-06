import react from '@vitejs/plugin-react';
import {defineConfig, externalizeDepsPlugin} from 'electron-vite';
import {join} from 'path';
import renderer from 'vite-plugin-electron-renderer';
// import { nodePolyfills } from 'vite-plugin-node-polyfills'
// import inject from '@rollup/plugin-inject';
import replace from '@rollup/plugin-replace';
import { visualizer } from 'rollup-plugin-visualizer';

function myPlugin() {
  const virtualModuleId = 'virtual:my-module';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'my-plugin', // 필수 항목이며, 경고나 오류를 나타낼 때 사용됩니다.
    // apply: 'build', // 'serve',
    // enforce: 'post',
    /*async buildStart(inputOptions) {
      console.log('---- buildStart:', `${JSON.stringify(inputOptions)}##`);
    },*/
    resolveId(rawId, importer) {
      /*if (rawId === virtualModuleId) {
        return resolvedVirtualModuleId
      }*/
      // console.log('---- resolveId:', `${rawId}--`, `${importer}++`);
      if (rawId.startsWith('node:')) {
        console.log('---- resolveId:', `--${rawId}--`, `++${importer}++`);
        return {
          // id: rawId.split(':')[1],
          id: rawId.replace(/^node:(.+)$/g, 'node-polyfills/$1'),
          external: true,
        };
      }
      return null;
    },
    load(id) {
      /*if (id === resolvedVirtualModuleId) {
        return `export const msg = "from virtual module"`
      }*/
      console.log('---- load:', `${id}==`);
      /*if (id.startsWith('node:')) {
        return id.split(':')[1];
      }*/
    },
    transform(code, id) {
      console.log('---- transform:', `${id}==`);
      return code.replace(/require\("node:([^"]+)"\)/g, 'require("node-polyfills/$1")');
      // return code;
    },
    generateBundle1(_, bundle) {
      console.log('---- generateBundle:', bundle);
    }
  };
}

export default defineConfig({
  main: {
    build: {
      sourcemap: 'inline',
      outDir: join(__dirname, 'dist', 'main'),
      lib: {
        entry: join(__dirname, 'app', 'electron', 'main', 'main.js'),
      },
      /*rollupOptions: {
        external: ['os', 'fs', 'path', 'url', 'events', 'stream', 'string_decoder', 'fs/promises' /!* 다른 Node.js 빌트인 모듈들 *!/],
      },*/
    },
    // main process has a few imports from common, so this is needed
    resolve: {
      alias: {
        '#local-polyfills': join(__dirname, 'app', 'electron', 'renderer', 'polyfills'),
        /*'node:os': 'os',
        'node:fs': 'fs',
        'node:path': 'path',
        'node:url': 'url',
        'node:events': 'events',
        'node:stream': 'stream',
        'node:string_decoder': 'string_decoder',
        'node:fs/promises': 'fs/promises',*/
      },
    },
    plugins: [
      // nodePolyfills(),
      myPlugin(),
      replace({
        preventAssignment: true,
        values: {
          // 'process.env.NODE_ENV': JSON.stringify('production'),
          /*__buildDate__: () => JSON.stringify(new Date()),
          __buildVersion: 15,*/
          'node:': 'node-polyfills/',
        },
      }),
      /*inject({
        'node:os': 'os',
        'node:fs': 'fs',
        'node:path': 'path',
        'node:url': 'url',
        'node:events': 'events',
        'node:stream': 'stream',
        'node:string_decoder': 'string_decoder',
        'node:fs/promises': 'fs/promises',
      }),*/
      externalizeDepsPlugin(),
      visualizer(),
    ],
  },
  preload: {
    build: {
      sourcemap: 'inline',
      outDir: join(__dirname, 'dist', 'preload'),
      lib: {
        entry: join(__dirname, 'app', 'electron', 'preload', 'preload.js'),
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    build: {
      sourcemap: 'inline',
      outDir: join(__dirname, 'dist', 'renderer'),
      rollupOptions: {
        input: {
          main: join(__dirname, 'app', 'common', 'index.html'),
          splash: join(__dirname, 'app', 'common', 'splash.html'),
        },
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: '@root-entry-name: default;',
        },
      },
    },
    plugins: [react(), renderer()],
    resolve: {
      alias: {
        '#local-polyfills': join(__dirname, 'app', 'electron', 'renderer', 'polyfills'),
      },
    },
    root: join(__dirname, 'app', 'common'),
  },
});
