<template>
  <div class="w-100 h-100 agent">
    <div id="ac" class="agent__container" />
  </div>
</template>

<script>
import JitsiInitMixin from '@/mixins/jitsi-init'

export default {
  name: 'Agent',

  mixins: [JitsiInitMixin],

  mounted() {
    const config = {
      parentNode: document.getElementById('ac'),
      width: window.innerWidth,
      height: window.innerHeight
    }

    this.initJitsi('agent', 'meet.jit.si', config)
  }
}
</script>
