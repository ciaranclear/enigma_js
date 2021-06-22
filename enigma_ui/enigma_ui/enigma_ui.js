import { Enigma } from '../../enigma_core/enigma/enigma.js';
import { includeHTML } from '../../helper_functions/include_html.js';
import { loadStyleSheet } from '../../helper_functions/include_css.js';

export class EnigmaUI {
  constructor(appUI, machineType, container, cb) {
    this.appUI = appUI;
    this.machineType = machineType;
    this.container = container;
    this.elementIds = {"warning":"en-message"};
    this.cssPath = "enigma_ui/enigma_ui/enigma_ui.css";
    this.container.setAttribute("w3-include-html","enigma_ui/enigma_ui/enigma_ui.html");
    this.enigma = new Enigma();
    this.anunciator = new Anunciator(this);
    this.remoteLock = false;
    this.enigmaLock = false;
    this.enigmaValid = false;
    this.messages = {"WARN":{},"ADVISORY":{}};
    this.init(cb);
  }

  async init(cb) {
    loadStyleSheet(this.cssPath);
    await includeHTML();
    cb();
  }

  readyState() {
    // call readyState() on each component
    // if all components valid sets enigmaValid to true
    let state = true;
    if(!this.scramblerUI.readyState()) {
      state = false;
    }
    if(this.plugboardUI && !this.plugboardUI.readyState()) {
      state = false;
    }
    this.enigmaValid = state;
    this.inputIOModule.checkState();
    this.outputIOModule.checkState();
    this.anunciator.displayMessage();
  }

  keyUp(character) {
    if(this.currChar) this.lampboardUI.lampOff(this.currChar);
  }

  keyDown(character) {
    let variable = character;
    if(this.plugboardUI) {
      variable = this.plugboardUI.plugboard.outerPinValue(character, "LG");
    }
    variable = this.scramblerUI.scrambler.keyedInput(variable);
    this.scramblerUI.updateScramblerUI();
    if(this.plugboardUI) {
      variable = this.plugboardUI.plugboard.outerPinValue(variable, "SM");
    }
    this.currChar = variable;
    this.lampboardUI.lampOn(variable);
    return variable;
  }

  remoteKeyDown(character) {
    this.keyboardUI.keyDown(character);
    return this.keyDown(character);
  }

  remoteKeyUp(character) {
    this.keyboardUI.keyUp(character);
    this.keyUp(character);
  }
}


class Anunciator{
  constructor(enigmaUI) {
    this.enigmaUI = enigmaUI;
    this.warnings =[];
    this.advisories = [];
    this.messageWindow = null;
  }

  makeMessageWindow() {
    if(!this.messageWindow) {
      const elem = document.createElement("div");
      this.messageWindow = elem;
      const id = this.enigmaUI.elementIds["warning"];
      elem.setAttribute("id", id);
      this.enigmaUI.container.appendChild(elem);
    }
  }

  displayMessage() {
    this.makeMessageWindow();
    this.getMessages();
    let message;
    let msg;
    let color;
    if(this.warnings.length !== 0) {
      message = this.warnings.shift();
      color = "red";
    } else if(this.advisories.length !== 0) {
      message = this.advisories.shift();
      color = "yellow";
    }
    if(message) {
      msg = message["MESSAGE"];
    } else {
      msg = "ENIGMA IS VALID";
      color = "green";
    }
    const id = this.enigmaUI.elementIds["warning"];
    const elem = document.getElementById(id);
    elem.innerText = msg;
    elem.style.color = color;
    this.warnings = [];
    this.advisories = [];
  }

  getMessages() {
    const components = [this.enigmaUI.scramblerUI,
                        this.enigmaUI.plugboardUI];
    components.forEach(component => {
      if(component) {
        let message = component.generateMessage();
        if(message && message["LEVEL"] === "WARN") {
          this.warnings.push(message);
        } else if(message && message["LEVEL"] === "ADVISORY") {
          this.advisories.push(message);
        }
      }
    });
  }
}