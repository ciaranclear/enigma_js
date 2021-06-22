

export class Keyboard {
  constructor(){
    this.keyboardDict = {
      'A':'A', 'B':'B', 'C':'C', 'D':'D', 'E':'E', 'F':'F',
      'G':'G', 'H':'H', 'I':'I', 'J':'J', 'K':'K', 'L':'L',
      'M':'M', 'N':'N', 'O':'O', 'P':'P', 'Q':'Q', 'R':'R',
      'S':'S', 'T':'T', 'U':'U', 'V':'V', 'W':'W', 'X':'X',
      'Y':'Y', 'Z':'Z', '1':'K', '2':'L', '3':'Z', '4':'X',
      '5':'C', '6':'V', '7':'B', '8':'N', '9':'M', '0':'J'
    };
  }

  keyboardInput(character) {
    /*
    returns a valid character else None
    */
    const validCharacter = this.keyboardDict[character.toUpperCase()];
    return (validCharacter !== undefined ? validCharacter : null);
  }
}