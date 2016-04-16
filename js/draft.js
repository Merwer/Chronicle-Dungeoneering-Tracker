/*global jQuery,Bloodhound,chronicle*/
if (!chronicle || !chronicle.constants) {
    throw new Error("Missing required reference: chronicle-base.js");
}
if (!chronicle.CardList) {
    throw new Error("Missing required reference: cardList.js");
}
if (!chronicle.Deck) {
    throw new Error("Missing required reference: deck.js");
}
chronicle.dungeoneering = chronicle.dungoneering || {};
chronicle.dungeoneering.draft = (function ($) {
    'use strict';

    var cardList;
    var deck;
    var selectionSlots = $('.card-choices .card-choice');

    var addToHtml = function (element, amount) {
        element.html(window.parseInt(element.html(), 10) + amount);
    };

    var addReward = function (reward) {
        var selector = null;
        switch (reward.type) {
        case 'weapon':
            addToHtml($('.rewards .weapon'), 1);
            break;
        case 'attack':
            addToHtml($('.rewards .attack'), reward.value0);
            break;
        case 'gold':
            addToHtml($('.rewards .gold'), reward.value0);
            break;
        case 'health':
            addToHtml($('.rewards .health'), reward.value0);
            break;
        case 'armour':
            addToHtml($('.rewards .armour'), reward.value0);
            break;
        }
    };

    var addCardRewards = function (card) {
        var rewardsList = $('.rewards');
        var index;
        var list = ['reward0', 'reward1', 'reward2'];
        for (index = 0; index < list.length; index += 1) {
            var reward = card[list[index]];
            if (reward !== null) {
                addReward(reward);
            }
        }
    };

    var addCardToSupport = function (card, count) {
        var item = $('<li>');
        item.append($('<span>').addClass('icon').addClass('gold').addClass('value').html(card.goldCost));
        item.append($('<span>').addClass('name').html(card.name));
        item.append($('<span>').addClass('count').html(count));
        $('.support-selections').append(item);
    };

    var addCardToAttack = function (card, count) {
        var item = $('<li>');
        item.append($('<span>').addClass('icon').addClass('health').addClass('value').html(card.health));
        item.append($('<span>').addClass('name').html(card.name));
        item.append($('<span>').addClass('count').html(count));
        $('.fight-selections').append(item);
    };

    var refreshRewards = function () {
        $('.rewards li').html('0');

        $.each(deck.allCards(), function (num, ele) {
            var index;
            for (index = 0; index < ele.count; index += 1) {
                addCardRewards(ele.card);
            }
        });
    };

    var sortCards = function (param) {
        return function (a, b) {
            return a.card[param] - b.card[param];
        };
    };

    var refreshDeck = function () {
        $('.support-selections li').remove();
        $('.support-selections .heading .count').html('0');
        var supportList = deck.supportCards().sort(sortCards('goldCost'));
        var supportListSum = 0;
        $.each(supportList, function (index, element) {
            addCardToSupport(element.card, element.count);
            supportListSum += element.count;
        });
        $('.support-selections .heading .count').html(supportListSum);

        $('.fight-selections li').remove();
        $('.fight-selections .heading .count').html('0');
        var fightList = deck.fightCards().sort(sortCards('health'));
        var fightListSum = 0;
        $.each(fightList, function (index, element) {
            addCardToAttack(element.card, element.count);
            fightListSum += element.count;
        });
        $('.fight-selections .heading .count').html(fightListSum);
    };

    var refreshUI = function () {
        refreshRewards();
        refreshDeck();
    };

    var clearChoices = function () {
        selectionSlots.addClass('hidden').removeClass('selected');
        selectionSlots.data('cardId', null);
    };

    var incrementRound = function () {
        addToHtml($('.round-counter .current'), 1);
    };

    var constructRound = function () {
        var round = {
            options: [],
            picks: []
        };
        $.each(selectionSlots, function (index, element) {
            var ele = $(element);
            var cardId = ele.data('cardId');
            round.options.push(cardId);
            if (ele.hasClass('selected')) {
                round.picks.push(cardId);
            }
        });
        return round;
    };

    var performSave = function () {
        var data = constructRound();
        deck.addCard(cardList.getCard(data.picks[0]));
        deck.addCard(cardList.getCard(data.picks[1]));
        incrementRound();
        clearChoices();
        $.get('/', { //TODO: This should be a post
            data: data
        }).done(
            refreshUI
        ).fail(function () {
            window.alert('Save failed');
        });
    };

    var saveCheck = function () {
        var selectedCount = selectionSlots.filter('.selected').length;
        var unfilledCount = selectionSlots.filter('.hidden').length;
        if (selectedCount === 2 && unfilledCount === 0) {
            performSave();
            return true;
        }
        return false;
    };

    var findNextEmptySlot = function () {
        var unfilledSlots = selectionSlots.filter('.hidden');
        return unfilledSlots.length === 0 ? null : $(unfilledSlots[0]);
    };

    var clearText = function () {
        $('.typeahead').typeahead('val', '');
    };

    var cardSelected = function (ev, selectedCard) {
        var img;
        var nextSlot = findNextEmptySlot();
        if (!nextSlot) {
            return;
        }

        window.console.log('Selection: ', selectedCard);
        img = $(nextSlot.children('img')[0]);
        img.attr('src', selectedCard.image);
        nextSlot.removeClass('hidden');
        nextSlot.data('cardId', selectedCard.id);
        clearText();
        saveCheck();
    };

    var cardCloseClicked = function (evt) {
        var choiceSlot = $(this).closest('.card-choice');
        choiceSlot.addClass('hidden').removeClass('selected');
        choiceSlot.data('cardId', null);
        saveCheck();
    };

    var cardPicked = function () {
        var choice = $(this).closest('.card-choice');
        if (choice.hasClass('selected')) {
            choice.removeClass('selected');
        } else {
            var selectedCount = selectionSlots.filter('.selected').length;
            if (selectedCount < 2) {
                choice.addClass('selected');
            }
        }
        saveCheck();
    };

    var setRound = function (roundId) {
        $('.round-counter .current').html(roundId);
    };

    var refreshWithState = function (state) {
        deck = new chronicle.Deck();
        var roundId = 0;
        var round;
        var cardId;
        var cardIndex;
        for (roundId = 0; roundId < state.rounds.length; roundId += 1) {
            round = state.rounds[roundId];
            for (cardIndex = 0; cardIndex < round.picks.length; cardIndex += 1) {
                cardId = round.picks[cardIndex];
                var card = cardList.getCard(cardId);
                deck.addCard(card);
            }
        }

        setRound(state.rounds.length + 1);
        refreshUI();
    };

    var requestDraftState = function () {
        $.getJSON('/data/state.json') //TODO: This should be a service
            .done(
                refreshWithState
            ).fail(function () {
                window.alert('State request failed');
            });
    };

    var init = function () {
        selectionSlots.find('.close').click(cardCloseClicked);
        selectionSlots.find('img').click(cardPicked);

        var cardData = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: cardList.allCards()
        });
        cardData.initialize();

        $('.typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        }, {
            name: 'cards_search',
            displayKey: 'name',
            source: cardData.ttAdapter()
        }).bind('typeahead:select', cardSelected);

        deck = new chronicle.Deck();

        //TODO: Update page based on state of draft
        //requestDraftState();
    };
    cardList = new chronicle.CardList(init);
}(jQuery));