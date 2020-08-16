import jitsiConfig from '@/jitsi.config'

export default {
  data() {
    return {
      jitsiApi: null
    }
  },

  methods: {
    initJitsi(type, options) {
      let config = jitsiConfig

      config = { ...config, ...options }
      // eslint-disable-next-line no-undef
      this.jitsiApi = new JitsiMeetExternalAPI('hmuresan.jitsi.net', config)
    }
  }
}
