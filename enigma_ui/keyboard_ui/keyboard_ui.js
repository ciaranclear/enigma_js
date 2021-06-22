import { Keyboard } from '../../enigma_core/keyboard/keyboard.js';
import { includeHTML } from '../../helper_functions/include_html.js';
import { loadStyleSheet } from '../../helper_functions/include_css.js';

export class KeyboardUI {
  constructor(enigmaUI, keyboardContainer) {
    console.log("KEYBOARD UI INIT");
    this.enigmaUI = enigmaUI;
    this.container = keyboardContainer;
    this.stKeyboard = true;
    this.currChar = null;
    this.cssPath = "enigma_ui/keyboard_ui/keyboard_ui.css";
    this.container.style.display = "block";
    this.keyboard = new Keyboard();
    this.init();
  }

  init = async function() {
    if(this.stKeyboard){
      this.container.setAttribute("w3-include-html","enigma_ui/keyboard_ui/keyboard_html/standard_keyboard.html");
    } else {
      this.container.setAttribute("w3-include-html","enigma_ui/keyboard_ui/keyboard_html/numbered_keyboard.html");
    }
    await includeHTML();
    loadStyleSheet(this.cssPath);
    this.addListeners();
  }
  
  addListeners() {
    const obj = this.enigmaUI.appUI;
    obj.addListener("mousedown", this.keyDownListener.bind(this));
    obj.addListener("mouseup", this.keyUpListener.bind(this));
    obj.addListener("mouseout", this.keyUpListener.bind(this), true);
    obj.addListener("click", this.keyboardMode.bind(this));
  }
  
  keyDownListener(e) {
    const listenerElem = e.target.closest(".kb-key");
    if(listenerElem) {
      const targetElem = listenerElem.parentElement.children[1];
      this.currChar = targetElem.getAttribute("key-value");
      this.enigmaUI.keyDown(this.currChar);
      this.styleDown(targetElem);
    }
  }

  keyUpListener(e) {
    const listenerElem = e.target.closest(".kb-key");
    if(listenerElem) {
      const targetElem = listenerElem.parentElement.children[1];
      this.enigmaUI.keyUp(this.currChar);
      this.styleUp(targetElem);
      this.currChar = null;
    }
  }

  keyboardMode(e) {
    const listenerElem = e.target.closest(".kb-select");
    if(listenerElem) {
      this.stKeyboard = (this.stKeyboard ? false : true);
      this.container.innerHTML = '';
      if(this.stKeyboard) {
        this.container.setAttribute("w3-include-html","enigma_ui/keyboard_ui/keyboard_html/standard_keyboard.html");
      } else {
        this.container.setAttribute("w3-include-html","enigma_ui/keyboard_ui/keyboard_html/numbered_keyboard.html");
      }
      includeHTML();
    }
  }
  
  keyDown(character) {
    character = this.keyboard.keyboardInput(character);
    const keyElem = document.querySelector(`#kb-key-${character}`);
    if(keyElem) {
      this.styleDown(keyElem);
    }
  }

  keyUp(character) {
    character = this.keyboard.keyboardInput(character);
    const keyElem = document.querySelector(`#kb-key-${character}`);
    if(keyElem && keyElem.classList.contains("kb-key-down")){
      this.styleUp(keyElem);
    }
  }

  styleUp(elem) {
    elem.classList.add("kb-key-up");
    elem.classList.remove("kb-key-down");
  }

  styleDown(elem) {
    elem.classList.remove("kb-key-up");
    elem.classList.add("kb-key-down");
  }
}