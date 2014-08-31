'use strict';

angular.module('coreBOSJSApp',
	[ 'ngRoute', 'coreBOSJSApp.setup', 'ngSanitize', 'coreBOSJSApp.filters', 'coreBOSJSApp.services',
		'coreBOSJSApp.directives', 'coreBOSJSApp.controllers', 'angular-md5','ui.bootstrap',
		'coreBOSJSApp.controllers', 'coreBOSJSApp.services', 'jm.i18next', 'trNgGrid', 'restangular'])
	.config([ '$routeProvider', function($routeProvider) {
		$routeProvider.when('/module', {
			templateUrl : 'partials/module.html',
			controller : 'moduleCtrl'
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
	.config(function($httpProvider) {
		$httpProvider.interceptors.push('corebosAPIInterceptor');
	})
	.run(function ($rootScope, corebosAPIInvalidKeys, corebosAPIservice, $location) {
		$rootScope.$on('$routeChangeStart', function (ev, next, curr) {
		  if (next.$$route) {
			if (!corebosAPIservice.isConfigured() || corebosAPIInvalidKeys.hasInvalidKeys()) {
				$location.path('/config')
			}
		  }
		});
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
