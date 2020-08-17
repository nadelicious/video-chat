<template>
  <div class="w-100 h-100 agent">
    <div id="ac" class="agent__container" />
    <div class="guest__controls fixed z-10 p-4">
      <button
        class="block mt-5 bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-full"
        @click="toggleGuestAudio"
      >
        mute guest audio
      </button>

      <button
        class="block mt-5 bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-full"
        @click="toggleGuestVideo"
      >
        mute guest video
      </button>

      <button
        class="block mt-5 bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-full"
        @click="findGuestLocation"
      >
        locate guest
      </button>
    </div>
  </div>
</template>

<script>
import JitsiInitMixin from '@/mixins/jitsi-init'

export default {
  name: 'Agent',

  mixins: [JitsiInitMixin],

  data() {
    return {
      participants: []
    }
  },

  mounted() {
    const config = {
      parentNode: document.getElementById('ac'),
      width: window.innerWidth,
      height: window.innerHeight
    }

    this.initJitsi('agent', 'meet.jit.si', config)

    this.jitsiApi.on('participantJoined', this.addParticipant)
  },

  methods: {
    toggleGuestAudio() {
      if (this.participants.length) {
        const pid = this.participants[0].id
        this.jitsiApi.executeCommand(
          'sendEndpointTextMessage',
          pid,
          'command:toggleAudio'
        )
      }
    },

    toggleGuestVideo() {
      console.log(this.jitsiApi)
      // this.jitsiApi.executeCommand('sendEndpointTextMessage', 'receiverParticipantId', 'text');;
    },

    findGuestLocation() {
      console.log(this.jitsiApi)
      // this.jitsiApi.executeCommand('sendEndpointTextMessage', 'receiverParticipantId', 'text');;
    },

    addParticipant(participant) {
      this.participants = this.participants.concat(participant)
    }
  }
}
</script>

<style scoped>
.guest__controls {
  top: 100px;
  left: 20px;
  width: 100px;
  height: 200px;
}
</style>
