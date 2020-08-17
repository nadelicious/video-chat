import jitsiConfig from '@/jitsi.config'

export default {
  data() {
    return {
      jitsiApi: null
    }
  },

  methods: {
    initJitsi(type, domain, options) {
      let config = jitsiConfig

      config = { ...config, ...options }

      console.log('*** jitsi config ***', config)

      // eslint-disable-next-line no-undef
      this.jitsiApi = new JitsiMeetExternalAPI(domain, config)
    }
  }
}
