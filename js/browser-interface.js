var Memory = require('../js/memory.js').Memory;

var NUM_CARDS = 12;

$(document).ready(function(){
  var game = new Memory(NUM_CARDS);
  setupBoard(NUM_CARDS);
  game.makeBoardClickable();
});

var setupBoard = function(numCards) {
  $(".game-board").empty();
  var numCols = Math.ceil(Math.sqrt(numCards));
  var numRows = Math.ceil(numCards / numCols);
  var cardNum = 0;
  for (var row=0; row < numRows; row++) {
    $(".game-board").append('<div class="row">');
    for (var col=0; col < numCols && cardNum < numCards; col++) {
      $(".game-board").append('<span class="card" id="' + cardNum + '"><img src="img/cards/back.png"></span>');
      cardNum++;
    }
    $(".game-board").append("</div>");
  }
};