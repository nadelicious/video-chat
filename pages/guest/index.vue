<template>
  <div class="w-100 h-100 guest">
    <div id="gc" class="guest__container" />
    <div class="guest__controls fixed z-10 text-center">
      <div class="flex flex-col items-center justify-center">
        <button
          class="outline-none block bg-blue-400 hover:bg-blue-500 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center"
          @click="toggleCamera"
        >
          <i :class="cameraSwitched ? 'icon-refresh-ccw' : 'icon-refresh-cw'" />
        </button>
        <button
          class="outline-none mt-5 block bg-blue-400 hover:bg-blue-500 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center"
          @click="toggleAudio"
        >
          <i :class="audioMuted ? 'icon-mic-off' : 'icon-mic'" />
        </button>

        <button
          class="outline-none block mt-5 bg-blue-400 hover:bg-blue-500 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center"
          @click="toggleVideo"
        >
          <i :class="videoMuted ? 'icon-video-off' : 'icon-video'" />
        </button>

        <button
          class="outline-none block mt-5 bg-red-400 hover:bg-red-500 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center"
          @click="endCall"
        >
          <i class="icon-phone-off" />
        </button>
      </div>
    </div>
    <div class="snapshot__controls fixed z-10 text-center">
      <div class="flex items-center justify-center">
        <button
          class="outline-none border solid border-gray-500 block mr-5 bg-white hover:bg-gray-100 text-black font-bold rounded-full h-12 w-12 flex items-center justify-center"
          @click="takePic"
        >
          <i class="icon-camera" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { isMobile } from 'mobile-device-detect'
import JitsiInitMixin from '@/mixins/jitsi-init'

export default {
  name: 'Guest',

  mixins: [JitsiInitMixin],

  data() {
    return {
      participants: [],
      audioMuted: false,
      videoMuted: false,
      cameraSwitched: false,
      currentVideoInput: null
    }
  },

  mounted() {
    let height = {
      height: {
        ideal: 720,
        max: 720,
        min: 320
      }
    }

    if (isMobile) {
      height = {
        height: {
          ideal: 1080,
          max: 1080,
          min: 320
        }
      }
    }
    const config = {
      parentNode: document.getElementById('gc'),
      width: window.innerWidth,
      height: window.innerHeight,
      configOverwrite: {
        constraints: {
          video: {
            height
          }
        }
      },
      interfaceConfigOverwrite: {
        // This property allows setting only specific UI elements on the iframe. In our case
        // we disable all the UI elements. For enabling it them, remove this prop.
        // For a list of all UI elements, please consult the api documentation on github
        TOOLBAR_BUTTONS: [],
        MOBILE_APP_PROMO: false,
        DEFAULT_LOCAL_DISPLAY_NAME: 'guest',
        DEFAULT_REMOTE_DISPLAY_NAME: 'agent'
      }
    }

    this.initJitsi('guest', config)

    this.jitsiApi.on(
      'endpointTextMessageReceived',
      this.recieveEndPointTextMessage
    )

    this.jitsiApi.on('audioMuteStatusChanged', this.checkAudioMuteStatus)
    this.jitsiApi.on('videoMuteStatusChanged', this.checkVideoMuteStatus)
  },

  beforeDestroy() {
    this.removeListeners()
  },

  methods: {
    recieveEndPointTextMessage(obj) {
      const { data } = obj
      const { eventData } = data
      const { text } = eventData

      if (text.startsWith('command:')) {
        const cmd = text.split(':')

        switch (cmd[1]) {
          case 'toggleAudio': {
            this.jitsiApi.executeCommand('toggleAudio')
            break
          }

          case 'toggleVideo': {
            this.jitsiApi.executeCommand('toggleVideo')
            break
          }

          case 'toggleCamera': {
            this.toggleCamera()
            break
          }

          case 'findLocation': {
            this.findLocation()
            break
          }

          default:
        }
      }
    },

    async findLocation() {
      const pos = await navigator.geolocation.getCurrentPosition()
      console.log(pos)
    },

    async toggleCamera() {
      try {
        const isDeviceListAvailable = await this.jitsiApi.isDeviceListAvailable()

        if (!isDeviceListAvailable) {
          throw new Error('Device list is not available.')
        }

        const isDeviceChangeAvailable = await this.jitsiApi.isDeviceChangeAvailable(
          'input'
        )

        if (!isDeviceChangeAvailable) {
          throw new Error('Device change is not available.')
        }

        const devices = await this.jitsiApi.getAvailableDevices()
        const { videoInput } = devices

        console.log('***video inputs***', videoInput)

        if (!videoInput) {
          throw new Error('No video input available.')
        }

        if (videoInput && videoInput.length < 2) {
          throw new Error('You have only one video input.')
        }

        const videoInputs = videoInput
        const currentDevices = await this.jitsiApi.getCurrentDevices()
        const { videoInput: vi } = currentDevices

        let currentVideoInput = videoInputs[0]

        if (vi) {
          currentVideoInput = vi
        }

        if (this.currentVideoInput) {
          currentVideoInput = this.currentVideoInput
        }

        if (!vi) {
          console.log('***uses workaround ***', currentVideoInput)
        }

        console.log('***current video input***', currentVideoInput)

        if (currentVideoInput.label && currentVideoInput.label.match(/back/i)) {
          const otherVideoInput = videoInputs.find(
            (v) => v.label && v.label.match(/front/i)
          )

          if (otherVideoInput) {
            const { deviceId, label } = otherVideoInput
            this.jitsiApi.setVideoInputDevice(label, deviceId)
            this.currentVideoInput = otherVideoInput
            this.cameraSwitched = !this.cameraSwitched
          } else {
            throw new Error('Unable to match camera label.')
          }
        } else if (
          currentVideoInput.label &&
          currentVideoInput.label.match(/front/i)
        ) {
          const otherVideoInput = videoInputs.find(
            (v) => v.label && v.label.match(/back/i)
          )

          if (otherVideoInput) {
            const { deviceId, label } = otherVideoInput
            this.jitsiApi.setVideoInputDevice(label, deviceId)
            this.currentVideoInput = otherVideoInput
            this.cameraSwitched = !this.cameraSwitched
          } else {
            throw new Error('Unable to match camera label.')
          }
        } else {
          const otherVideoInput = videoInputs.find(
            (v) =>
              v.label &&
              v.deviceId &&
              currentVideoInput.label &&
              v.deviceId !== currentVideoInput.deviceId
          )

          if (otherVideoInput) {
            const { deviceId, label } = otherVideoInput
            this.jitsiApi.setVideoInputDevice(label, deviceId)
            this.currentVideoInput = otherVideoInput
            this.cameraSwitched = !this.cameraSwitched
          } else {
            throw new Error('Unable to find device id.')
          }
        }
      } catch (e) {
        this.$message.error(e.message || 'Unable to switch camera')
      }
    },

    takePic() {},

    checkAudioMuteStatus({ muted }) {
      this.audioMuted = muted
    },

    checkVideoMuteStatus({ muted }) {
      this.videoMuted = muted
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
      this.jitsiApi.off('audioMuteStatusChanged', this.checkAudioMuteStatus)
      this.jitsiApi.off('videoMuteStatusChanged', this.checkVideoMuteStatus)
      this.jitsiApi.off(
        'endpointTextMessageReceived',
        this.recieveEndPointTextMessage
      )
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

.snapshot__controls {
  bottom: 40px;
  left: 50%;
  transform: translate(-50%, 0);
}
</style>
