$(document).ready(function(){
  ko.extenders.measurement = function(target, param) {
    var result = ko.pureComputed({
        read: target,
        write: function(newValue) {
            var current = target();
            if (newValue !== current) {
                target(newValue);
                param.on_change();
            }
        }
    }).extend({ notify: 'always' });

    //initialize with current value to make sure it is rounded appropriately
    result(target());

    //return the new computed observable
    return result;
  };

  ko.extenders.quantity = function(target, param) {
    var result = ko.pureComputed({
        read: target,
        write: function(newValue) {
            var current = target();
            var newValueAsNum = isNaN(newValue) ? 0 : parseFloat(+newValue);
            var valueToWrite = newValueAsNum;
            if (valueToWrite !== current) {
                target(valueToWrite);
                param.on_change();
            } else {
                if (newValue !== current) {
                    target.notifySubscribers(valueToWrite);
                    param.on_change();
                }
            }
        }
    }).extend({ notify: 'always' });

    //initialize with current value to make sure it is rounded appropriately
    result(target());

    //return the new computed observable
    return result;
  };
});