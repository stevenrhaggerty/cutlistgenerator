$(document).ready(function(){

  function Cut(parent) {
    var cut = this;
    this.cut_length = ko.observable('0').extend({ 
        measurement:{
          on_change:function(){ parent.calculateTotalCuts(); }
        } 
      });

    this.cut_quantity = ko.observable('1').extend({ 
        quantity:{
          on_change:function(){ parent.calculateTotalCuts(); }
        } 
      });

    this.cut_name = ko.observable('');
  };

  function Board(parent) {
    var board;
    
    this.board_length = ko.observable('0').extend({ 
        measurement:{
          on_change:function(){ parent.calculateTotalBoards(); }
        } 
      });

    this.board_quantity = ko.observable('1').extend({ 
        quantity:{
          on_change:function(){ parent.calculateTotalBoards(); }
        } 
      });
  };

  function AppViewModel() {
    var self = this;
    this.kind = ko.observable('least waste');
    this.status = ko.observable('');
    this.cuts = ko.observableArray();
    this.available_boards = ko.observableArray();
    this.cut_length = ko.observable(0);
    this.cut_length_inches = 0;
    this.available_board_length = ko.observable(0);
    this.available_board_length_inches = 0;

    this.final_out = ko.observableArray();

    this.addAvailableBoard = function() {
      this.available_boards.push(new Board(self));
    };

    this.addCut = function() {
      self.cuts.push(new Cut(self));
    };

    this.calculateTotalBoards = function() {
      var fractional_sum = to_fractional_units('0 in');
      for(var i = 0; i < self.available_boards().length; ++i) {
        try {
          var fractional_length = to_fractional_units(self.available_boards()[i].board_length());
          var fractional_inches = fractional_units_to_inches(fractional_length);
          var q = self.available_boards()[i].board_quantity();
          fractional_sum = add_fractional_units(fractional_sum, to_fractional_units((fractional_inches * q) + 'in') );
        }
        catch(e) {
          console.log(e);
        }
      }
      self.available_board_length_inches = fractional_units_to_inches(fractional_sum);
      self.available_board_length(fractional_units_to_string(fractional_sum));
      self.updateStatus();
    };

    this.calculateTotalCuts = function() {
      var fractional_sum = to_fractional_units('0 in');
      for(var i = 0; i < self.cuts().length; ++i) {
        try {
          var fractional_length = to_fractional_units(self.cuts()[i].cut_length());
          var fractional_inches = fractional_units_to_inches(fractional_length);
          var q = self.cuts()[i].cut_quantity();
          fractional_sum = add_fractional_units(fractional_sum, to_fractional_units((fractional_inches * q) + 'in') );
        }
        catch(e) {
          console.log(e);
        }
      }
      self.cut_length_inches = fractional_units_to_inches(fractional_sum);
      self.cut_length(fractional_units_to_string(fractional_sum));
      self.updateStatus();
    };

    this.updateStatus = function() {
      var total_available = self.available_board_length_inches;
      var total_cuts = self.cut_length_inches;
      self.final_out().length = 0;
      if(isNaN(total_available)) {
        self.status('cannot understand the input text in available boards');
        return;
      }
      if(isNaN(total_cuts)) {
        self.status('cannot understand the input text in cuts');
        return;
      }
      if(total_available <= 0) {
        self.status('no boards available');
        return;
      }
      if(total_cuts <= 0) {
        self.status('no cuts to make');
        return;
      }
      if(total_cuts > total_available) {
        self.status('not enough available wood');
        return;
      }

      var solved = [];
      // some mutable copies to work with
      var available_boards = [];
      var cuts = [];
      // the arrays as input
      var raw_available_boards = self.available_boards();
      var raw_cuts = self.cuts();

      for(var i = 0; i < raw_available_boards.length; ++i) {
        var quantity = raw_available_boards[i].board_quantity();
        var board_length = 0;
        try {
          board_length = fractional_units_to_inches(to_fractional_units(raw_available_boards[i].board_length()));
          for(var j = 0; j < quantity; ++j) {
            available_boards.push({value: board_length, source: raw_available_boards[i]});
          }
        }
        catch(e) {
          console.log(e);
        }
      }

      for(var i = 0; i < raw_cuts.length; ++i) {
        var quantity = raw_cuts[i].cut_quantity();
        var cut_length = 0;
        try {
          cut_length = fractional_units_to_inches(to_fractional_units(raw_cuts[i].cut_length()));
          for(var j = 0; j < quantity; ++j) {
            cuts.push({initial_value: cut_length, value: cut_length, source:raw_cuts[i]});
          }
        }
        catch(e) {
          console.log(e);
        }
      }

      available_boards.sort(function(a, b) { return a.value >= b.value; });
      cuts.sort(function(a, b) { return a.value >= b.value; });

      for(var i = 0; i < available_boards.length; ++i) {
        var solution = {board_length:available_boards[i].source.board_length(), remaining:available_boards[i].value, included:[]};

        for(var j = 0; j < cuts.length; ++j) {
          if(cuts[j].value > 0 && cuts[j].value <= solution.remaining) {
            solution.remaining -= cuts[j].value;
            solution.included.push(cuts[j]);
            cuts[j].value = -1;
          }
        }
        try {
          solution.remaining = fractional_units_to_string(to_fractional_units(solution.remaining + 'in'));
          var pretty_length = fractional_units_to_string(to_fractional_units(available_boards[i].value + 'in'))
          if(solution.board_length != pretty_length) {
            solution.board_length = solution.board_length + ' <' + pretty_length + '>'
          }
          for(var j = 0; j < solution.included.length; ++j) {
            var pretty_cut = fractional_units_to_string(to_fractional_units(solution.included[j].initial_value + 'in'))
            var raw_cut = solution.included[j].source.cut_length();
            var name = solution.included[j].source.cut_name();
            if(name != null && name.length > 0) {
                name += ' ';
            } else {
              name = '';
            }
            if(raw_cut != pretty_cut) {
              solution.included[j] = {cut: name + raw_cut + ' <' + pretty_cut + '>'};
            } else {
              solution.included[j] = {cut: name + raw_cut};
            }
            //solution.included[j] = solution.included;
          }
        }
        catch(e) {
          console.log(e);
        }
        solved.push(solution);
      }

      for (var i = 0; i < solved.length; i++) {
        self.final_out.push(solved[i]);
      };

      self.status('looks good!');
     }

     this.addAvailableBoard();
     this.addCut();
     this.updateStatus();
  };

  // Activates knockout.js
  ko.applyBindings(new AppViewModel());

});