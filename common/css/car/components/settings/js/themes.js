/*
 * Copyright (c) 2014, Intel Corporation, Jaguar Land Rover
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

/* global ThemeEngine, Settings, ko, $, loadTemplate */

/**
 * @module Settings
 */
/**
 * Themes class provides grid view of available themes, detection of theme changes and method of updating selected theme.
 *
 * This class requires following components:
 *
 * * {{#crossLink "Tabs"}}{{/crossLink}} component
 * * {{#crossLink "ThemeEngine"}}{{/crossLink}} component
 * * {{#crossLink "Settings"}}{{/crossLink}} component
 * 
 * @class Themes
 * @constructor
 */
var Themes = function() {
	"use strict";
	/**
	 * Marks a given user theme as selected.
	 * 
	 * @method setTheme
	 * @param theme {Object} Object representing theme's information.
	 */
	this.setTheme = function(theme) {
		if (typeof ThemeEngine !== 'undefined') {
			ThemeEngine.setUserTheme(theme.id);
		}
	};

	this.init();
};

/**
 * Contains array of available user themes.
 * 
 * @property themes
 * @public
 * @type ko.observableArray
 * @default []
 */
Themes.prototype.themes = ko.observableArray([]);

/**
 * Adds a listener to receive notifications about theme changes and updates the list of available user themes.
 * 
 * @method init
 */
Themes.prototype.init = function() {
	"use strict";
	var self = this;
	if (typeof ThemeEngine !== 'undefined') {
		ThemeEngine.addStatusListener(function(themeId) {
			self.loadThemes();
		});
	} else {
		console.error("ThemeEngine API is not available.");
	}
};

/**
 * Shows grid view of available user themes and allows to change theme.
 * 
 * @method show
 */
Themes.prototype.show = function() {
	"use strict";
	var self = this;
	var subpanelModel = {
		textTitle : "SETTINGS",
		textSubtitle : "THEMES",
		actionName : "BACK",
		action : function() {
			Settings.renderSettingsView();
		}
	};
	var loadThemesUI = function() {
		if (!$("#themeList").length) {
			var themeList = '<div id="themeList" data-bind="template: { name: \'';
			themeList += templateName;
			themeList += '\', foreach: Settings.Theme.themes }"></div>';
			$(themeList).appendTo($('.' + themesContent));
			ko.applyBindings(window.Settings);
		}
	};
	var themesContent = "themesContent";
	var templateName = "template-themes";
	Settings.domElement.tabs("clearContent");
	Settings.domElement.tabs("changeContentClass", themesContent);
	Settings.domElement.tabs("subpanelContentTemplateCompile", subpanelModel, function() {
		loadTemplate(Settings.SETTINGS_TEMPLATES_PATH, templateName, loadThemesUI);
	});
	self.loadThemes();
};

/**
 * Loads available user themes from ThemeEngine service.
 * 
 * @method loadThemes
 */
Themes.prototype.loadThemes = function(successCallback) {
	"use strict";
	console.log("updateThemes called");
	var self = this;
	if (typeof ThemeEngine !== 'undefined') {
		ThemeEngine.getUserThemes(function(newThemes) {
			self.themes.removeAll();
			self.themes([]);
			for ( var i = 0; i < newThemes.length; ++i) {
				self.themes.push(newThemes[i]);
			}
		});
	}
};
