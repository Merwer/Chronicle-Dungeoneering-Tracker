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
        saveCheck();
    };

    var cardCloseClicked = function (evt) {
        $(this).closest('.card-choice').addClass('hidden').removeClass('selected');
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

    var updateWithState = function (state) {
        var roundId = 0;
        var cardId;
        var cardIndex;
        for (roundId = 0; roundId < state.rounds.length; roundId += 1) {
            var round = state.rounds[roundId];
            for (cardIndex = 0; cardIndex < round.options.length; cardIndex += 1) {
                cardId = round.options[cardIndex];
                var card = findCardById(cardId);
                window.alert(JSON.stringify(card));
            }
        }
    };

    var requestDraftState = function () {
        $.getJSON("/data/state.json") //TODO: This should be a service
            .done(function (state) {
                updateWithState(state);
            })
            .fail(function () {
                window.alert("State request failed");
            });
    };

    var performSave = function () {
        $.get("/") //TODO: This should be a post
            .done(function () {
                requestDraftState();
            })
            .fail(function () {
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