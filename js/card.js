/*global $*/
var chronicle = chronicle || {};
chronicle.Attributes = {
    ATTACK: "attack",
    ARMOUR: "armour",
    WEAPON: "weapon",
    HEALTH: "health",
    GOLD: "gold"
};

chronicle.Archetypes = {
    BASIC: "basic",
    RAPTOR: "raptor",
    ARIANNE: "arianne",
    LINZA: "linza",
    OZAN: "ozan",
    VANESCULA: "vanescula"
};

chronicle.Card = function () {
    "use strict";

    this.id = 0;
    this.img = "//placehold.it/160x100.png?text=image";
    this.cardtype = "";
    this.name = "";
    this.family = "";
    this.rarity = "";
    this.archetype = chronicle.Archetypes.BASIC;
    this.effect = "";
    this.reward1 = null;
    this.reward2 = null;
    this.cost1 = null;
    this.cost2 = null;
    var that = this;

    var iconHtml = function (item, itemName) {
        if (item === null || item.type === undefined || item.value === undefined) {
            return "";
        }
        return "<span class='icon {{type}} {{itemName}}'>{{value}}</span>"
            .replace("{{itemName}}", itemName)
            .replace("{{type}}", item.type)
            .replace("{{value}}", item.value);
    };

    this.html = function () {
        var html = "";
        html += "<div class='card {{cardtype}} {{archetype}} {{rarity}}'>"
            .replace("{{cardtype}}", this.cardtype)
            .replace("{{archetype}}", this.archetype)
            .replace("{{rarity}}", this.rarity);
        html += iconHtml(this.cost1, "cost-1");
        html += iconHtml(this.cost2, "cost-2");
        html += ("<img class='card-img' src='{{img}}' />" +
                "<p class='card-name'>{{name}}</p>" +
                "<p class='card-family'>{{family}}</p>" +
                "<div class='card-effect'><p>{{effect}}</p></div>")
            .replace("{{name}}", this.name)
            .replace("{{family}}", this.family)
            .replace("{{effect}}", this.effect)
            .replace("{{img}}", this.img);
        html += iconHtml(this.reward1, "reward-1");
        html += iconHtml(this.reward2, "reward-2");
        html += "</div>";
        return html;
    };
};

chronicle.Card.Types = {
    SUPPORT: "support",
    ENEMY: "monster"
};

chronicle.Card.Reward = function (type, value) {
    "use strict";

    this.type = type;
    this.value = value;
};