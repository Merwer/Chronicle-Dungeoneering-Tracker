/*global jQuery, Bloodhound*/
var chronicle = chronicle || {};
chronicle.dungeoneering = chronicle.dungoneering || {};
chronicle.dungeoneering.draft = (function ($) {
    "use strict";

    var selectionSlots = $('.card-choices .card-choice');

    var saveCheck = function () {
        var selectedCount = selectionSlots.filter('.selected').length;
        var unfilledCount = selectionSlots.filter(".hidden").length;
        if (selectedCount === 2 && unfilledCount === 0) {
            window.alert("can save");
        }
    };

    var findNextEmptySlot = function () {
        var unfilledSlots = selectionSlots.filter(".hidden");
        return unfilledSlots.length === 0 ? null : $(unfilledSlots[0]);
    };

    var cardSelected = function (ev, selectedCard) {
        var img;
        var nextSlot = findNextEmptySlot();

        window.console.log('Selection: ', selectedCard);
        if (!nextSlot) {
            return;
        }
        img = $(nextSlot.children("img")[0]);
        img.attr('src', selectedCard.img);
        nextSlot.removeClass("hidden");
        saveCheck();
    };

    var substringMatcher = function (strs) {
        return function findMatches(q, cb) {
            var matches, substringRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substringRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function (i, str) {
                if (substringRegex.test(str)) {
                    matches.push(str);
                }
            });

            cb(matches);
        };
    };

    var cardCloseClicked = function (evt) {
        $(this).closest(".card-choice").addClass("hidden").removeClass("selected");
    };

    var cardPicked = function () {
        var choice = $(this).closest(".card-choice");
        if (choice.hasClass("selected")) {
            choice.removeClass("selected");
        } else {
            var selectedCount = selectionSlots.filter('.selected').length;
            if (selectedCount < 2) {
                choice.addClass("selected");
                saveCheck();
            }
        }
    };

    var init = function () {
        var cards = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace("name"),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            prefetch: "/cards.json"
        });
        cards.clearPrefetchCache();
        cards.initialize();

        $('.typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        }, {
            name: "cards_search",
            displayKey: "name",
            source: cards.ttAdapter()
        }).bind('typeahead:select', cardSelected);

        selectionSlots.find(".close").click(cardCloseClicked);
        selectionSlots.find("img").click(cardPicked);
    };

    init();
}(jQuery));