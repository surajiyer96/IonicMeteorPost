// Web interface

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'web' is the name of this angular module example the 2nd parameter is an array of 'requires'
// 'web.services' is found in services.js
// 'web.controllers' is found in controllers.js
angular.module('web', ['angular-meteor',
	'ui.bootstrap',
    'color.picker',
    'ui.router',
    'web.controllers',
    'web.routes',
    'translation',
    'web.services']);