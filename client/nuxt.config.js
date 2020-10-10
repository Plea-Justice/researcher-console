export default {
  ssr: false,

  /*  Headers of the page */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }]
  },
  /*
   ** Development configuration for serving only client with nuxt.
   */
  server: {
    port: 3001
  },
  /*
   ** Environmental Variables
   */
  env: {
    // Either 'development' or 'production'
    MODE: process.env.MODE || 'development',
    // URL of the backend server.
    API_URL: process.env.API_URL || 'http://localhost:3000',
    // URL of this client application.
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
    // Address of the webserver from which permanent simulations are hosted.
    LIVE_URL: process.env.LIVE_URL || 'http://localhost:3000/sim-serve'
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  // FIXME: make this a styles/stylesheets folder instead where you can import all?
  css: ['~/assets/styles/common.scss', '~/assets/styles/bulma_extension.scss', '~/assets/styles/buefy.scss'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: ['~/plugins/vue-prototype-config', '~/plugins/axios', '~/plugins/text-filters', '~/plugins/vuelidate.js'],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/style-resources-module
    '@nuxtjs/style-resources',
    // Doc: https://github.com/nuxt-community/fontawesome-module
    '@nuxtjs/fontawesome'
    // Doc: https://github.com/Developmint/nuxt-purgecss
    // 'nuxt-purgecss',
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
    baseURL: process.env.API_URL || 'http://localhost:3000',
    credentials: true
  },
  // See https://github.com/buefy/nuxt-buefy
  buefy: {
    css: false,
    materialDesignIcons: false,
    defaultIconPack: 'fas',
    defaultIconComponent: 'FontAwesomeIcon'
  },
  // See https://github.com/nuxt-community/style-resources-module
  styleResources: {
    scss: ['~/assets/styles/vars/*.scss', '~/assets/styles/_mixins.scss']
  },
  // See https://github.com/Developmint/nuxt-purgecss
  // purgeCSS: { // your settings here },
  // See https://github.com/nuxt-community/fontawesome-module
  fontawesome: {
    icons: {
      // addCss: false,
      // useLayers: false,
      // useLayersText: false,
      solid: [
        'faPlus',
        'faTimes',
        'faTrash',
        'faQuestion',
        'faExclamationCircle',
        'faExclamationTriangle',
        'faChevronUp',
        'faChevronDown',
        'faArrowUp',
        'faArrowDown',
        'faCompressAlt',
        'faExpandAlt',
        'faSignInAlt',
        'faSignOutAlt',
        'faUser',
        'faUserPlus',
        'faUserCircle',
        'faEnvelope',
        'faLock',
        'faClone',
        'faPencilAlt',
        'faFileDownload',
        'faCloudUploadAlt',
        'faFileImage',
        'faFileVideo',
        'faEye',
        'faEyeSlash',
        'faCog',
        'faCheck',
        'faLink',
        'faUnlink',
        'faGraduationCap',
        'faUniversity',
        'faAngleLeft',
        'faAngleRight',
        'faAngleDown',
        'faAngleUp',
        'faTrashAlt'
      ]
    }
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
      home: '/scenarios'
    },
    cookie: false,
    strategies: {
      local: {
        endpoints: {
          login: { url: '/api/v1/auth/login', method: 'post' },
          logout: { url: '/api/v1/auth/logout', method: 'post' },
          user: { url: '/api/v1/auth/user', method: 'get', propertyName: 'result.user' },
          tokenRequired: false,
          tokenType: false
        }
      }
    }
  },
  router: {
    middleware: ['auth']
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
        cssnano: { preset: 'default' }, // disabled in dev mode
        'postcss-color-hex-alpha': {}
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
