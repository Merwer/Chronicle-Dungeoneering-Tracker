/*global jQuery, Bloodhound*/
var chronicle = chronicle || {};
chronicle.dungeoneering = chronicle.dungoneering || {};

chronicle.Deck = function () {
    "use strict";

    var cards = [];
};

chronicle.dungeoneering.draft = (function ($) {
    'use strict';

    var deckDraft = {
        rounds: []
    };
    var cardList;
    var selectionSlots = $('.card-choices .card-choice');
    var submitButton = $('.user-input button[type=submit]');

    var addToHtml = function (element, amount) {
        element.html(window.parseInt(element.html(), 10) + amount);
    };

    var saveCheck = function () {
        var selectedCount = selectionSlots.filter('.selected').length;
        var unfilledCount = selectionSlots.filter('.hidden').length;
        if (selectedCount === 2 && unfilledCount === 0) {
            submitButton.prop('disabled', false);
            return true;
        }
        submitButton.prop('disabled', true);
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

    var addCardToSupport = function (card) {
        var item = $('<li>');
        item.append($('<span>').addClass('icon').addClass('gold').addClass('value').html(card.goldCost));
        item.append($('<span>').addClass('name').html(card.name));
        item.append($('<span>').addClass('count').html(1));
        $('.support-selections').append(item);
        addToHtml($('.support-selections .heading .count'), 1);
    };

    var addCardToAttack = function (card) {
        var item = $('<li>');
        item.append($('<span>').addClass('icon').addClass('health').addClass('value').html(card.health));
        item.append($('<span>').addClass('name').html(card.name));
        item.append($('<span>').addClass('count').html(1));
        $('.fight-selections').append(item);
        addToHtml($('.fight-selections .heading .count'), 1);
    };

    var addCardToDeck = function (card) {
        switch (card.type) {
        case 'support':
            addCardToSupport(card);
            break;
        case 'combat':
            addCardToAttack(card);
            break;
        }
    };

    var addCardToState = function (card) {
        addCardRewards(card);
        addCardToDeck(card);
    };

    var clearRewards = function () {
        $('.rewards li').html('0');
    };

    var clearDeck = function () {
        $('.support-selections li').remove();
        $('.support-selections .heading .count').html('0');
        $('.fight-selections li').remove();
        $('.fight-selections .heading .count').html('0');
    };

    var clearChoices = function () {
        selectionSlots.addClass('hidden').removeClass('selected');
        selectionSlots.data('cardId', null);
    };

    var setRound = function (roundId) {
        $('.round-counter .current').html(roundId);
    };

    var updateWithState = function (state) {
        deckDraft = state;
        var roundId = 0;
        var cardId;
        var cardIndex;
        clearRewards();
        clearDeck();
        clearChoices();
        setRound(deckDraft.rounds.length + 1);
        for (roundId = 0; roundId < state.rounds.length; roundId += 1) {
            var round = state.rounds[roundId];
            for (cardIndex = 0; cardIndex < round.picks.length; cardIndex += 1) {
                cardId = round.picks[cardIndex];
                var card = cardList.getCard(cardId);
                addCardToState(card);
            }
        }
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

    var requestDraftState = function () {
        updateWithState(deckDraft); //TODO: This should be a service
        /*
        $.getJSON('/data/state.json')
            .done(
                updateWithState
            ).fail(function () {
                window.alert('State request failed');
            
        */
    };

    var performSave = function () {
        var data = constructRound();
        deckDraft.rounds.push(data);
        $.get('/', { //TODO: This should be a post
            data: data
        }).done(
            requestDraftState
        ).fail(function () {
            window.alert('Save failed');
        });
    };

    var submitPicks = function () {
        if (saveCheck()) {
            performSave();
        }
    };

    var init = function () {
        selectionSlots.find('.close').click(cardCloseClicked);
        selectionSlots.find('img').click(cardPicked);
        submitButton.click(submitPicks);

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
    };
    cardList = new chronicle.CardList(init);
}(jQuery));