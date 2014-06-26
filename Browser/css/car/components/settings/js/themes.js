/*
 * Copyright (c) 2013, Intel Corporation, Jaguar Land Rover
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

/* global ThemeEngine, Settings, ko, $, loadTemplate */

/**
 * @module Settings
 * @namespace Settings
 */

/**
 * Themes class provides grid view of available themes, detection of theme changes and method of updating selected theme.
 *
 * This class requires following components:
 *
 * * {{#crossLink "CarTheme.Tabs"}}{{/crossLink}} component
 * * {{#crossLink "Services.ThemeEngine"}}{{/crossLink}} component
 * * {{#crossLink "Settings.Settings"}}{{/crossLink}} component
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
			//ko.applyBindings(window.Settings, Settings.domElement.get(0));
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
