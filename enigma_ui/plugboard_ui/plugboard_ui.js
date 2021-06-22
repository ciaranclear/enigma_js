import { Plugboard } from '../../enigma_core/plugboard/plugboard.js';
import { includeHTML } from '../../helper_functions/include_html.js';
import { loadStyleSheet } from '../../helper_functions/include_css.js';
import { ConnectorUI } from '../connector_ui/connector_ui.js';
import { SteckerManagerUI } from '../stecker_cable/stecker_manager_ui.js';
import { UhrBoxUI } from '../uhr_box_ui/uhr_box_ui.js';

/*
Objective
1. connect ui sockets to socket logic
2. add event listeners to disconnect button
3. update plug numbers display when plug connected/disconnected
*/

export class PlugboardUI {
  constructor(enigmaUI, plugboardContainer, machineDict) {
    this.enigmaUI = enigmaUI;
    this.container = plugboardContainer;
    this.machineDict = machineDict;
    this.elementIds = {"help-open":"pb-help",
                       "help-close":"pb-close-icon"};
    this.cssPath = "enigma_ui/plugboard_ui/plugboard_ui.css";
    this.container.setAttribute("w3-include-html","enigma_ui/plugboard_ui/plugboard_ui.html");
    this.container.style.display = "block";
    this.plugboard = new Plugboard(this);
    this.steckerMode = true;
    this.adapter = null;
    this.socketsUI = {};
    this.init();
  }

  async init(){
    loadStyleSheet(this.cssPath);
    await includeHTML();
    this.makeUISockets();
    this.addDisconnectListener();
    this.addModeListener();
    this.createAdapter();
  }

  createAdapter() {
    if(this.steckerMode) {
      this.closeAdapter();
      this.initSteckerController();
    } else {
      this.closeAdapter();
      this.initUhrBox();
    }
  }

  toggleAdapter(e) {
    this.steckerMode = (this.steckerMode ? false : true);
    e.target.innerText = (this.steckerMode ? "S" : "U");
    this.createAdapter();
  }

  makeUISockets() {
    /*
    get socket objects and connect ui to them
    */
    const sockets = this.plugboard.sockets;
    for(let socket in sockets){
      const socketObj = sockets[socket];
      const socketId = `pb-socket-${socket}`;
      this.socketsUI[socket] = new SocketUI(this, socketObj, socketId);
    }
  }

  addModeListener() {
    const obj = this.enigmaUI.appUI;
    obj.addListener("click", function(e){
      if(e.target.id === "pb-mode") {
        this.toggleAdapter(e);
      }
    }.bind(this));
  }

  addDisconnectListener() {
    const obj = this.enigmaUI.appUI;
    obj.addListener("click", function(e){
      if(e.target.id === "pb-disconnect") {
        this.disconnectPlugboard();
      }
    }.bind(this));
  }

  disconnectPlugboard() {
    for(let socket in this.socketsUI){
      this.socketsUI[socket].disconnect();
    }
  }

  updatePlugCount() {
    /*
    when plug is connected or disconnected count number of connected plugs and display
    */
    let count = 0;
    for (let socket in this.socketsUI) {
      if(this.socketsUI[socket].isConnected()){
        count++;
      }
    }
    document.getElementById("pb-plug-count").innerText = count;
  }

  connected(connectorUIObj){
    this.updatePlugCount();
    this.enigmaUI.readyState();
  }

  disconnected(connectorUIObj){
    this.updatePlugCount();
    this.enigmaUI.readyState();
  }

  initSteckerController() {
    this.adapter = new SteckerManagerUI(this.enigmaUI, this);
  }

  initUhrBox() {
    const id = this.enigmaUI.appUI.elementIds["machine_ids"]["uhr_box"];
    const container = document.getElementById(id);
    this.adapter = new UhrBoxUI(this.enigmaUI, this, container, this.machineDict);
  }

  closeAdapter() {
    this.disconnectPlugboard();
    if(this.adapter) this.adapter.close();
  }

  readyState() {
    return this.plugboard.validDevice();
  }

  generateMessage() {
    if(!this.plugboard.validDevice()) {
      return {"LEVEL":"WARN",
              "COMPONENT":"PLUGBOARD",
              "MESSAGE":"PLUGBOARD NOT VALID"};
    } else if(this.adapter){
      return this.adapter.generateMessage();
    }
  }
}


class SocketUI extends ConnectorUI{
  constructor(controllerObject, socketObj, socketElemId) {
    super(controllerObject, socketObj);
    this.socketElemId = socketElemId;
  }

  validConnector() {

  }

  updateUI(){
    const socketContainer = document.getElementById(this.socketElemId);
    const socket = socketContainer.children[1];
    if(this.isConnected()){
      socket.children[0].style.display = "none";
      socket.children[1].style.display = "flex";
      this.connectedObj.decorateElem(socket.children[1]);
    } else {
      const newDiv = document.createElement("div");
      newDiv.classList.add("pb-connected");
      newDiv.style.display = "none";
      socket.children[0].style.display = "flex";
      socket.replaceChild(newDiv, socket.children[1]);
    }
  }

  connected(){
    this.updateUI();
    this.controllerObj.connected();
  }

  disconnected(){
    this.updateUI();
    this.controllerObj.disconnected();
  }
}