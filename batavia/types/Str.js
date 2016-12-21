var Buffer = require('buffer').Buffer;

var constants = require('../core').constants;
var Type = require('../core').Type;
var exceptions = require('../core').exceptions;
var type_name = require('../core').type_name;
var None = require('../core').None;

/*************************************************************************
 * Modify String to behave like a Python String
 *************************************************************************/

var Str = String;

Str.prototype.__class__ = new Type('str');

/**************************************************
 * Type conversions
 **************************************************/

Str.prototype.__bool__ = function() {
    return this.length > 0;
}

Str.prototype.__iter__ = function() {
    return new Str.prototype.StrIterator(this);
}

Str.prototype.__repr__ = function() {
    // we have to replace all non-printable characters
    return "'" + this.toString()
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\x7F/g, "\\x7f")
        .replace(/[\u0000-\u001F]/g, function (match) {
            var code = match.charCodeAt(0);
            switch (code) {
            case 9:
                return "\\t";
            case 10:
                return "\\n";
            case 13:
                return "\\r";
            default:
                var hex = code.toString(16);
                if (hex.length == 1) {
                  hex = "0" + hex;
                }
                return "\\x" + hex;
            }
        }) + "'";
}

Str.prototype.__str__ = function() {
    return this.toString();
}

/**************************************************
 * Attribute manipulation
 **************************************************/

Str.prototype.__getattr__ = function(attr) {
    if (this[attr] === undefined) {
        throw new exceptions.AttributeError("'str' object has no attribute '" + attr + "'");
    }
    return this[attr];
}

Str.prototype.__setattr__ = function(attr, value) {
    if (this.__proto__[attr] === undefined) {
        throw new exceptions.AttributeError("'str' object has no attribute '" + attr + "'");
    } else {
        throw new exceptions.AttributeError("'str' object attribute '" + attr + "' is read-only");
    }
}



/**************************************************
 * Comparison operators
 **************************************************/

Str.prototype.__lt__ = function(other) {
    var types = require('../types');

    if (other !== None) {
        if (types.isinstance(other, [
                    types.Bool, types.Int, types.Float,
                    types.List, types.Dict, types.Tuple,
                    types.Bytearray, types.Bytes, types.Type,
                    types.Complex, types.NotImplementedType,
                    types.Range, types.Set, types.Slice,
                    types.FrozenSet
                ])) {
            throw new exceptions.TypeError("unorderable types: str() < " + type_name(other) + "()");
        } else {
            return this.valueOf() < other;
        }
    } else {
        throw new exceptions.TypeError("unorderable types: str() < NoneType()");
    }
}

Str.prototype.__le__ = function(other) {
    var types = require('../types');

    if (other !== None) {
        if (types.isinstance(other, [
                    types.Bool, types.Int, types.Float,
                    types.List, types.Dict, types.Tuple,
                    types.Set, types.Bytearray, types.Bytes,
                    types.Type, types.Complex, types.NotImplementedType,
                    types.Range, types.Slice, types.FrozenSet
                ])) {
            throw new exceptions.TypeError("unorderable types: str() <= " + type_name(other) + "()");
        } else {
            return this.valueOf() <= other;
        }
    } else {
        throw new exceptions.TypeError("unorderable types: str() <= NoneType()");
    }
}

Str.prototype.__eq__ = function(other) {
    var types = require('../types');

    if (other !== None) {
        if (types.isinstance(other, [
                    types.Bool, types.Int, types.Float,
                    types.List, types.Dict, types.Tuple
                ])) {
            return false;
        } else {
            return this.valueOf() === other.valueOf();
        }
    } else {
        return false;
    }
}

Str.prototype.__ne__ = function(other) {
    var types = require('../types');

    if (other !== None) {
        if (types.isinstance(other, [
                    types.Bool, types.Int, types.Float,
                    types.List, types.Dict, types.Tuple

                ])) {
            return true;
        } else {
            return this.valueOf() !== other.valueOf();
        }
    } else {
        return true;
    }
}

Str.prototype.__gt__ = function(other) {
    var types = require('../types');

    if (other !== None) {
        if (types.isinstance(other, [
                    types.Bool, types.Int, types.Float,
                    types.List, types.Dict, types.Tuple,
                    types.Set, types.Bytearray, types.Bytes,
                    types.Type, types.Complex,
                    types.NotImplementedType, types.Range,
                    types.Slice, types.FrozenSet
                ])) {
            throw new exceptions.TypeError("unorderable types: str() > " + type_name(other) + "()");
        } else {
            return this.valueOf() > other;
        }
    } else {
        throw new exceptions.TypeError("unorderable types: str() > NoneType()");
    }
}

Str.prototype.__ge__ = function(other) {
    var types = require('../types');

    if (other !== None) {
        if (types.isinstance(other, [
                    types.Bool, types.Int, types.Float,
                    types.List, types.Dict, types.Tuple,
                    types.Set, types.Bytearray, types.Bytes,
                    types.Type, types.Complex, types.NotImplementedType,
                    types.Range, types.Slice, types.FrozenSet

                ])) {
            throw new exceptions.TypeError("unorderable types: str() >= " + type_name(other) + "()");
        } else {
            return this.valueOf() >= other;
        }
    } else {
        throw new exceptions.TypeError("unorderable types: str() >= NoneType()");
    }
}

Str.prototype.__contains__ = function(other) {
    return false;
}

/**************************************************
 * Unary operators
 **************************************************/

Str.prototype.__pos__ = function() {
    throw new exceptions.TypeError("bad operand type for unary +: 'str'");
}

Str.prototype.__neg__ = function() {
    throw new exceptions.TypeError("bad operand type for unary -: 'str'");
}

Str.prototype.__not__ = function() {
    return this.length == 0;
}

Str.prototype.__invert__ = function() {
    throw new exceptions.TypeError("bad operand type for unary ~: 'str'");
}

/**************************************************
 * Binary operators
 **************************************************/

Str.prototype.__pow__ = function(other) {
    throw new exceptions.TypeError("unsupported operand type(s) for ** or pow(): 'str' and '"+ type_name(other) + "'");
}

Str.prototype.__div__ = function(other) {
    return this.__truediv__(other);
}

Str.prototype.__floordiv__ = function(other) {
    var types = require('../types');

    if (types.isinstance(other, [types.Complex])){
        throw new exceptions.TypeError("can't take floor of complex number.")
    } else {
        throw new exceptions.TypeError("unsupported operand type(s) for //: 'str' and '" + type_name(other) + "'");
    }
}

Str.prototype.__truediv__ = function(other) {
    throw new exceptions.TypeError("unsupported operand type(s) for /: 'str' and '" + type_name(other) + "'");
}

Str.prototype.__mul__ = function(other) {
    var types = require('../types');

    var result;
    if (types.isinstance(other, types.Int)) {
        result = '';
        for (var i = 0; i < other.valueOf(); i++) {
            result += this.valueOf();
        }
        return result;
    } else if (types.isinstance(other, types.Bool)) {
        result = other === true ? this.valueOf() : '';
        return result;
    } else {
        throw new exceptions.TypeError("can't multiply sequence by non-int of type '" + type_name(other) + "'");
    }
}


function _substitute(format, args){
  var types = require('../types');
  var workingArgs = args.slice();

  function Specfier(fullText, index, args){
    // fullText (str): full specifier including %
    // index: starting index in the format string
    // args: the remaining available arguments in the conversion

    // returns object containing the specifier object and the remaining unused arguments

    // ORDER OF SPECIFIERS
    // 0) The '%' character, which marks the start of the specifier.
    // 1) Mapping key (optional), consisting of a parenthesised sequence of characters (for example, (somename)).
    // 2) Conversion flags (optional), which affect the result of some conversion types.
      // # the value conversion will use the "alternate form" (where defined below) specific alternate form differs by conversion type
      // '0' conversion is 0 padded for numerics
      // - conversion is left adjusted (overrides 0)
      // ' '(space) a blank should be left before positive number or empty string produced by sign conversion
      // '+' positive or negative will precede the conversion (overrides space)


    // 3) Minimum field width (optional). If specified as an '*' (asterisk), the actual width is read from the next element of the tuple in values, and the object to convert comes after the minimum field width and optional precision.
    // 4) Precision (optional), given as a '.' (dot) followed by the precision. If specified as '*' (an asterisk), the actual width is read from the next element of the tuple in values, and the value to convert comes after the precision.
    // 5) Length modifier (optional). IGNORED IN PYTHON
    // 6) Conversion type.

    this.fullText = fullText; // full text starting with %
    this.index = index; // its position in the format string

    // exceptions are thrown like this:
      // scan one character at a time
      // if its illegal, throw that error! -> unsupported character
      // if its '*' there needs to be at least 2 args left (one for the * and another for the conversion)
      // if its a conversion there needs to be atleast one left

    this.remainingArgs = args.slice();  // as args are needed, shift them from this array, then return what's left
    this.args = []; // args to be used by this specifier


    // this.foundArg = function(){
    //   // this ALMOST works. It throws an error when we hit one too many spaces
    //   // but when we come across a '*' we had better not have used up our last argument!
    //
    //   // if its a '*' we need one more
    //   // if its a conversion type we can use the last one.
    //
    //   this.argCount++;
    //   if (this.argCount > this.maxArgs){
    //     throw new exceptions.TypeError("not enough arguments for format string")
    //   }
    // }

    // PARSED DATA FOR SPECIFIER

    this.conversionFlags = {
      '#': false,
      '0': false,
      '-': false,
      ' ': false,
      '+': false
    };

    this.fieldWidth = {
      value: '',
      numeric: null
    }

    this.percision = {
      value: '',
      numeric: null
    }

    this.getNextStep = function(nextChar, currStep){
      // nextChar(str): the next character to be processed
      // currSte(int): the current step we are on.
      // return: nextStep(int): what step we should process nextChar on

      var steps = {
        // regex to search for the FIRST character in each step
        2: /[#0-\s\+]/, // conversion flags
        3: /[\d\*]/, // min field width
        4: /[\d\*\.]/, // percision
        5: /[hHl]/, // length modifier (not used)
        6: /[diouxXeEfFgGcrs]/ // conversion type
      }

      for (var s=currStep; s<=6; s++){
        // try to make a match
        var re = steps[s];
        if (nextChar.search(re) !== -1){
          return s
        }
      }

      // getting here means its an illegal character!
      throw new Error("illegal character")
    }

    this.step = function(char, step){
      // nextChar(str): the next character to be processed
      // nextChar is processed under the appropriate step number.

      // role step into one function, not object of function
      switch(step){

        case 2:
          // conversion flags
          switch(char){

            case '#':
              this.conversionFlags['#'] = true;
              break;

            case '0':
              // '-' overrides '0'.
              if (!this.conversionFlags['-']) {
                this.conversionFlags['0'] = true;
              };
              break;

            case '-':
              this.conversionFlags['-'] = true;
              this.conversionFlags['0'] = false;
              break;

            case ' ':
              // '+' overrides ' '
              if (!this.conversionFlags['+']) {
                this.conversionFlags[' '] = true
              };
              break;

            case '+':
              this.conversionFlags['+'] = true;
              this.conversionFlags[' '] = false;
              break;

            default:
              /* this isn't a python error. I'm just throwing an exception to the
              * caller that the conversion flag isn't legal
              */
              throw new Error("illegal character")
          } // end inner switch 2
          break;

        case 3:
          // min field width
          if (char === '*'){
            // there needs to be atleast two args available
            // (one for this, another for the conversion)

            // can't be using numerics or have another * already
            if (this.fieldWidth.value === '' && this.fieldWidth.numeric === null){

              var arg = this.remainingArgs.shift(); // grab an arg

              // arg must be an int
              if ( !types.isinstance(arg, types.Int) ){
                throw new exceptions.TypeError("* wants int")
              }

              // need to have at least one arg left
              if ( this.remainingArgs.length === 0 ){
                throw new exceptions.TypeError("not enough arguments for format string")
              }
              this.args.push(arg);

              this.fieldWidth.value = "*";
              this.fieldWidth.numeric = false;
            } else {
              console.log("illegal character at step 3")
              throw new Error("illegal character")
            }

          } else if (!isNaN(char)){
            // value is numeric
            if ( this.fieldWidth.numeric != false ){

              // assign if null else concatentate
              this.fieldWidth.value += char;
              this.fieldWidth.numeric = true;
            } else {
              console.log("illegal character at step 3")
              throw new Error("illegal character")
            }
          } else {
            throw new Error("illegal character")
          } // end if
          break;

        case 4:
          // percision
          if (char === '*'){
            // can't be using numerics or have another * already
            if (this.percision.value === '' && this.percision.numeric === undefined){

              var arg = this.remainingArgs.shift(); // grab an arg

              // arg must be an int
              if ( !types.isinstance(arg, types.Int) ){
                throw new exceptions.TypeError("* wants int")
              }

              // need to have at least one arg left
              if ( this.remainingArgs === [] ){
                throw new exceptions.TypeError("not enough arguments for format string")
              }
              this.args.push(arg);

              this.percision.value = "*";
              this.percision.numeric = false;
            } else {
              console.log("illegal character at step 4")
              throw new Error("illegal character")
            }

          } else if ( !isNaN(char) ){
            // value is numeric
            if ( this.percision.numeric != false ){

              // assign if null else concatentate
              this.percision.value += char;
              this.percision.numeric = true;
            } else {
              throw new Error("illegal character")
            }
          } else if (char !== '.') {
            throw new Error("illegal character")
          };
          break;

        case 5:
          // length modifier. Skip!
          break;

        case 6:
          // conversion type

          var arg = this.remainingArgs.shift(); // grab an arg
          if ( this.remainingArgs === [] ){
            throw new exceptions.TypeError("not enough arguments for format string")
          }
          this.args.push(arg);
          this.conversionType = char;
          break;

      } // end switch

    } // end this.step

    this.transform = function(){
      // // valid arg types for each conversion
      function validateType(arg, conversion){
        // arg: the arg to be subsituted in
        // conversion(str): the type of conversion to perform
        // throws an error if the arg is an invalid type


        // TODO: THESE WON'T BE BATAVIA TYPES! VALIDATE THEM AS NATIVE TYPES.
        if ( /[diouxXeE]/.test(conversion) ){

          if ( !types.isinstance(arg, [types.Int, types.Float]) ){
            throw new exceptions.TypeError(`%${conversion} format: a number is required, not str`)
          }
        } else if ( /[fFgG]/.test(conversion)   ){
          if ( !types.isinstance(arg, [types.Float]) ){
            throw new exceptions.TypeError("a float is required")
          }
        } else if ( conversion === 'c' ){
          // this might be an error in C Python but floats ARE allowed.
          //  multi character strings are not allowed
          if ( types.isinstance(arg, types.Str) && arg.valueOf().length > 1 ){
            throw new exceptions.TypeError("%c requires int or char")
          }
        }

        // conversion types s and r are ok with anything
      } // end validateType

      // returns the substituted string

      workingArgs = this.args.slice();

      if ( this.fieldWidth.value === '*' ){
        minWidth = workingArgs.shift().valueOf();
      } else if ( !isNaN(this.fieldWidth.value ) ){
        minWidth = Number(this.fieldWidth.value);
      } else {
        minWidth = 0;
      }

      if ( this.percision.value === '*' ){
        percision = workingArgs.shift().valueOf();
      } else if ( !isNaN(this.percision.value ) ){
        percision = Number(this.percision.value);
      } else {
        percision = 0;
      }

      conversionArgRaw = workingArgs.shift(); // the python representation of the arg
      validateType(conversionArgRaw, this.conversionType);

      conversionArgValue = conversionArgRaw.valueOf(); // the native type

      switch(this.conversionType){
        // handle the #

        case('d'):
        case('i'):
        case('u'):
          var conversionArg = parseInt(conversionArgValue);
          break;

        case('o'):
          var base = parseInt(Math.abs(conversionArgValue)).toString(8);
          if (this.conversionFlags['#']){
            var conversionArg = '0o' + base;
          } else {
            var conversionArg = base;
          }
          break;

        case('x'):
        case('X'):
          var base = this.conversionType == 'x' ?
            parseInt(conversionArgValue).toString(16) :
            parseInt(conversionArgValue).toString(16).toUpperCase()
          if (this.conversionFlags('#')){
            var conversionArg = '0' + this.conversionType +  base;
          } else {
            var conversionArg = base;
          }
          break;

        case('e'):
        case('E'):
          // toExponential() will almost work here, but the digit here
          // has a minimum of 1 zero pad
          // example: 5 = '5.000000e+00'

          var baseExpSplit = conversionArgValue.valueOf().toExponential(6).split(/e[\+\-]/);
          if ( baseExpSplit[1].length === 1 ){
            baseExpSplit[1] = '0' + baseExpSplit[1]
          }

          var conversionArg = this.conversionType === 'e' ?
            baseExpSplit.join('+e') :
            baseExpSplit.join('+E')
          break;

        case('g'):
        case('G'):
          var conversionExp = conversionArgValue.toExponential(6);
          baseExpSplit = conversionExp.split(/e[\+\-]/)
          var exp = Number(baseExpSplit[1]);
          if ( exp < -4 || !exp < percision){
            // use exponential
            if ( baseExpSplit[1].length === 1 ){
              baseExpSplit[1] = '0' + baseExpSplit[1]
            }


            var conversionArg = this.conversionType === 'g' ?
              baseExpSplit.join('+e') :
              baseExpSplit.join('+E')
          } else {
            // don't use exponential

            if (this.conversionFlags['#']){
              // The alternate form causes the result to always contain a
              // decimal point, and trailing zeroes are not removed as they
              // would otherwise be.

              // The precision determines the number of significant digits
              //before and after the decimal point and defaults to 6.

              var beforeDecimal = Math.floor(conversionArgValue);
              var afterDecimal = conversionArgValue % 1;
              var afterDecimalLen = this.percision.value !== '' ?
                percision - String(beforeDecimal).length : 6;

              var numExtraZeros = afterDecimalLen - String(afterDecimal).length;
              var conversionArg = `${beforeDecimal}.${afterDecimal + '0'.repeat(numExtraZeros)}`

            } else {

              var conversionArg = conversionArgValue;
            }
          } // outer if
          break;
        case('f'):
        case('F'):
          conversionArg = conversionArgValue.toFixed(6);
          break;

        case('c'):

        case('r'):

        case('s'):

      } // end switch

      // only do the below for numbers
      if ( typeof conversionArgValue === 'number' ){
        if ( this.conversionFlags[' '] ) {
          // A blank should be left before a positive number (or empty string)
          // produced by a signed conversion.
          conversionArg = conversionArgValue >= 0 ?
          ` ${conversionArg}` : `-${conversionArg}`;
        } else if ( this.conversionFlags['+'] ){
          // sign character should proceed the conversion
          conversionArg = conversionArgValue >= 0 ?
          `+${conversionArg}` : `-${conversionArg}`;
        }
      }

      var cellWidth = Math.max(minWidth, percision, conversionArg.length);

      var padSize = cellWidth - conversionArg.length;
      var percisionPaddingSize = (percision - conversionArg.length) > 0 ?
        percision - conversionArg.length : 0;
      var whiteSpaceSize = cellWidth - percisionPaddingSize - conversionArg.length;

      if ( this.conversionFlags['0'] ){
        // example: '00005'
        retVal = '0'.repeat(padSize) + conversionArg

      } else if ( this.conversionFlags['-'] ){
        // exmaple:  '00005     '
        retVal = '0'.repeat(percisionPaddingSize) + conversionArg + ' '.repeat(whiteSpaceSize)
      } else {
        // example: '   0005'
        retVal = ' '.repeat(whiteSpaceSize) + '0'.repeat(percisionPaddingSize) + conversionArg
      }

      return retVal;


    } // end transform

    function* getChar(str){
      // str: full text of specifier (including %)

      // return structure: { value: { char: 's', index: 1 }, done: false }

      var charArray = str.slice(1).split('')
      index = 0;
      while(index < charArray.length){
        obj = {
          char: charArray[index++],
          index: index
        }
        yield obj;
      }

    }

    charGen = getChar(this.fullText);
    charObj = charGen.next();
    var nextStep = 2

    // SPECIFIER MAIN LOOP
    while(charObj.value){
      var nextChar = charObj.value.char
      try {

        var nextStep = this.getNextStep(nextChar, nextStep)
        this.step(nextChar, nextStep)
      } catch(err){
        var charAsHex = nextChar.charCodeAt(0).toString(16)
        if (err.message === 'illegal character'){
          throw new exceptions.ValueError(`unsupported format character '${nextChar}' (0x${charAsHex}) at index ${charObj.value.index}`)
        } else {
          //its some other error
          throw err
        }
      }
      charObj = charGen.next()
    }

  } // END SPECIFIER

  function* getSpecifier(str){
    // str: a string with potential specifiers
    // a generator for possible specifiers in str

    // solution for regex http://stackoverflow.com/questions/41022735/regex-word-must-end-with-one-of-given-characters/41022892#41022892
    const re = /%+[^%]*?[diouxXeEfFgGcrs]/g
    while(true){
      match = re.exec(str)
      if (match === null){
        break;
      }
      specifier = {
        posSpec: match[0],
        index: match.index // location of the specifier in the format string
      }
      yield specifier;
    } // while loop
  } // end getSpecifier

  // var specGen = getSpecifier(format);
  // // get value with specGen.next().value
  // var spec = specGen.next().value;

  // grab specifiers one at a time


  specGen = getSpecifier(format)

  result = '';
  lastStop = 0

  spec = specGen.next().value
  while(spec){
    // grab everything between lastStop and current spec start
    result += format.slice(lastStop, spec.index);
    // parse the specifier
    var specObj = new Specfier(spec.posSpec, spec.index, workingArgs);
    // do the substitution
    result += specObj.transform();
    // update end of current specifier
    lastStop = spec.index + spec.posSpec.length;
    workingArgs = specObj.remainingArgs;
    spec = specGen.next().value;
  }

  if ( workingArgs.length !== 0 ){
    throw new exceptions.TypeError("not all arguments converted during string formatting")
  }

  // get the last part of the string
  result += format.slice(lastStop, format.length)
  return result;

} // end _substitute


Str.prototype.__mod__ = function(other) {
    var types = require('../types');

    if (types.isinstance(other, types.Tuple)) {
        return _substitute(this, other);
    } else {
        return _substitute(this, [other]);
    }
}

Str.prototype.__add__ = function(other) {
    console.log("hello from __mod__")
    var types = require('../types');

    if (types.isinstance(other, Str)) {
        return this.valueOf() + other.valueOf();
    } else {
        throw new exceptions.TypeError("Can't convert '" + type_name(other) + "' object to str implicitly");
    }
}

Str.prototype.__sub__ = function(other) {
    throw new exceptions.TypeError("unsupported operand type(s) for -: 'str' and '" + type_name(other) + "'");
}

Str.prototype.__getitem__ = function(index) {
    var types = require('../types');

    if (types.isinstance(index, types.Bool)) {
        index = index.__int__();
    }
    if (types.isinstance(index, types.Int)) {
        var idx = index.int32();
        if (idx < 0) {
            if (-idx > this.length) {
                throw new exceptions.IndexError("string index out of range");
            } else {
                return this[this.length + idx];
            }
        } else {
            if (idx >= this.length) {
                throw new exceptions.IndexError("string index out of range");
            } else {
                return this[idx];
            }
        }
    } else if (types.isinstance(index, types.Slice)) {
        var start, stop, step;
        start = index.start === null ? undefined : index.start.valueOf();
        stop = index.stop === null ? undefined : index.stop.valueOf();
        step = index.step.valueOf();

        if (step === 0) {
            throw new exceptions.ValueError("slice step cannot be zero");
        }

        // clone string
        var result = this.valueOf();

        // handle step
        if (step === undefined || step === 1) {
            return result.slice(start, stop);
        } else if (step > 0) {
            result = result.slice(start, stop);
        } else if (step < 0) {
            // adjust start/stop to swap inclusion/exlusion in slice
            if (start !== undefined && start !== -1) {
                start = start + 1;
            } else if (start === -1) {
                start = result.length;
            }
            if (stop !== undefined && stop !== -1) {
                stop = stop + 1;
            } else if (stop === -1) {
                stop = result.length;
            }

            result = result.slice(stop, start).split('').reverse().join('');
        }

        var steppedResult = "";
        for (var i = 0; i < result.length; i = i + Math.abs(step)) {
            steppedResult += result[i];
        }

        result = steppedResult;

        return result;
    } else {
        throw new exceptions.TypeError("string indices must be integers");
    }
}

Str.prototype.__lshift__ = function(other) {
    throw new exceptions.TypeError(
        "unsupported operand type(s) for <<: 'str' and '" + type_name(other) + "'"
    );
}

Str.prototype.__rshift__ = function(other) {
    throw new exceptions.TypeError(
        "unsupported operand type(s) for >>: 'str' and '" + type_name(other) + "'"
    );
}

Str.prototype.__and__ = function(other) {
    throw new exceptions.TypeError(
        "unsupported operand type(s) for &: 'str' and '" + type_name(other) + "'"
    );
}

Str.prototype.__xor__ = function(other) {
    throw new exceptions.TypeError(
        "unsupported operand type(s) for ^: 'str' and '" + type_name(other) + "'"
    );
}

Str.prototype.__or__ = function(other) {
    throw new exceptions.TypeError(
        "unsupported operand type(s) for |: 'str' and '" + type_name(other) + "'"
    );
}

/**************************************************
 * Inplace operators
 **************************************************/

Str.prototype.__ifloordiv__ = function(other) {
    var types = require('../types');

    if (types.isinstance(other, [types.Complex])){
        throw new exceptions.TypeError("can't take floor of complex number.")
    } else {
        throw new exceptions.TypeError("unsupported operand type(s) for //=: 'str' and '" + type_name(other) + "'");
    }
}

Str.prototype.__itruediv__ = function(other) {

    throw new exceptions.TypeError("unsupported operand type(s) for /=: 'str' and '" + type_name(other) + "'");
}

Str.prototype.__iadd__ = function(other) {
    var types = require('../types');

    if (types.isinstance(other, Str)) {
        return this.valueOf() + other.valueOf();
    } else {
        throw new exceptions.TypeError("Can't convert '" + type_name(other) + "' object to str implicitly");
    }
}

Str.prototype.__isub__ = function(other) {
    throw new exceptions.TypeError("unsupported operand type(s) for -=: 'str' and '" + type_name(other) + "'");
}

Str.prototype.__imul__ = function(other) {
    return this.__mul__(other);
};

Str.prototype.__imod__ = function(other) {
    var types = require('../types');

    if (types.isinstance(other, [
            types.Bool,
            types.Float,
            types.FrozenSet,
            types.Int,
            types.NoneType,
            types.Set,
            Str,
            types.Tuple
        ])) {
        throw new exceptions.TypeError("not all arguments converted during string formatting");
    } else {
        throw new exceptions.NotImplementedError("str.__imod__ has not been implemented");
    }
}

Str.prototype.__ipow__ = function(other) {
    throw new exceptions.TypeError("unsupported operand type(s) for ** or pow(): 'str' and '" + type_name(other) + "'");
};

Str.prototype.__ilshift__ = function(other) {
    throw new exceptions.TypeError(
        "unsupported operand type(s) for <<=: 'str' and '" + type_name(other) + "'"
    )
}

Str.prototype.__irshift__ = function(other) {


    throw new exceptions.TypeError("unsupported operand type(s) for >>=: 'str' and '" + type_name(other) + "'");
}

Str.prototype.__iand__ = function(other) {

    throw new exceptions.TypeError("unsupported operand type(s) for &=: 'str' and '" + type_name(other) + "'");
};

Str.prototype.__ixor__ = function(other) {

    throw new exceptions.TypeError("unsupported operand type(s) for ^=: 'str' and '" + type_name(other) + "'");
}

Str.prototype.__ior__ = function(other) {
    throw new exceptions.TypeError("unsupported operand type(s) for |=: 'str' and '" + type_name(other) + "'");
};

/**************************************************
 * Methods
 **************************************************/

Str.prototype.join = function(iter) {
    var types = require('../types');

    var l = new types.List(iter);
    for (var i = 0; i < l.length; i++) {
        if (!types.isinstance(l[i], Str)) {
            throw new exceptions.TypeError("sequence item " + i + ": expected str instance, " + type_name(l[i]) + " found");
        }
    }
    return l.join(this);
}

/**************************************************
 * Str Iterator
 **************************************************/

Str.prototype.StrIterator = function (data) {
    Object.call(this);
    this.index = 0;
    this.data = data;
}

Str.prototype.StrIterator.prototype = Object.create(Object.prototype);

Str.prototype.StrIterator.prototype.__next__ = function() {
    var retval = this.data[this.index];
    if (retval === undefined) {
        throw new exceptions.StopIteration();
    }
    this.index++;
    return retval;
}

Str.prototype.StrIterator.prototype.__str__ = function() {
    return "<str_iterator object at 0x99999999>";
}

/**************************************************
 * Methods
 **************************************************/

Str.prototype.copy = function() {
    return this.valueOf();
}

Str.prototype.encode = function(encoding, errors) {
    var types = require('../types');

    if (errors !== undefined) {
        return new exceptions.NotImplementedError(
            "'errors' parameter of str.encode not implemented"
        );
    }
    encoding = encoding.toLowerCase();
    var encs = constants.TEXT_ENCODINGS;
    if (encs.ascii.indexOf(encoding) !== -1) {
        return new types.Bytes(
            Buffer.from(this.valueOf(), 'ascii'));
    } else if (encs.latin_1.indexOf(encoding) !== -1) {
        return new types.Bytes(
            Buffer.from(this.valueOf(), 'latin1'));
    } else if (encs.utf_8.indexOf(encoding) !== -1) {
        return new types.Bytes(
            Buffer.from(this.valueOf(), 'utf8'));
    } else {
        return new exceptions.NotImplementedError(
            "encoding not implemented or incorrect encoding"
        );
    }
}

Str.prototype.startswith = function (str) {
    var types = require('../types');

    if (str !== None) {
        if (types.isinstance(str, [types.Str])) {
            return this.slice(0, str.length) === str;
        } else {
            throw new exceptions.TypeError(
                "TypeError: startswith first arg must be str or a tuple of str, not " + type_name(str)
            );
        }
    }
}

Str.prototype.endswith = function (str) {
    return this.slice(this.length - str.length) === str;
}

// Based on https://en.wikipedia.org/wiki/Universal_hashing#Hashing_strings
// and http://www.cse.yorku.ca/~oz/hash.html.
//
// CPython returns signed 64-bit integers. But, JS is awful at 64-bit integers,
// so we return signed 32-bit integers. This shouldn't be a problem, since
// technically we can just return 0 and everything should still work :P
Str.prototype.__hash__ = function() {
    var types = require('../types');

    // |0 is used to ensure that we return signed 32-bit integers
    var h = 5381|0;
    for (var i = 0; i < this.length; i++) {
        h = ((h * 33)|0) ^ this[i];
    }
    return new types.Int(h);
}

/**************************************************
 * Module exports
 **************************************************/

module.exports = Str;
