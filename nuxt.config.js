export default {
  mode: 'spa',
  /*  Headers of the page */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/Developmint/nuxt-purgecss
    // 'nuxt-purgecss'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://buefy.github.io/#/documentation
    'nuxt-buefy',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    // Doc: https://auth.nuxtjs.org/guide
    '@nuxtjs/auth'
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    baseURL: '/'
  },
  /*
   ** Auth module configuration
   ** See https://auth.nuxtjs.org/guide/setup.html
   */
  auth: {
    redirect: {
      login: '/',
      logout: '/',
      callback: '/',
      home: '/storyboard'
    },
    strategies: {
      local: {
        endpoints: {
          login: { url: '/api/auth/login', method: 'post', propertyName: 'token' },
          logout: { url: '/api/auth/logout', method: 'post' },
          user: { url: '/api/auth/user', method: 'get', propertyName: 'user' }
        }
      },
      github: {
        client_id: '5b11f740c52d7131f0c4',
        client_secret: '120910c708118fc93c564588c498262701d822d3'
      }
    }
  },
  /*
   ** PurgeCSS module configuration
   ** See https://github.com/Developmint/nuxt-purgecss
   */
  // purgeCSS: { // your settings here },
  router: {
    // middleware: ['auth']
  },
  /*
   ** Build configuration
   */
  build: {
    // analyze: true,
    minimize: true,
    optimization: {
      splitChunks: {
        chunks: 'all',
        automaticNameDelimiter: '.',
        name: undefined,
        maxSize: 244000
      }
    },
    postcss: {
      // Add plugin names as key and arguments as value
      // Install them before as dependencies with npm or yarn
      plugins: {
        'postcss-import': {},
        'postcss-url': {},
        'postcss-preset-env': this.preset,
        cssnano: { preset: 'default' } // disabled in dev mode
      },
      order: 'presetEnvAndCssnanoLast',
      preset: {
        // Change the postcss-preset-env settings
        stage: 2,
        autoprefixer: {
          // Use default autoprefixer settings (see defaults first, best to use default & browserlist)
        }
      }
    },
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {}
  }
};
