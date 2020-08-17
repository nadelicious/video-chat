<template>
  <div class="w-100 h-100 guest">
    <div id="gc" class="guest__container" />
  </div>
</template>

<script>
import JitsiInitMixin from '@/mixins/jitsi-init'

export default {
  name: 'Guest',

  mixins: [JitsiInitMixin],

  mounted() {
    const config = {
      parentNode: document.getElementById('gc'),
      width: window.innerWidth,
      height: window.innerHeight
    }

    this.initJitsi('agent', 'meet.jit.si', config)

    this.jitsiApi.on(
      'endpointTextMessageReceived',
      this.recieveEndPointTextMessage
    )
  },

  beforeDestroy() {
    this.jitsiApi.off(
      'endpointTextMessageReceived',
      this.recieveEndPointTextMessage
    )
  },

  methods: {
    recieveEndPointTextMessage(data) {
      console.log(data)
    }
  }
}
</script>
