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
})
.controller('moduleCtrl',function($scope, $i18next, coreBOSWSAPI, corebosAPIKeys) {
	$scope.myPageItemsCount = 0;
	$scope.myItemsTotalCount = 0;
	$scope.moduleList = [];
	coreBOSWSAPI.doLogin('admin','Lvx494dom78vMTjS').then(function() {
		coreBOSWSAPI.doQuery('select * from accounts limit 0,5').then(function(response) {
			$scope.moduleList = response.data.result;
			$scope.myPageItemsCount = response.data.result.length;
		});
		coreBOSWSAPI.doQuery('select count(*) from accounts').then(function(response) {
			$scope.myItemsTotalCount = response.data.result[0].count;
		});
	},function() {
		console.log('THEY wont let us IN!!! dl then',corebosAPIKeys.getSessionInfo());
	});
	$scope.onServerSideItemsRequested = function(currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
		var where = coreBOSWSAPI.getWhereCondition($scope.moduleList[0],filterBy, filterByFields, orderBy, orderByReverse);
		var limit = coreBOSWSAPI.getLimit(pageItems,currentPage*pageItems);
		var query = 'select * from accounts ' + where + limit;
		coreBOSWSAPI.doLogin('admin','Lvx494dom78vMTjS').then(function() {
		coreBOSWSAPI.doQuery(query).then(function(response) {
			$scope.moduleList = response.data.result;
			$scope.myPageItemsCount = response.data.result.length;
		});
		coreBOSWSAPI.doQuery('select count(*) from accounts' + where).then(function(response) {
			$scope.myItemsTotalCount = response.data.result[0].count;
		});});
	}
//	$scope.mySelectedItems = [];
//	$scope.$watch("mySelectedItems.length", function(newLength){
//	  console.log($scope.mySelectedItems);
//	});
})
;
