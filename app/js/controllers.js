'use strict';

/* Controllers */

angular.module('coreBOSJSApp.controllers', [])
.controller('navigationCtrl',function($scope, Setup, $i18next, $window, $location) {
	$scope.appname = Setup.app;
	$scope.messageurl = "http://corebos.org";
	$scope.messagetxt = "Data provided by coreBOS. &copy; 2014";
	$(window).bind('resize', function() {
		if ($window.innerWidth < 768) {
			$scope.menuShow = false;
		} else {
			$scope.menuShow = true;
		}
		$scope.$apply();
	});
	$scope.menuShow = true;
	$scope.toggleMenu = function() {
		$scope.menuShow = !$scope.menuShow;
	};
	$scope.menuitems = [ {
		path: 'module',
		faimg: 'fa-file-image-o',
		title: 'Module'
	}, {
		path: 'config',
		faimg: 'fa-edit',
		title: 'Settings'
	} ];
	$scope.isActive = function (viewLocation) {
		var active = (viewLocation === $location.path());
		return active;
	};
})
.controller('configCtrl',function($scope, $i18next, $filter, coreBOSWSAPI, corebosAPIKeys) {
	$scope.langs = [ {
		name : i18n.t('English'),
		code : 'en'
	}, {
		name : i18n.t('Spanish'),
		code : 'es'
	}];
	$scope.changeLanguage = function (lng) {
		$i18next.options.lng=lng.code;
	}
	var found = $filter('getById')($scope.langs, $i18next.options.lng, 'code');
	if (found!=null) {
		$scope.currentLang = found;
	} else {
		$scope.currentLang = $scope.langs[0];
	}
	$scope.mvpublickey = coreBOSWSAPI.getcoreBOSUser();
	$scope.mvprivatekey = coreBOSWSAPI.getcoreBOSKey();
	$scope.$watch("mvpublickey", function(newval, oldval){
		coreBOSWSAPI.setcoreBOSUser(newval);
		coreBOSWSAPI.setConfigured();
	});
	$scope.$watch("mvprivatekey", function(newval, oldval){
		coreBOSWSAPI.setcoreBOSKey(newval);
		coreBOSWSAPI.setConfigured();
	});
	$scope.MarvelAPIConfigured = coreBOSWSAPI.isConfigured();
	$scope.MarvelAPIKeys = corebosAPIKeys.hasInvalidKeys();
	coreBOSWSAPI.doLogin('admin','Lvx494dom78vMTjS').then(function() {
		console.log('WE ARE IN!!! dl then',corebosAPIKeys.getSessionInfo());
	},function() {
		console.log('THEY wont let us IN!!! dl then',corebosAPIKeys.getSessionInfo());
	});
})
.controller('moduleCtrl',function($scope, coreBOSWSAPI, $i18next) {
	$scope.moduleList = [];
	for (var i=1;i<10;i++) {
		var rec = {
				id: i,
				name: 'mod' + i,
				website: 'www' + i,
				phone: 'phone' + i,
				email: 'email' + i
		};
		$scope.moduleList.push(rec);
	}
//	$scope.myPageItemsCount = 0;
//	$scope.myItemsTotalCount = 0;
//	corebosWSAPI.getComics().success(function(response) {
//		$scope.myPageItemsCount = response.data.count;
//		$scope.myItemsTotalCount = response.data.total;
//		$scope.moduleList = response.data.results;
//	});
//	$scope.onServerSideItemsRequested = function(currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
//		corebosWSAPI.getComics(currentPage * pageItems, pageItems).success(function(response) {
//			$scope.myPageItemsCount = response.data.count;
//			$scope.myItemsTotalCount = response.data.total;
//			$scope.moduleList = response.data.results;
//		});
//	}
//	$scope.mySelectedItems = [];
//	$scope.$watch("mySelectedItems.length", function(newLength){
//	  console.log($scope.mySelectedItems);
//	});
})
;
