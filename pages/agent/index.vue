<template>
  <div class="w-100 h-100 agent">
    <div id="ac" class="agent__container" />
    <div class="guest__controls fixed z-10 p-4">
      <div class="flex flex-col items-center justify-center">
        <button
          class="outline-none block bg-blue-400 hover:bg-blue-500 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center"
          @click="toggleGuestAudio"
        >
          <i :class="guestAudioMuted ? 'icon-mic-off' : 'icon-mic'" />
        </button>

        <button
          class="outline-none block mt-5 bg-blue-400 hover:bg-blue-500 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center"
          @click="toggleGuestVideo"
        >
          <i :class="guestVideoMuted ? 'icon-video-off' : 'icon-video'" />
        </button>

        <button
          class="outline-none block mt-5 bg-blue-400 hover:bg-blue-500 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center"
          @click="toggleGuestCamera"
        >
          <i
            :class="
              guestCameraSwitched ? 'icon-refresh-ccw' : 'icon-refresh-cw'
            "
          />
        </button>

        <button
          class="outline-none block mt-5 bg-blue-400 hover:bg-blue-500 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center"
          @click="findGuestLocation"
        >
          <i class="icon-map-pin" />
        </button>
      </div>
    </div>
    <div class="agent__controls fixed z-10 p-4 text-center">
      <div class="flex items-center justify-center">
        <button
          class="outline-none block mr-5 bg-blue-400 hover:bg-blue-500 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center"
          @click="toggleAudio"
        >
          <i :class="audioMuted ? 'icon-mic-off' : 'icon-mic'" />
        </button>

        <button
          class="outline-none block mr-5 bg-blue-400 hover:bg-blue-500 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center"
          @click="toggleVideo"
        >
          <i :class="videoMuted ? 'icon-video-off' : 'icon-video'" />
        </button>

        <button
          class="outline-none block bg-red-400 hover:bg-red-500 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center"
          @click="endCall"
        >
          <i class="icon-phone-off" />
        </button>
      </div>
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
      participants: [],
      audioMuted: false,
      videoMuted: false,
      guestAudioMuted: false,
      guestVideoMuted: false,
      guestCameraSwitched: false
    }
  },

  mounted() {
    const config = {
      parentNode: document.getElementById('ac'),
      width: window.innerWidth,
      height: window.innerHeight,
      configOverwrite: {
        resolution: 320,
        videoQuality: {
          // Provides a way to configure the maximum bitrates that will be enforced on the simulcast streams for
          // video tracks. The keys in the object represent the type of the stream (LD, SD or HD) and the values
          // are the max.bitrates to be set on that particular type of stream. The actual send may vary based on
          // the available bandwidth calculated by the browser, but it will be capped by the values specified here.
          // This is currently not implemented on app based clients on mobile.
          maxBitratesVideo: {
            low: 100000,
            standard: 200000,
            high: 200000
          }
        }
      }
    }

    this.initJitsi('agent', 'meet.jit.si', config)

    this.jitsiApi.on('participantJoined', this.addParticipant)
    this.jitsiApi.on('audioMuteStatusChanged', this.checkAudioMuteStatus)
    this.jitsiApi.on('videoMuteStatusChanged', this.checkVideoMuteStatus)

    console.log('***jitsi API object***', this.jitsiApi)
  },

  beforeDestroy() {
    this.removeListeners()
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

        this.guestAudioMuted = !this.guestAudioMuted
      }
    },

    toggleGuestVideo() {
      if (this.participants.length) {
        const pid = this.participants[0].id
        this.jitsiApi.executeCommand(
          'sendEndpointTextMessage',
          pid,
          'command:toggleVideo'
        )
      }

      this.guestVideoMuted = !this.guestVideoMuted
    },

    toggleGuestCamera() {
      if (this.participants.length) {
        const pid = this.participants[0].id
        this.jitsiApi.executeCommand(
          'sendEndpointTextMessage',
          pid,
          'command:toggleCamera'
        )
      }

      this.guestCameraSwitched = !this.guestCameraSwitched
    },

    findGuestLocation() {
      if (this.participants.length) {
        const pid = this.participants[0].id
        this.jitsiApi.executeCommand(
          'sendEndpointTextMessage',
          pid,
          'command:findLocation'
        )
      }
    },

    checkAudioMuteStatus({ muted }) {
      this.audioMuted = muted
    },

    checkVideoMuteStatus({ muted }) {
      this.videoMuted = muted
    },

    addParticipant(participant) {
      this.participants = this.participants.concat(participant)
      console.log('***participants:***', this.participants)
    },

    toggleVideo() {
      this.jitsiApi.executeCommand('toggleVideo')
    },

    toggleAudio() {
      this.jitsiApi.executeCommand('toggleAudio')
    },

    endCall() {
      this.removeListeners()
      this.jitsiApi.dispose()
      this.$router.push('/')
    },

    removeListeners() {
      this.jitsiApi.off('participantJoined', this.addParticipant)
      this.jitsiApi.off('audioMuteStatusChanged', this.checkAudioMuteStatus)
      this.jitsiApi.off('videoMuteStatusChanged', this.checkVideoMuteStatus)
    }
  }
}
</script>

<style scoped>
.guest__controls {
  top: 50%;
  transform: translateY(-50%);
  left: 20px;
}

.agent__controls {
  bottom: 40px;
  left: 50%;
  transform: translate(-50%, 0);
}
</style>
