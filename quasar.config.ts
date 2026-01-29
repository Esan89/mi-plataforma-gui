// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers';

export default defineConfig((/* ctx */) => {
  return {
    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    boot: [
      'axios',
      'router-auth'
    ],

    css: ['app.scss'],

    extras: [
      'roboto-font',
      'material-icons',
    ],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },

      typescript: {
        strict: true,
        vueShim: true,
      },

      vueRouterMode: 'hash',

      vitePlugins: [
        [
          'vite-plugin-checker',
          {
            vueTsc: false,
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src/**/*.{ts,js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],

      extendViteConf (viteConf) {
        viteConf.server = {
          ...viteConf.server,
          // Esto permite que Ngrok entre sin bloqueo de host
          allowedHosts: [
            '.ngrok-free.app',
            'localhost'
          ]
        }
      },
    },

    devServer: {
      open: true,
      // allowedHosts: 'all', // Puedes dejar este o usar el de arriba en viteConf, ambos funcionan.

      // 🔥 AQUÍ ESTÁ LA MAGIA DEL PROXY 🔥
      // Cuando el frontend reciba una petición a estas rutas,
      // se la pasará internamente al Backend en el puerto 3000.
      proxy: {
        '/auth': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        },
        '/scraper': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        },
        '/arribos': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        }
      }
    },

    framework: {
      config: {},
      plugins: [
        'Notify',
        'Loading'
      ],
    },

    animations: [],

    ssr: {
      prodPort: 3000,
      middlewares: [
        'render',
      ],
      pwa: false,
    },

    pwa: {
      workboxMode: 'GenerateSW',
    },

    cordova: {},

    capacitor: {
      hideSplashscreen: true,
    },

    electron: {
      preloadScripts: ['electron-preload'],
      inspectPort: 5858,
      bundler: 'packager',
      packager: {},
      builder: {
        appId: 'mi-plataforma-gui',
      },
    },

    bex: {
      extraScripts: [],
    },
  };
});
