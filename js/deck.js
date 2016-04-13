/*global jQuery,chronicle*/
if (!chronicle || !chronicle.constants) {
    throw new Error("Deck class cannot be used without first referencing chronicle-base.js");
}
chronicle.Deck = function () {
    "use strict";

    var cards = {};
    cards[chronicle.constants.cardType.COMBAT] = {};
    cards[chronicle.constants.cardType.SUPPORT] = {};

    var asArray = function (key) {
        return jQuery.map(cards[key], function (ele) {
            return ele;
        });
    };

    this.addCard = function (card) {
        if (card.type !== chronicle.constants.cardType.COMBAT && card.type !== chronicle.constants.cardType.SUPPORT) {
            throw new Error("Unknown card type: " + card.type);
        }

        if (cards[card.type][card.id]) {
            cards[card.type][card.id].count += 1;
        } else {
            cards[card.type][card.id] = {
                card: card,
                count: 1
            };
        }
    };

    this.fightCards = function () {
        return asArray(chronicle.constants.cardType.COMBAT);
    };

    this.supportCards = function () {
        return asArray(chronicle.constants.cardType.SUPPORT);
    };

    this.allCards = function () {
        return jQuery.merge(this.fightCards(), this.supportCards());
    };

    return this;
};