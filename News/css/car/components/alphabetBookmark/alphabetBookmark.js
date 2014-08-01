/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */
/*global template */

/**
 * Represents alphabet UI control element (letters in column), that can be used to filter list of objects according to selected/tapped letter.
 * This component is required by {{#crossLink "Library"}}{{/crossLink}} class.
 *
 * Use following snippet to include component in your `index.html` file:
 * 
 *     <script type="text/javascript" src='./css/car/components/alphabetBookmark/alphabetBookmark.js'></script>
 *     <link rel="stylesheet" href="./css/car/components/alphabetBookmark/alphabetBookmark.css" />
 *
 * and following code to initialize:
 *
 *     AlphabetBookmark.fill();
 *
 * @class AlphabetBookmark
 * @module CarTheme
 * @constructor
 */
var AlphabetBookmark = {
        /** 
         * Array of letters.
         * @property abModel
         * @type {Array}
         */
        abModel: [],
        /** 
         * String of letters that will rendered.
         * @property abcd
         * @type {String}
         */
        abcd: "*ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        /**
         * Highlights the selected letter.
         * 
         * @method touch
         * @param index {Integer} Index of the letter.
         */
        touch: function (index) {
            "use strict";
            return;
            // $(".alphabetBookmarkItem").removeClass("fontColorSelected");
            // var tabId = "#item_" + index;
            // $(tabId).addClass("fontColorSelected");
            // $("#alphabetBookmarkList").trigger("letterClick", this.abModel[index].text);
        },
        /**
         * Fills the {{#crossLink "AlphabetBookmark/abModel:property"}}{{/crossLink}} from {{#crossLink "AlphabetBookmark/abcd:property"}}{{/crossLink}} and shows the rendered default template on the screen.
         * 
         * @method fill
         */
        fill: function () {
            "use strict";

            this.abModel = [];
            var i = 0;
            for (i = 0; i < this.abcd.length; i++) {
                this.abModel.push({ index: i, text: this.abcd.charAt(i) });
            }
            template.compile(this.abModel, "./css/car/components/alphabetBookmark/templates/alphabetBookmarkDelegate.html", "#alphabetBookmarkList");
        }
    };
