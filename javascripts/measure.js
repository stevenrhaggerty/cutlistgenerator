// http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

// http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

  function fractional_units_to_string(fu) {
    var feet = fu.whole_feet; 
    var inches = fu.whole_inches
    var subinches = fu.partial_inches;

    if(feet <= 0 && inches <= 0 && subinches <= 0) {
      return '0 in';
    }

    feet = feet > 0 ? (format(feet) + 'ft ') : '';

    var f = math.fraction(subinches);
    if(f.d < 64 && f.n != 0 && f.d != 1) { // only print as fraction if it's not super ugly.
      var formatted_subinches = format(f);
      var all_inches = inches + subinches;
      inches = inches > 0 ? (inches + ' ') : '';

      formatted_subinches = all_inches > 0 ? (formatted_subinches + 'in') : '';

      return (feet + inches + formatted_subinches);
    }
    else {
      var all_inches = inches + subinches;
      inches = all_inches > 0 ? (format(all_inches) + 'in') : '';
      return (feet + inches);
    }
  }

  function fractional_units_to_inches(fu) {
    return (fu.whole_feet * 12) + fu.whole_inches + fu.partial_inches;
  }

  function add_fractional_units(fua, fub) {
    // todo: non lazy math
    var inches_a = fractional_units_to_inches(fua);
    var inches_b = fractional_units_to_inches(fub);
    return to_fractional_units((inches_a + inches_b) + ' in');
  }

  function to_fractional_units(raw) {
    raw = replaceAll(raw, '"', 'in');
    raw = replaceAll(raw, "'", 'ft');
    var modified_raw = '';
    var was_unit = false;
    // this is meant to handle skipping addition in fractional unit declaration (ie: 1ft 2/4in === 1ft +2/4in)
    // so far it handles the cases we want to handle, but it also handles some cases we don't want to handle
    for(var i = 0; i < raw.length; ++i) {
      switch(raw[i].toUpperCase()) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '.':
          if(was_unit) {
            modified_raw += '+';
            was_unit = false;
          }
        break;
        case 'I':
        case 'N':
        case 'C':
        case 'H':
        case 'E':
        case 'S':
        case 'F':
        case 'O':
        case 'T':
        case 'M':
        case 'R':
        case 'L':
          was_unit = true;
        break;
        case '+':
        case '/':
        case '-':
        case '*':
          was_unit = false;
        break;
      }
      modified_raw += raw[i];
    }
    raw = modified_raw;
    raw = math.eval(raw);

    var raw_unit = math.unit(raw);
    
    var as_feet = raw_unit.to('ft');
    var num_whole_feet = math.floor(as_feet.toNumber('ft')); 
    as_feet = math.unit(num_whole_feet, 'ft');

    var as_inches = raw_unit.to('in');
    as_inches = math.subtract(as_inches, as_feet);

    var num_whole_inches = math.floor(as_inches.toNumber('in'));
    var whole_inches = math.unit(num_whole_inches, 'in')
    var as_subinches = math.subtract(as_inches, whole_inches);
    var num_subinches = as_subinches.toNumber('in');

    num_whole_feet = math.round(num_whole_feet, 4);
    num_whole_inches = math.round(num_whole_inches, 4);
    num_subinches = math.round(num_subinches, 4);

    var all_inches = num_whole_inches + num_subinches;
    if(all_inches >= 12) {
      num_whole_feet += math.floor(all_inches / 12);
      all_inches = all_inches % 12;
      num_whole_inches = math.floor(all_inches);
      num_subinches = all_inches - num_whole_inches
    }

    return { whole_feet: num_whole_feet, whole_inches: num_whole_inches, partial_inches:num_subinches };
  }

  function print_fractional_units(fu) {
    console.log(fractional_units_to_string(fu));
  }

  function format (value) {
    var precision = 4;
    return math.format(value, precision);
  }