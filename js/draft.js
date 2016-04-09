/*global jQuery, Bloodhound*/
var chronicle = chronicle || {};
chronicle.dungeoneering = chronicle.dungoneering || {};
chronicle.dungeoneering.draft = (function ($) {
    'use strict';

    var selectionSlots = $('.card-choices .card-choice');
    var submitButton = $('.user-input button[type=submit]');

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
        img.attr('src', selectedCard.img);
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

    var submitPicks = function () {
        if (saveCheck()) {
            //TODO: Submit picks to a service
            //TODO: Get current state of draft from service
            //TODO: Update page to reflect current state of draft
            window.alert('saved');
        }
    };

    var init = function () {
        var cardData = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: '/cards.json'
        });
        cardData.clearPrefetchCache();
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

        selectionSlots.find('.close').click(cardCloseClicked);
        selectionSlots.find('img').click(cardPicked);
        submitButton.click(submitPicks);
    };

    init();
}(jQuery));