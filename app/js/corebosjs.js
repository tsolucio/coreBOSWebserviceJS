'use strict';

angular.module('coreBOSJSApp',
	[ 'ngRoute', 'coreBOSJSApp.setup', 'ngSanitize', 'coreBOSJSApp.filters', 'coreBOSAPIservice',
		'coreBOSJSApp.directives', 'coreBOSJSApp.controllers', 'angular-md5','ui.bootstrap',
		'jm.i18next', 'trNgGrid'])
	.config([ '$routeProvider', function($routeProvider) {
		$routeProvider.when('/module/:id', {
			templateUrl : 'partials/moduleview.html',
			controller : 'moduleviewCtrl'
		});
		$routeProvider.when('/module', {
			templateUrl : 'partials/module.html',
			controller : 'moduleCtrl'
		});
		$routeProvider.when('/invoke', {
			templateUrl : 'partials/doinvoke.html',
			controller : 'doinvokeCtrl'
		});
		$routeProvider.when('/relations', {
			templateUrl : 'partials/relations.html',
			controller : 'relationsCtrl'
		});
		$routeProvider.when('/listtypes', {
			templateUrl : 'partials/listtypes.html',
			controller : 'listtypesCtrl'
		});
		$routeProvider.when('/config', {
			templateUrl : 'partials/config.html',
			controller : 'configCtrl'
		});
		$routeProvider.otherwise({
			redirectTo : '/module'
		});
	}
	])
	.config(['Setup','$i18nextProvider', function (Setup, $i18nextProvider) {
	$i18nextProvider.options = {
		lng: Setup.language,
		useCookie: true,
		useLocalStorage: false,
		fallbackLng: 'en',
		resGetPath: 'locales/__lng__/translation.json',
		defaultLoadingValue: '' // ng-i18next option, *NOT* directly supported by i18next
	};
	}])
	.run(function (Setup, $rootScope, coreBOSAPIStatus, coreBOSWSAPI, $location) {
		$rootScope.$on('$routeChangeStart', function (ev, next, curr) {
		  if (next.$$route) {
			if (!coreBOSWSAPI.isConfigured() || coreBOSAPIStatus.hasInvalidKeys()) {
				$location.path('/config');
			}
		  }
		});
		//coreBOSWSAPI.setcoreBOSUser(Setup.corebosuser);
		//coreBOSWSAPI.setcoreBOSKey(Setup.corebosaccesskey);
		coreBOSWSAPI.setURL(Setup.corebosapi);
		coreBOSWSAPI.doLogin(Setup.corebosuser,Setup.corebosaccesskey).then(function() {});
		/*
		TrNgGrid.tableCssClass = "tr-ng-grid table table-bordered table-hover";
	    TrNgGrid.cellCssClass = "tr-ng-cell";
	    TrNgGrid.headerCellCssClass = "tr-ng-column-header " + TrNgGrid.cellCssClass;
	    TrNgGrid.bodyCellCssClass = cellCssClass;
	    TrNgGrid.columnTitleCssClass = "tr-ng-title";
	    TrNgGrid.columnSortCssClass = "tr-ng-sort";
	    TrNgGrid.columnFilterCssClass = "tr-ng-column-filter";
	    TrNgGrid.columnFilterInputWrapperCssClass = "";
	    TrNgGrid.columnSortActiveCssClass = "tr-ng-sort-active text-info";
	    TrNgGrid.columnSortInactiveCssClass = "tr-ng-sort-inactive text-muted";
	    TrNgGrid.columnSortReverseOrderCssClass = "tr-ng-sort-order-reverse glyphicon glyphicon-chevron-up";
	    TrNgGrid.columnSortNormalOrderCssClass = "tr-ng-sort-order-normal glyphicon glyphicon-chevron-down";
	    TrNgGrid.rowSelectedCssClass = "active";
	    TrNgGrid.footerCssClass = "tr-ng-grid-footer form-inline";
	    */
	})
;
