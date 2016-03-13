var Memory = function(numCards) {
  this.numCards = numCards;
  this.deck = this.buildDeck();
  this.beginGame();
};

Memory.prototype.buildDeck = function() {
  var ranks = [1,2,3,4,5,6,7,8,9,10,11,12,13];
  var suits = ["clubs", "diamonds", "hearts", "spades"];
  var deck = [];
  ranks.forEach(function(rank) {
    suits.forEach(function(suit) {
      deck.push({"rank": rank, "suit": suit, "available": true});
    });
  });
  return deck;
};

Memory.prototype.beginGame = function() {
  this.cardsRemaining = this.numCards;
  this.turn = 0;
  this.numFlippedUp = 0;
  this.previousId = undefined;
  this.cards = this.assignCards(this.numCards);
  this.setupBoard(this.numCards);
  this.makeBoardClickable();
};

Memory.prototype.assignCards = function(numCards) {
  var cardsInOrder = [];
  while(cardsInOrder.length < numCards) {
    var randomCard = this.deck[Math.floor(Math.random()*52)];
    if(randomCard.available) {
      cardsInOrder.push(randomCard);
      cardsInOrder.push(randomCard);
      randomCard.available = false;
    }
  }

  // reset availability flag on each card, potentially for later use / to reset deck
  cardsInOrder.forEach(function(card) { card.available = true; });

  var cards = [];
  for(var i=0; i<numCards; i++) {
    var index = Math.floor(Math.random()*cardsInOrder.length);
    cards.push(cardsInOrder[index]);
    cardsInOrder.splice(index,1);
  }

  console.log(cards.map(function(card) { return card.rank + " " + card.suit; }));
  return cards;
};

Memory.prototype.setupBoard = function(numCards) {
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

Memory.prototype.makeBoardClickable = function() {
  this.turn++;
  $("#turn").text(this.turn); 
  var game = this;
  $(".card").off();
  $(".card").addClass("clickable");
  $(".card").click(function() {
    var clicked = parseInt($(this).attr('id'));
    game.flip(clicked);
  });
};

Memory.prototype.flip = function(id) {
  var game = this;
  var card = this.cards[id];
  var url = "img/cards/" + card.rank + "_of_" + card.suit + ".png";
  $("#" + id).html('<img src="' + url + '">');
  this.numFlippedUp++;

  if(this.numFlippedUp === 1) { // this is the first flipped of two
    this.previousId = id;
    $("#" + id).off();
    $("#" + id).removeClass("clickable");
  } else { // this is the second flipped of two
    var previousId = this.previousId;
    var previousCard = this.cards[previousId];
    $(".card").off();
    $(".card").removeClass("clickable");

    if(card === previousCard) {
      $("#" + id).addClass("hideme");
      $("#" + previousId).addClass("hideme");
      game.numFlippedUp = 0;
      game.cardsRemaining -= 2;
      if(game.cardsRemaining === 0) {
        alert("You won in " + this.turn + " turns!");
        this.beginGame();
      } else {
        game.makeBoardClickable();
      }
    } else {
      console.log("no match");
      $("#" + previousId).addClass("clickable");
      $("#" + id).addClass("clickable");
      $("#" + id).click(function() {
        $("#" + id).html('<img src="img/cards/back.png">');
        game.numFlippedUp--;
        if(game.numFlippedUp === 0) {
          game.makeBoardClickable();
        } else {
          $("#" + id).removeClass("clickable");
          $("#" + id).off();
        }
      });
      $("#" + previousId).click(function() {
        $("#" + previousId).html('<img src="img/cards/back.png">');
        game.numFlippedUp--;
        if(game.numFlippedUp === 0) {
          game.makeBoardClickable();
        } else {
          $("#" + previousId).removeClass("clickable");
          $("#" + previousId).off();
        }
      });
    }
  }
};

exports.Memory = Memory;
