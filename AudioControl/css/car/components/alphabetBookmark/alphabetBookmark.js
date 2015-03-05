/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
