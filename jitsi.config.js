module.exports = {
  // default room name
  roomName: 'LiveVideoApp',
  width: '100%',
  height: '100%',
  // sets the parent html element of the iframe
  parentNode: null,
  // this allows overwriting of some of the global configurations
  configOverwrite: {
    // when set to true, this will disable the Recording on/off audio notifications
    // suppressRecordIVR: true
    enableWelcomePage: false,

    p2p: {
      enabled: false
    }
  },
  interfaceConfigOverwrite: {
    // This property allows setting only specific UI elements on the iframe. In our case
    // we disable all the UI elements. For enabling it them, remove this prop.
    // For a list of all UI elements, please consult the api documentation on github
    TOOLBAR_BUTTONS: []

    // GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
    // DISPLAY_WELCOME_PAGE_CONTENT: false,
    // DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
    // ENABLE_DIAL_OUT: false
  }
}
