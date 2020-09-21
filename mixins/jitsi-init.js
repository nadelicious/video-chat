import jitsiConfig from '@/jitsi.config'

export default {
  data() {
    return {
      jitsiApi: null
    }
  },

  methods: {
    initJitsi(type, options, domain) {
      let config = jitsiConfig

      const configOverwrite = {
        ...config.configOverwrite,
        ...options.configOverwrite
      }

      const interfaceConfigOverwrite = {
        ...config.interfaceConfigOverwrite,
        ...options.interfaceConfigOverwrite
      }

      delete config.configOverwrite
      delete config.interfaceConfigOverwrite

      delete options.configOverwrite
      delete options.interfaceConfigOverwrite

      config = {
        ...config,
        ...options,
        configOverwrite,
        interfaceConfigOverwrite
      }
      // meet.jit.si
      const d = domain || 'beta.meet.jitsi.si'

      console.log('***jitsi config ***', config)

      // eslint-disable-next-line no-undef
      this.jitsiApi = new JitsiMeetExternalAPI(d, config)
    }
  }
}
