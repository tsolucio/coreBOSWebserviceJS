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
		path: 'relations',
		faimg: 'fa-external-link-square',
		title: 'Relations'
	}, {
		path: 'listtypes',
		faimg: 'fa-list',
		title: 'List Types'
	}, {
		path: 'invoke',
		faimg: 'fa-phone',
		title: 'Invoke'
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
.controller('configCtrl',function($scope, $i18next, $filter, Setup, coreBOSWSAPI, coreBOSAPIStatus) {
	$scope.langs = [ {
		name : i18n.t('English'),
		code : 'en'
	}, {
		name : i18n.t('Spanish'),
		code : 'es'
	}];
	$scope.changeLanguage = function (lng) {
		$i18next.options.lng=lng.code;
	};
	var found = $filter('getArrayElementById')($scope.langs, $i18next.options.lng, 'code');
	if (found!=null) {
		$scope.currentLang = found;
	} else {
		$scope.currentLang = $scope.langs[0];
	}
	$scope.$watch("mvurlkey", function(newval, oldval){
		coreBOSWSAPI.setURL(newval,true);
	});
	$scope.$watch("mvpublickey", function(newval, oldval){
		coreBOSWSAPI.setcoreBOSUser(newval,true);
	});
	$scope.$watch("mvprivatekey", function(newval, oldval){
		coreBOSWSAPI.setcoreBOSKey(newval,true);
		coreBOSWSAPI.setConfigured();
	});
	$scope.mvurlkey = coreBOSWSAPI.getURL() || Setup.corebosapi;
	$scope.mvpublickey = coreBOSWSAPI.getcoreBOSUser() || Setup.corebosuser;
	$scope.mvprivatekey = coreBOSWSAPI.getcoreBOSKey() || Setup.corebosaccesskey;
	$scope.cbAPIConfigured = coreBOSWSAPI;
	$scope.cbAPIKeys = coreBOSAPIStatus;
})
.controller('moduleCtrl',function($scope, $i18next, coreBOSWSAPI, coreBOSAPIStatus) {
	$scope.myPageItemsCount = 0;
	$scope.myItemsTotalCount = 0;
	$scope.moduleList = [];
	coreBOSWSAPI.doQuery('select * from accounts limit 0,5').then(function(response) {
		$scope.moduleList = response.data.result;
		$scope.myPageItemsCount = response.data.result.length;
	});
	coreBOSWSAPI.doQuery('select count(*) from accounts').then(function(response) {
		$scope.myItemsTotalCount = response.data.result[0].count;
	});
	$scope.onServerSideItemsRequested = function(currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
		var where = coreBOSWSAPI.getWhereCondition($scope.moduleList[0],filterBy, filterByFields, orderBy, orderByReverse);
		var limit = coreBOSWSAPI.getLimit(pageItems,currentPage*pageItems);
		var query = 'select * from accounts ' + where + limit;
		coreBOSWSAPI.doQuery(query).then(function(response) {
			$scope.moduleList = response.data.result;
			$scope.myPageItemsCount = response.data.result.length;
		});
		coreBOSWSAPI.doQuery('select count(*) from accounts' + where).then(function(response) {
			$scope.myItemsTotalCount = response.data.result[0].count;
		});
	};
//	$scope.mySelectedItems = [];
//	$scope.$watch("mySelectedItems.length", function(newLength){
//	  console.log($scope.mySelectedItems);
//	});
})
.controller('listtypesCtrl',function($scope, $i18next, $filter, coreBOSWSAPI, coreBOSAPIStatus) {
	$scope.listtypes = [];
	coreBOSWSAPI.doListTypes().then(function(response) {
		$scope.listtypes = response.data.result;
		var ltypes = coreBOSWSAPI.processListTypes(response.data.result.information, false, true);
		$scope.selecttypes = ltypes;
	});
	$scope.changeModule = function() {
		coreBOSWSAPI.doDescribe($scope.selmtypes).then(function(response) {
			$scope.idPrefix = response.data.result.idPrefix;
			$scope.createable = response.data.result.createable;
			$scope.updateable = response.data.result.updateable;
			$scope.deleteable = response.data.result.deleteable;
			$scope.retrieveable = response.data.result.retrieveable;
			$scope.modulefields = $filter('formatModuleFields')(response.data.result.fields);
		});
	};
})
.controller('moduleviewCtrl',function($scope, $i18next, $routeParams, $filter, coreBOSWSAPI, coreBOSAPIStatus) {
	$scope.modulefieldList = [{field:'',val:''}];
	$scope.recordid = $routeParams.id;
	$scope.account = {};
	$scope.getModuleValue = function(field) {
		return $scope.account[field];
	};
	coreBOSWSAPI.doDescribe('Accounts').then(function(response) {
		$scope.idPrefix = response.data.result.idPrefix;
		$scope.createable = response.data.result.createable;
		$scope.updateable = response.data.result.updateable;
		$scope.deleteable = response.data.result.deleteable;
		$scope.retrieveable = response.data.result.retrieveable;
		$scope.modulename = response.data.result.name;
		$scope.modulefields = response.data.result.fields;
		if ($scope.retrieveable) {
			$scope.saveAccountModule = function() {
				coreBOSWSAPI.doUpdate('Accounts',$scope.account).then(function(response) {
					console.log('update:',response);
				});
			};
			$scope.doCreate = function() {
				coreBOSWSAPI.doCreate('Accounts',$scope.account).then(function(response) {
					console.log('create:',response);
				});
			};
			$scope.doDelete = function() {
				coreBOSWSAPI.doDelete($scope.account.id).then(function(response) {
					console.log('delete:',response);
				});
			};
			coreBOSWSAPI.doQuery('select accountname from accounts').then(function(response) {
				var aarray = [];
				angular.forEach(response.data.result, function(value, key) {
					aarray.push(value.accountname + ' (' + value.id + ')');
				});
				$scope.accs = aarray;
			});
			coreBOSWSAPI.doQuery('select first_name,last_name from users').then(function(response) {
				var uarray = [];
				angular.forEach(response.data.result, function(value, key) {
					uarray.push(value.first_name + ' ' + value.last_name + ' (' + value.id + ')');
				});
				$scope.usrs = uarray;
			});
			coreBOSWSAPI.doRetrieve($routeParams.id).then(function(response) {
				var flds = [], cols = [];
				var account = {};
				var numcols = 3;
				var lblclass = 'col-md-2', vlclass = 'col-md-2';
				angular.forEach(response.data.result, function(value, key) {
					var found = $filter('getArrayElementById')($scope.modulefields, key, 'name');
					if (key=='accountname') {
						$scope.accountname = value;
					}
					var fld = {
						label:found.label,
						labelclass:lblclass,
						field:key,
						val: value == '' ? 'none' : value,
						valclass:vlclass,
						uitype: found.uitype,
						type: found.type.name
					};
					account[key] = value;
					if (found.type.name == 'reference') {
						
					}
					if (found.type.name == 'picklist') {
						var pl = {
							defaultValue: found.type.defaultValue,
							picklistValues: found.type.picklistValues
						};
						angular.extend(fld,pl);
					}
					cols.push(fld);
					if (cols.length == numcols) {
						flds.push(cols);
						cols = [];
					}
				});
				flds.push(cols);
				$scope.modulefieldList = flds;
				$scope.account = account;
			});
		}
	});
})
.controller('relationsCtrl',function($scope, $i18next, coreBOSWSAPI, coreBOSAPIStatus) {
	$scope.pdodiscriminator = [
		'ProductBundle', 'ProductParent', 'ProductLineInvoice', 'ProductLineSalesOrder', 'ProductLineQuote',
		'ProductLineInvoiceOnly', 'ProductLineSalesOrderOnly', 'ProductLineQuoteOnly', 'ProductLineAll', 'ProductLineNone'
	];
	coreBOSWSAPI.doListTypes().then(function(response) {
		var ltypes = coreBOSWSAPI.processListTypes(response.data.result.information, false, true);
		$scope.selecttypes = ltypes;
	});
	$scope.sendgrelCall = function() {
		var queryParameters = {};
		if (!angular.isUndefined($scope.rpdodisc)) queryParameters.productDiscriminator = $scope.rpdodisc;
		if (!angular.isUndefined($scope.glimit)) queryParameters.limit = $scope.glimit;
		if (!angular.isUndefined($scope.groffset)) queryParameters.offset = $scope.groffset;
		if (!angular.isUndefined($scope.gorder)) queryParameters.orderby = $scope.gorder;
		if (!angular.isUndefined($scope.gcols)) queryParameters.columns = $scope.gcols;
		coreBOSWSAPI.doGetRelatedRecords($scope.grelrecord,$scope.gparentmodule,$scope.grelmodule, queryParameters).then(function(response) {
			$scope.grelresult = response.data;
		});
	};
	$scope.sendsrelCall = function() {
		coreBOSWSAPI.doSetRelated($scope.srelrecord,$scope.srelwith).then(function(response) {
			$scope.srelresult = response.data;
		});
	};
})
.controller('doinvokeCtrl',function($scope, $i18next, $filter, coreBOSWSAPI, coreBOSAPIStatus) {
	$scope.invokemethod = '';
	$scope.invokeparams = '{}';
	$scope.invokeexamples = ['authenticateContact','getPortalUserInfo','gettranslation','getSearchResults'];
	$scope.loadInvokeExample = function() {
		switch($scope.invokeej) {
		case 'authenticateContact':
			$scope.invokemethod = 'authenticateContact';
			$scope.invokeparams = '{ "email": "mary_smith@company.com","password": "j531iuze" }';
			$scope.invokeformat = 'GET';
			break;
		case 'getPortalUserInfo':
			$scope.invokemethod = 'getPortalUserInfo';
			$scope.invokeparams = '{}';
			$scope.invokeformat = 'POST';
			break;
		case 'gettranslation':
			$scope.invokemethod = 'gettranslation';
			//{\"Accounts\":\"Accounts\",\"LBL_LIST_ACCOUNT_NAME\":\"LBL_LIST_ACCOUNT_NAME\",\"Portal User\":\"Client Portal User\"}
			var p = {
				"language": "es_es",
				"module": "Contacts",
				"totranslate": "{\"Accounts\":\"Accounts\",\"LBL_LIST_ACCOUNT_NAME\":\"LBL_LIST_ACCOUNT_NAME\",\"Portal User\":\"Client Portal User\"}"
			};
			$scope.invokeparams = $filter('json')(p);
			$scope.invokeformat = 'POST';
			break;
		case 'getSearchResults':
			$scope.invokemethod = 'getSearchResults';
			var p = {
				query: "mary",
				search_onlyin: "",
				restrictionids: '{"userId": "19x1", "accountId": "11x4", "contactId": "12x30"}'
			};
			$scope.invokeparams = $filter('json')(p);
			$scope.invokeformat = 'POST';
			break;
		}
	};
	$scope.sendInvokeCall = function() {
		coreBOSWSAPI.doInvoke($scope.invokemethod,$scope.invokeparams,$scope.invokeformat).then(function(response) {
			$scope.invokeresult = response.data;
		});
	};
	$scope.invokeresult = '';
})
;
