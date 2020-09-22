<template>
  <div class="w-100 h-100 agent">
    <div id="ac" class="agent__container" />
    <div v-if="localJoined" class="guest__controls fixed z-10 p-4">
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
    <div v-if="localJoined" class="agent__controls fixed z-10 p-4 text-center">
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
          class="outline-none block mr-5 bg-blue-400 hover:bg-blue-500 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center"
          @click="takePic"
        >
          <i class="icon-camera" />
        </button>

        <button
          class="outline-none block bg-red-400 hover:bg-red-500 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center"
          @click="endCall"
        >
          <i class="icon-phone-off" />
        </button>
      </div>
    </div>
    <div
      v-if="picPreview"
      class="pic-preview fixed left-0 top-0 bg-white w-full h-full"
    >
      <a
        class="text-right block absolute text-xs text-gray-500 p-3 right-0 top-0"
        @click.prevent="closePicPreview"
        >close</a
      >
      <div class="flex justify-center items-center">
        <div>
          <img
            v-if="guestData.picURL"
            :src="guestData.picURL"
            :style="{
              width: `${guestData.width}px`,
              height: `${guestData.height}px`
            }"
          />
        </div>
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
      guestCameraSwitched: false,
      localJoined: false,
      localParticipant: {},
      guestData: {
        width: 360,
        height: 720,
        picURL: ''
      },

      picPreview: false
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
      },
      interfaceConfigOverwrite: {
        DEFAULT_LOCAL_DISPLAY_NAME: 'agent',
        DEFAULT_REMOTE_DISPLAY_NAME: 'guest'
      }
    }

    this.initJitsi('agent', config)

    this.jitsiApi.on('videoConferenceJoined', this.onLocalParticipantJoined)
    this.jitsiApi.on('participantJoined', this.onRemoteParticipantJoined)
    this.jitsiApi.on('participantLeft', this.onRemoteParticipantLeft)
    this.jitsiApi.on('audioMuteStatusChanged', this.checkAudioMuteStatus)
    this.jitsiApi.on('videoMuteStatusChanged', this.checkVideoMuteStatus)

    this.jitsiApi.on(
      'endpointTextMessageReceived',
      this.recieveEndPointTextMessage
    )

    console.log('***jitsi API object***', this.jitsiApi)
  },

  beforeDestroy() {
    this.removeListeners()
  },

  methods: {
    recieveEndPointTextMessage(obj) {
      try {
        const { data: d } = obj
        const { eventData } = d
        const { text } = eventData

        const dataObj = JSON.parse(text) || {}

        const { type, name, data } = dataObj

        if (type === 'command') {
          switch (name) {
            case 'sendPic': {
              this.guestData = { ...this.guestData, ...data }
              this.picPreview = true
              break
            }

            case 'closePic': {
              this.picPreview = false
              break
            }

            default:
          }
        }

        if (type === 'metadata') {
          switch (name) {
            case 'guest': {
              this.guestData = { ...this.guestData, ...data }

              const { width, height } = this.guestData
              this.jitsiApi.resizeLargeVideo(width, height)
              break
            }

            default:
          }
        }
      } catch (e) {
        // do nothing
      }
    },

    toggleGuestAudio() {
      if (this.participants.length) {
        const pid = this.participants[0].id
        const data = {
          type: 'command',
          name: 'toggleAudio',
          data: {}
        }

        this.jitsiApi.executeCommand(
          'sendEndpointTextMessage',
          pid,
          JSON.stringify(data)
        )

        this.guestAudioMuted = !this.guestAudioMuted
      }
    },

    toggleGuestVideo() {
      if (this.participants.length) {
        const pid = this.participants[0].id
        const data = {
          type: 'command',
          name: 'toggleVideo',
          data: {}
        }

        this.jitsiApi.executeCommand(
          'sendEndpointTextMessage',
          pid,
          JSON.stringify(data)
        )

        this.guestVideoMuted = !this.guestVideoMuted
      }
    },

    toggleGuestCamera() {
      if (this.participants.length) {
        const pid = this.participants[0].id
        const data = {
          type: 'command',
          name: 'toggleCamera',
          data: {}
        }

        this.jitsiApi.executeCommand(
          'sendEndpointTextMessage',
          pid,
          JSON.stringify(data)
        )

        this.guestCameraSwitched = !this.guestCameraSwitched
      }
    },

    findGuestLocation() {
      if (this.participants.length) {
        const pid = this.participants[0].id

        const data = {
          type: 'command',
          name: 'findLocation',
          data: {}
        }

        this.jitsiApi.executeCommand(
          'sendEndpointTextMessage',
          pid,
          JSON.stringify(data)
        )
      }
    },

    checkAudioMuteStatus({ muted }) {
      this.audioMuted = muted
    },

    checkVideoMuteStatus({ muted }) {
      this.videoMuted = muted
    },

    onLocalParticipantJoined(p) {
      this.localJoined = true
      this.localParticipant = p

      // resize initial
      const { width, height } = this.guestData

      console.log('guestData', this.guestData)
      this.jitsiApi.resizeLargeVideo(width, height)
    },

    onRemoteParticipantJoined(participant) {
      this.participants = this.participants.concat(participant)

      this.jitsiApi.setLargeVideoParticipant(participant.id)
    },

    onRemoteParticipantLeft(participant) {
      this.participants = this.participants.filter(
        (v) => v.id !== participant.id
      )
      console.log('***participants:***', this.participants)
    },

    takePic() {
      if (this.participants.length) {
        const pid = this.participants[0].id

        const data = {
          type: 'command',
          name: 'takePic',
          data: {}
        }
        this.jitsiApi.executeCommand(
          'sendEndpointTextMessage',
          pid,
          JSON.stringify(data)
        )
      }
    },

    closePicPreview() {
      this.picPreview = false
      const data = {
        type: 'command',
        name: 'closePic',
        data: {}
      }

      if (this.participants.length) {
        const pid = this.participants[0].id
        this.jitsiApi.executeCommand(
          'sendEndpointTextMessage',
          pid,
          JSON.stringify(data)
        )
      }
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
      this.jitsiApi.off('participantJoined', this.onRemoteParticipantJoined)
      this.jitsiApi.off('audioMuteStatusChanged', this.checkAudioMuteStatus)
      this.jitsiApi.off('videoMuteStatusChanged', this.checkVideoMuteStatus)
      this.jitsiApi.off('participantLeft', this.onRemoteParticipantLeft)
      this.jitsiApi.off(
        'endpointTextMessageReceived',
        this.recieveEndPointTextMessage
      )
      this.jitsiApi.off('videoConferenceJoined', this.onLocalParticipantJoined)
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
