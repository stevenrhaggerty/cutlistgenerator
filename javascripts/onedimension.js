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
    this.available_board_length = ko.observable(0);

    this.final_out = ko.observableArray();

    this.addAvailableBoard = function() {
      this.available_boards.push(new Board(self));
    };

    this.addCut = function() {
      self.cuts.push(new Cut(self));
    };

    this.calculateTotalBoards = function() {
      var sum = 0;
      for(var i = 0; i < self.available_boards().length; ++i) {
        sum += self.available_boards()[i].board_length() * self.available_boards()[i].board_quantity();
      }
      self.available_board_length(sum);
      self.updateStatus();
    };

    this.calculateTotalCuts = function() {
      var sum = 0;
      for(var i = 0; i < self.cuts().length; ++i) {
        sum += self.cuts()[i].cut_length() * self.cuts()[i].cut_quantity();
      }
      self.cut_length(sum);
      self.updateStatus();
    };

    this.updateStatus = function() {
      var total_available = self.available_board_length();
      var total_cuts = self.cut_length();
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
        var board_length = raw_available_boards[i].board_length();
        for(var j = 0; j < quantity; ++j) {
          available_boards.push(board_length);
        }
      }

      for(var i = 0; i < raw_cuts.length; ++i) {
        var quantity = raw_cuts[i].cut_quantity();
        var cut_length = raw_cuts[i].cut_length();
        for(var j = 0; j < quantity; ++j) {
          cuts.push(cut_length);
        }
      }

      available_boards.sort();
      cuts.sort();

      for(var i = 0; i < available_boards.length; ++i) {
        var solution = {board_length:available_boards[i], remaining:available_boards[i], included:[]};

        for(var j = 0; j < cuts.length; ++j) {
          if(cuts[j] > 0 && cuts[j] <= solution.remaining) {
            solution.remaining -= cuts[j];
            solution.included.push({cut_length:cuts[j]});
            cuts[j] = -1;
          }
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