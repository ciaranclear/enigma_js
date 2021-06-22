import { Lampboard } from '../../enigma_core/lampboard/lampboard.js';
import { includeHTML } from '../../helper_functions/include_html.js';
import { loadStyleSheet } from '../../helper_functions/include_css.js';

export class LampboardUI {
  constructor(enigmaUI, lampboardContainer, machineDict) {
    console.log("LAMPBOARD UI INIT");
    this.enigmaUI = enigmaUI;
    this.container = lampboardContainer;
    this.cssPath = "enigma_ui/lampboard_ui/lampboard_ui.css";
    this.container.setAttribute("w3-include-html","enigma_ui/lampboard_ui/lampboard_ui.html");
    this.container.style.display = "block";
    this.loadStyleSheet = loadStyleSheet;
    this.init();
  }

  init = async function() {
    loadStyleSheet(this.cssPath);
    await includeHTML();
  }

  lampOn(char) {
    const elem = document.getElementById(`lb-lamp-${char.toUpperCase()}`);
    if (elem) {
      elem.classList.remove("lb-lamp-off");
      elem.classList.add("lb-lamp-on");
    } else {
      throw new Error(`Lampboard error!. ${char}`
                      ` is not a valid lampboard character`);
    }
  }

  lampOff(char) {
    const elem = document.getElementById(`lb-lamp-${char.toUpperCase()}`);
    if (elem) {
      elem.classList.remove("lb-lamp-on");
      elem.classList.add("lb-lamp-off");
    } else {
      throw new Error(`Lampboard error!. ${char}`
                      ` is not a valid lampboard character`);
    }
  }
}