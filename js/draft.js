/*global jQuery, Bloodhound*/
var chronicle = chronicle || {};
chronicle.dungeoneering = chronicle.dungoneering || {};
chronicle.dungeoneering.draft = (function ($) {
    'use strict';

    var cardList;
    var lookup;
    var selectionSlots = $('.card-choices .card-choice');
    var submitButton = $('.user-input button[type=submit]');

    var findCardById = function (id) {
        return lookup[id];
    };

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
        nextSlot.data("cardId", selectedCard.id);
        saveCheck();
    };

    var cardCloseClicked = function (evt) {
        var choiceSlot = $(this).closest('.card-choice');
        choiceSlot.addClass('hidden').removeClass('selected');
        choiceSlot.data("cardId", null);
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
        case "weapon":
            addToHtml($('.rewards .weapons'), 1);
            break;
        case "attack":
            addToHtml($('.rewards .attack'), reward.value0);
            break;
        case "gold":
            addToHtml($('.rewards .gold'), reward.value0);
            break;
        case "health":
            addToHtml($('.rewards .health'), reward.value0);
            break;
        case "armour":
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
        item.append($('<span>').addClass("value").html(card.goldCost));
        item.append($('<span>').addClass("name").html(card.name));
        item.append($('<span>').addClass("count").html(1));
        $('.support-selections').append(item);
        addToHtml($('.support-selections .heading .count'), 1);
    };

    var addCardToAttack = function (card) {
        var item = $('<li>');
        item.append($('<span>').addClass("value").html(card.health));
        item.append($('<span>').addClass("name").html(card.name));
        item.append($('<span>').addClass("count").html(1));
        $('.fight-selections').append(item);
        addToHtml($('.fight-selections .heading .count'), 1);
    };

    var addCardToDeck = function (card) {
        switch (card.type) {
        case "support":
            addCardToSupport(card);
            break;
        case "combat":
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

    var updateWithState = function (state) {
        var roundId = 0;
        var cardId;
        var cardIndex;
        clearRewards();
        clearDeck();
        for (roundId = 0; roundId < state.rounds.length; roundId += 1) {
            var round = state.rounds[roundId];
            for (cardIndex = 0; cardIndex < round.picks.length; cardIndex += 1) {
                cardId = round.options[cardIndex];
                var card = findCardById(cardId);
                addCardToState(card);
            }
        }
    };

    var constructRound = function () {
        var round = {
            "options": [],
            "picks": []
        };
        $.each(selectionSlots, function (index, element) {
            var ele = $(element);
            var cardId = ele.data("cardId");
            round.options.push(cardId);
            if (ele.hasClass('selected')) {
                round.picks.push(cardId);
            }
        });
        return round;
    };

    var requestDraftState = function () {
        $.getJSON("/data/state.json") //TODO: This should be a service
            .done(function (state) {
                //TODO: This should care about the response
                var data = constructRound();
                updateWithState({
                    rounds: [data]
                });
            })
            .fail(function () {
                window.alert("State request failed");
            });
    };

    var performSave = function () {
        var data = constructRound();
        //TODO: This should be a post
        $.get("/", {
            data: data
        }).done(
            requestDraftState
        ).fail(function () {
            window.alert("Save failed");
        });
    };

    var submitPicks = function () {
        if (saveCheck()) {
            performSave();
        }
    };

    var init = function () {
        lookup = [];
        $.each(cardList, function (index, card) {
            lookup[card.id] = card;
        });
        selectionSlots.find('.close').click(cardCloseClicked);
        selectionSlots.find('img').click(cardPicked);
        submitButton.click(submitPicks);

        var cardData = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: cardList
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

    $.getJSON("/data/cards.json", function (data) {
        cardList = data;
        init();
    });
}(jQuery));