/*global jQuery*/
var chronicle = chronicle || {};
chronicle.dungeoneering = chronicle.dungoneering || {};
chronicle.dungeoneering.draft = (function ($) {
    "use strict";

    var localData = [{
        "id": 186,
        "name": "Shug",
        "img": "http://hydra-media.cursecdn.com/chronicle.gamepedia.com/3/3a/Shug.png"
    }, {
        "id": 124,
        "name": "Kayle",
        "img": "http://chronicle.gamepedia.com/File:Kayle.png"
    }, {
        "id": 62,
        "name": "Barrelchest",
        "img": "http://hydra-media.cursecdn.com/chronicle.gamepedia.com/0/07/Barrelchest.png"
    }, {
        "id": 297,
        "name": "Barricade",
        "img": "http://chronicle.gamepedia.com/File:Barricade.png"
    }];

    var nameStrings = $.map(localData, function (card) {
        return card.name;
    });

    var nameDictionary = {};
    $.each(localData, function (index, card) {
        nameDictionary[card.name] = card;
    });

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

    var cardSelected = function (ev, suggestion) {
        var selectedCard = nameDictionary[suggestion];
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
        $('.typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        }, {
            source: substringMatcher(nameStrings)
        }).bind('typeahead:select', cardSelected);

        selectionSlots.find(".close").click(cardCloseClicked);
        selectionSlots.find("img").click(cardPicked);
    };

    init();
}(jQuery));