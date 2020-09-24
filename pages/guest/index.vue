<template>
  <div class="w-100 h-100 guest">
    <div id="gc" class="guest__container" />
    <div v-if="localJoined" class="guest__controls fixed z-10 text-center">
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
    <div v-if="localJoined" class="snapshot__controls fixed z-10 text-center">
      <div class="flex items-center justify-center">
        <button
          class="outline-none border solid border-gray-500 block mr-5 bg-white hover:bg-gray-100 text-black font-bold rounded-full h-12 w-12 flex items-center justify-center"
          @click="takePic()"
        >
          <i class="icon-camera" />
        </button>
      </div>
    </div>

    <div
      v-if="picPreview"
      class="pic-preview fixed left-0 top-0 bg-white w-full h-full"
    >
      <div class="relative">
        <span
          class="text-right block absolute text-xs text-gray-500 p-3 right-0 top-0 cursor-pointer"
          @click="closePicPreview"
          >close</span
        >
        <div class="flex justify-center items-center">
          <div>
            <img
              :src="picURL"
              :style="{
                width: `${getDimension().width}px`,
                height: `${getDimension().height}px`
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { isMobile } from 'mobile-device-detect'
// import axios from 'axios'
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
      currentVideoInput: null,
      picURL: '',
      localJoined: false,
      localParticipant: {},
      picPreview: false
    }
  },

  mounted() {
    // const height = {
    //   height: {
    //     ideal: 720,
    //     max: 720,
    //     min: 320
    //   }
    // }

    // if (isMobile) {
    //   height = {
    //     height: {
    //       ideal: 1080,
    //       max: 1080,
    //       min: 320
    //     }
    //   }
    // }
    const config = {
      parentNode: document.getElementById('gc'),
      width: window.innerWidth,
      height: window.innerHeight,
      // configOverwrite: {
      //   constraints: {
      //     video: {
      //       height
      //     }
      //   }
      // },
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
    this.jitsiApi.on('videoConferenceJoined', this.onLocalParticipantJoined)
    this.jitsiApi.on('participantJoined', this.onRemoteParticipantJoined)
    this.jitsiApi.on('participantLeft', this.onRemoteParticipantLeft)
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

        const { type, name } = dataObj

        if (type === 'command') {
          switch (name) {
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

            case 'takePic': {
              this.takePic()
              break
            }

            case 'closePic': {
              this.closePicPreview()
              break
            }

            case 'findLocation': {
              this.findLocation()
              break
            }

            default:
          }
        }
      } catch (e) {
        console.log(e)
        // do nothing
      }
    },

    onLocalParticipantJoined(p) {
      this.localJoined = true
      this.localParticipant = p

      // this.jitsiApi.setLargeVideoParticipant(p.id)
    },

    onRemoteParticipantJoined(participant) {
      this.participants = this.participants.concat(participant)

      this.jitsiApi.setLargeVideoParticipant(this.localParticipant.id)

      const data = {
        type: 'metadata',
        name: 'guest',
        data: {
          width: this.getDimension().width,
          height: this.getDimension().height
        }
      }

      this.jitsiApi.executeCommand(
        'sendEndpointTextMessage',
        participant.id,
        JSON.stringify(data)
      )
    },

    onRemoteParticipantLeft(participant) {
      this.participants = this.participants.filter(
        (v) => v.id !== participant.id
      )
      console.log('***participants:***', this.participants)
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

    async takePic() {
      try {
        const { dataURL } = await this.jitsiApi.captureLargeVideoScreenshot()

        this.picURL = dataURL

        this.picPreview = true

        const pInfo = this.jitsiApi.getParticipantsInfo()

        if (pInfo.length) {
          const agent = pInfo.find((v) => v.formattedDisplayName === 'agent')

          if (agent) {
            const data = {
              type: 'command',
              name: 'sendPic',
              data: {
                picURL:
                  'https://raultorrefieljr.com/static/3a7b1299f328bffc2d54d95e4277ab79/ab065/profilepic.jpg'
              }
            }
            this.jitsiApi.executeCommand(
              'sendEndpointTextMessage',
              agent.participantId,
              JSON.stringify(data)
            )
          }
        }
      } catch (e) {
        console.log(e)
      }
    },

    closePicPreview() {
      this.picPreview = false

      const pInfo = this.jitsiApi.getParticipantsInfo()

      if (pInfo.length) {
        const agent = pInfo.find((v) => v.formattedDisplayName === 'agent')

        if (agent) {
          const data = {
            type: 'command',
            name: 'closePic',
            data: {
              picURL: this.picURL
            }
          }

          this.jitsiApi.executeCommand(
            'sendEndpointTextMessage',
            agent.participantId,
            JSON.stringify(data)
          )
        }
      }
    },

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

    getDimension() {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      }
    },

    removeListeners() {
      this.jitsiApi.off('audioMuteStatusChanged', this.checkAudioMuteStatus)
      this.jitsiApi.off('videoMuteStatusChanged', this.checkVideoMuteStatus)
      this.jitsiApi.off(
        'endpointTextMessageReceived',
        this.recieveEndPointTextMessage
      )

      this.jitsiApi.off('videoConferenceJoined', this.onLocalParticipantJoined)

      this.jitsiApi.off('participantJoined', this.onRemoteParticipantJoined)
      this.jitsiApi.off('participantLeft', this.onRemoteParticipantLeft)
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

.pic-preview {
  z-index: 21;
}
</style>
