module.exports = {
  // default room name
  roomName: 'LiveVideoApp',
  // width: '100%',
  // height: '100%',
  // sets the parent html element of the iframe
  parentNode: null,
  // this allows overwriting of some of the global configurations
  configOverwrite: {
    // when set to true, this will disable the Recording on/off audio notifications
    // suppressRecordIVR: true
    enableWelcomePage: false,
    enableRemb: false,
    enableTcc: false,

    disableSimulcast: false,

    enableP2P: true, // flag to control P2P connections
    // New P2P options

    useStunTurn: true, // use XEP-0215 to fetch TURN servers for the JVB connection
    useTurnUdp: false,

    enableLipSync: false,
    disableRtx: false,

    // Video Quality settings to limit bitrate
    videoQuality: {
      disabledCodec: ''
    },

    resolution: 1080,

    constraints: {
      video: {
        height: {
          ideal: 1080,
          max: 1080,
          min: 180
        }
      }
    },

    startBitrate: '800',
    disableAudioLevels: false,
    disableSuspendVideo: true,
    stereo: false,
    forceJVB121Ratio: -1,

    openBridgeChannel: 'websocket', // One of true, 'datachannel', or 'websocket'
    channelLastN: -1, // The default value of the channel attribute last-n.
    lastNLimits: {
      5: 20,
      30: 15,
      50: 10,
      70: 5,
      90: 2
    },

    p2p: {
      enabled: true,
      preferredCodec: 'h264',
      useStunTurn: true // use XEP-0215 to fetch STUN and TURN servers for the P2P connection
    }
  },

  interfaceConfigOverwrite: {
    // This property allows setting only specific UI elements on the iframe. In our case
    // we disable all the UI elements. For enabling it them, remove this prop.
    // For a list of all UI elements, please consult the api documentation on github
    TOOLBAR_BUTTONS: [],

    DISPLAY_WELCOME_PAGE_CONTENT: false

    // GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
    // DISPLAY_WELCOME_PAGE_CONTENT: false,
    // DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
    // ENABLE_DIAL_OUT: false
  }
}
