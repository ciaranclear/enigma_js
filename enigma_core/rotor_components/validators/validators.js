

export function validRingCharacters(ringCharacters) {
  function counter(arr, val) {
    let n = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === val) {
        n++;
      }
    }
    return n;
  }
    
  if (!Array.isArray(ringCharacters)) {
    console.log(ringCharacters);
    throw new Error(this.deviceId + " ring character array must be an array");
  } else if (ringCharacters.length !== this.characterSet.length) {
    throw Error(this.deviceId + " ring character array is length "
                + ringCharacters.length + ". Must be length "
                + this.characterSet.length);
  } else if (new Set(ringCharacters).size !== this.characterSet.length) {
    const repeated = (function(arr) {
      let repeats = [];
      for (let i = 0; i < arr.length; i++) {
        if (counter(arr, arr[i]) > 1) {
          repeats.push(arr[i]);
        }
      }
      return repeats;
    })(ringCharacters);
    throw new Error(this.device_type
                    + " ring character array has repeated characters "
                    + repeated + ". All characters must be unique."); 
  }
  return ringCharacters;
}

export function validTurnoverCharacters(turnoverCharacters) {
  turnoverCharacters = (function(arr) {
    const newArr = [];
    for (let i = 0; i < arr.length; i++) {
      newArr.push(arr[i].toUpperCase());
    }
    return newArr;
  })(turnoverCharacters);

  for (let i = 0; i < turnoverCharacters.length; i++) {
    let char = turnoverCharacters[i];
    if (!this.characterSet.includes(char)) {
      const id = (this.deviceId === '' ? ' ' : ' ' + this.deviceId + ' ');
      throw new Error("Rotor" + id + " turnover character error "
                      +"'" + char + "' not in ring characters list.");
    }
  }
  const chars = [];
  for (let i = 0; i < turnoverCharacters.length; i++) {
    let index = this.characterSet.indexOf(turnoverCharacters[i]);
    chars.push(this.rngChrs[index]);
  }
  return chars;
}

export function validWiringCharacters(wiringCharacters) {
  if (!Array.isArray(wiringCharacters)) {
    throw new Error(this.deviceId + " wiring character array must be an array");
  } else if (wiringCharacters.length !== this.characterSet.length) {
    throw Error(this.deviceId + " wiring character array is length "
                  + wiringCharacters.length + ". Must be length "
                  + this.characterSet.length);
  }
  for (let i = 0; i < wiringCharacters.length; i++) {
    const char = wiringCharacters[i];
    wiringCharacters[i] = char.toUpperCase();
  }
  for (let i = 0; i < this.characterSet.length; i++) {
    const char = this.characterSet[i];
    if (!wiringCharacters.includes(char)) {
      throw new Error(this.deviceId + " wire list does not contain "
                                    + "required character " + char);
    } else if (!this.selfWired && wiringCharacters[i] === char) {
      throw new Error("Wire Error! " + this.deviceId + " character " + char 
                      + " is self wired at index " + i);
    }
  }
  return wiringCharacters;
}