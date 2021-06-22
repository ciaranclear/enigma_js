import { ScramblerUI } from '../enigma_ui/scrambler_ui/scrambler_ui.js';
import { LampboardUI } from '../enigma_ui/lampboard_ui/lampboard_ui.js';
import { KeyboardUI } from '../enigma_ui/keyboard_ui/keyboard_ui.js';
import { PlugboardUI } from '../enigma_ui/plugboard_ui/plugboard_ui.js';
import { EnigmaUI } from '../enigma_ui/enigma_ui/enigma_ui.js';
import { IOModule } from '../io_module/io_module.js';

let enigmaUI;

export function enigmaFactory(appUI, machineType, machineDict) {
  initEnigmaUI(appUI, machineType, machineDict);
}

function initEnigmaUI(appUI, machineType, machineDict)  {
  let elemId = appUI.elementIds["machine_ids"]["machine"];
  let elem = document.getElementById(elemId);
  enigmaUI = new EnigmaUI(appUI, machineType, elem, function(appUI, machineDict){ 
    return function() {
      initComponents(appUI, machineDict);
    }
  }(appUI, machineDict));
}

function initComponents(appUI, machineDict) {
  let elemId = appUI.elementIds["machine_ids"]["scrambler"];
  let elem = document.getElementById(elemId);
  console.log("INIT SCRAMBLER");
  enigmaUI.scramblerUI = new ScramblerUI(enigmaUI, elem, machineDict);
  
  elemId = appUI.elementIds["machine_ids"]["lampboard"];
  elem = document.getElementById(elemId);
  console.log("INIT LAMPBOARD");
  enigmaUI.lampboardUI = new LampboardUI(enigmaUI, elem, machineDict);
  
  elemId = appUI.elementIds["machine_ids"]["keyboard"];
  elem = document.getElementById(elemId);
  console.log("INIT KEYBOARD");
  enigmaUI.keyboardUI = new KeyboardUI(enigmaUI, elem);

  if (machineDict["PLUGBOARD"] !== null) {
    elemId = appUI.elementIds["machine_ids"]["plugboard"];
    elem = document.getElementById(elemId);
    console.log("INIT PLUGBOARD");
    enigmaUI.plugboardUI = new PlugboardUI(enigmaUI, elem, machineDict);
  }
  enigmaUI.anunciator.displayMessage();
  
  elemId = appUI.elementIds["input_ids"]["input"];
  elem = document.getElementById(elemId);
  enigmaUI.inputIOModule = new IOModule(enigmaUI, elem, true);

  elemId = appUI.elementIds["output_ids"]["output"];
  elem = document.getElementById(elemId);
  enigmaUI.outputIOModule = new IOModule(enigmaUI, elem);

  enigmaUI.inputIOModule.slave = enigmaUI.outputIOModule;
  enigmaUI.outputIOModule.master = enigmaUI.inputIOModule;
}