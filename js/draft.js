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

    var findNextEmptySlot = function () {
        var index;
        for (index = 0; index < selectionSlots.length; index += 1) {
            var slot = $(selectionSlots[index]);
            var img = $(slot.children("img")[0]);
            if (!(img.attr('src'))) {
                window.console.log("Empty slot found at " + index);
                return slot;
            }
        }
    };

    var cardSelected = function (ev, suggestion) {
        var selectedCard = nameDictionary[suggestion];
        var img;
        var nextSlot = findNextEmptySlot();

        window.console.log('Selection: ', selectedCard);
        if (!nextSlot) {
            return;
        }
        var img = $(nextSlot.children("img")[0]);
        img.attr('src', selectedCard.img)
        nextSlot.show();
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

    var init = function () {
        $('.typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        }, {
            source: substringMatcher(nameStrings)
        }).bind('typeahead:select', cardSelected);

        selectionSlots.hide();
    };

    init();
}(jQuery));