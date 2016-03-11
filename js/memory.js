var Memory = function(numCards) {
  this.previousId = undefined;
  this.numFlipped = 0;
  this.buildDeck();
  this.assignCards(numCards);
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
  this.deck = deck;
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
  cardsInOrder.forEach(function(card) {
    card.available = true;
  });

  var cards = [];
  for(var i=0; i<numCards; i++) {
    var index = Math.floor(Math.random()*cardsInOrder.length);
    cards.push(cardsInOrder[index]);
    cardsInOrder.splice(index,1);
  }

  console.log(cards.map(function(card) { return card.rank + " " + card.suit; }));
  this.cards = cards;
};

Memory.prototype.flip = function(id) {
  var game = this;
  var card = this.cards[id];
  var url = "img/cards/" + card.rank + "_of_" + card.suit + ".png";
  $("#" + id).html('<img src="' + url + '">');
  this.numFlipped++;

  if(this.numFlipped === 1) { // this is the first flipped of two
    this.previousId = id;
    $("#" + id).off();
    $("#" + id).removeClass("clickable");
    // console.log("this is the first card");
  } else { // this is the second flipped of two
      var previousId = this.previousId;
      var previousCard = this.cards[previousId];
      $(".card").off();
      $(".card").removeClass("clickable");

      if(card === previousCard) {
        $("#" + id).addClass("hideme");
        $("#" + previousId).addClass("hideme");
        game.numFlipped = 0;
        game.makeBoardClickable();
      } else {
        console.log("no match");
        $("#" + previousId).addClass("clickable");
        $("#" + id).addClass("clickable");
        $("#" + id).click(function() {
          $("#" + id).html('<img src="img/cards/back.png">');
          game.numFlipped--;
          if(game.numFlipped === 0) {
            // console.log("back to normal");
            game.makeBoardClickable();
          } else {
            $("#" + id).removeClass("clickable");
            $("#" + id).off();
            // console.log("one more to flip back");
          }
        })
        $("#" + previousId).click(function() {
          $("#" + previousId).html('<img src="img/cards/back.png">');
          game.numFlipped--;
          if(game.numFlipped === 0) {
            // console.log("back to normal");
            game.makeBoardClickable();
          } else {
            $("#" + previousId).removeClass("clickable");
            $("#" + previousId).off();
            // console.log("one more to flip back");
          }
        })
      }




      // console.log("this is the second card");
  }

  // $("#" + id).addClass("clickable");
  // $("#" + id).click(function() {
  //   $("#" + id).html('<img src="img/cards/back.png">');
  //   game.makeBoardClickable();
  // });
};

Memory.prototype.makeBoardClickable = function() {
  var game = this;
  $(".card").off();
  $(".card").addClass("clickable");
  $(".card").click(function() {
    var clicked = parseInt($(this).attr('id'));
    game.flip(clicked);
  });
};

exports.Memory = Memory;
