module.exports = {
  // default room name
  roomName: 'LiveVideoApp',
  width: 900,
  height: 900,
  // sets the parent html element of the iframe
  parentNode: null,
  // this allows overwriting of some of the global configurations
  configOverwrite: {
    // when set to true, this will disable the Recording on/off audio notifications
    suppressRecordIVR: true
  },
  interfaceConfigOverwrite: {
    // This property allows setting only specific UI elements on the iframe. In our case
    // we disable all the UI elements. For enabling it them, remove this prop.
    // For a list of all UI elements, please consult the api documentation on github
    TOOLBAR_BUTTONS: []
  }
}
