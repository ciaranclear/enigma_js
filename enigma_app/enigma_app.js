import { enigmaFactory } from '../helper_functions/factory.js';
import { includeHTML } from '../helper_functions/include_html.js'; 
import { loadStyleSheet } from '../helper_functions/include_css.js';
//import { EnigmaHelp } from './enigma_help/enigma_help.js'; 

/*
The app is responsible for
1. machine selection.machine.
2. building the base html.
3. adding and removing the event listeners.
*/
class EnigmaApp{
  constructor() {
  	this.elementIds = {
      "container_ids":{"enigma":"enigma-container",
                       "input":"input-container",
                       "machine":"machine-container",
                       "output":"output-container"},
      "input_ids":{"input":"input-module-container"},
      "output_ids":{"output":"output-module-container"},
      "machine_ids":{"select":"select-container",
                     "machine":"machine",
                     "scrambler":"scrambler-container",
                     "lampboard":"lampboard-container",
                     "keyboard":"keyboard-container",
                     "plugboard":"plugboard-container",
                     "uhr_box":"uhr-box-container"},
    };
  	this.container = document.getElementById(this.elementIds["container_ids"]["enigma"]);
    this.cssPath = "enigma_app/enigma_app.css";
    this.settingsPath = "./enigma_core/settings/settings.json";
    this.settings;
    this.listeners = [];
    this.init();
  }

  init = async function() {
    loadStyleSheet(this.cssPath);
    await this.getSettings();
    await this.buildBaseHTML();
    this.displayCover();
    this.makeSelector();
    this.setEventListener();
  }

  addListener(eventType, func, bool) {
    this.listeners.push([eventType, func]);
    this.container.addEventListener(eventType, func, bool);
  }

  removeListener(event, func) {
  	for(let i = 0; i < this.listeners.length; i++) {
  	  const event_ = this.listeners[i][0];
      const func_ = this.listeners[i][1];
      if(event === event_ && func === func_) {
        this.container.removeEventListener(event, func);
        return true;   
      }
  	}
  	return false;
  }

  removeListeners() {
    for(let i = 0; i < this.listeners.length; i++) {
      const event = this.listeners[i][0];
      const func = this.listeners[i][1];
      this.removeListener(event, func);
    }
  }

  displayCover = function() {
  	const elem = document.createElement("div");
    elem.setAttribute("id","enigma-box-cover");
    const img = document.createElement("img");
    img.setAttribute("src", "././images/enigma_logo.svg");
    elem.appendChild(img);
    const id = "#" + this.elementIds["machine_ids"]["machine"];
    const container = document.querySelector(id);
    container.appendChild(elem);
  }

  buildBaseHTML = function() {
  	return includeHTML();
  }

  tearDownMachineHTML = function() {
  	const removeInner = function(elemArr) {
      for (let i = 0; i < elemArr.length;i++) {
        elemArr[i].innerHTML = "";
      }
    };
    const inputContainerId = this.elementIds["container_ids"]["input"];
    const inputSubCons = document.getElementById(inputContainerId).children;
    removeInner(inputSubCons);
    const outputContainerId = this.elementIds["container_ids"]["output"];
    const outputSubCons = document.getElementById(outputContainerId).children;
    removeInner(outputSubCons);
    const machineContainerId = this.elementIds["machine_ids"]["machine"];
    document.getElementById(machineContainerId).innerHTML = "";
  }

  makeSelector = function() {
  	// get selector container
    const selectContainerId = this.elementIds["machine_ids"]["select"];
    const selectContainer = document.getElementById(selectContainerId);
    // make selector element
    const labelElem = document.createElement("label");
    labelElem.setAttribute("for", "machine-type");
    labelElem.innerText = "Machine";
    selectContainer.appendChild(labelElem);
    const selectElem = document.createElement("select");
    selectElem.setAttribute("name", "machine");
    selectElem.setAttribute("id", "machine-type");
    // populate selector element
    const optionElem = document.createElement("option");
    optionElem.value = '';
    optionElem.setAttribute("disabled", true);
    optionElem.setAttribute("selected", true);
    optionElem.setAttribute("hidden", true);
    optionElem.innerText = "Select Machine";
    selectElem.appendChild(optionElem);
    for (let machine in this.settings["EQUIPMENT_DICT"]) {
      const optionElem = document.createElement("option");
      optionElem.setAttribute("value", machine);
      optionElem.innerText = machine;
      selectElem.appendChild(optionElem);
    }
    selectContainer.appendChild(selectElem);
  }

  setEventListener = function() {
  	const machineSelect = document.querySelector("#machine-type");
    machineSelect.addEventListener("change", function(e){
      this.removeListeners();
      this.makeMachine(e.currentTarget.value);
    }.bind(this));
  }

  makeMachine = function(machine) {
    this.tearDownMachineHTML();
    const machineDict = this.settings["EQUIPMENT_DICT"][machine];
    enigmaFactory(this, machine, machineDict);
  }

  getSettings = function() {
  	return new Promise((resolve, reject) => {
      fetch(this.settingsPath).then(response => {
        return response.json();
      }).then(data => {
        this.settings = data;
        resolve();
      }).catch(err => {
        reject(err);
      })
    })
  }
}

const enigmaApp = new EnigmaApp();