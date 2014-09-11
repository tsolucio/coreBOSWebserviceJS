/* coreBOS Webservice API Service */
'use strict';
angular.module('coreBOSAPIservice', [])
  .value('version', 'coreBOS2.1')
  .factory('coreBOSWSAPI', function($http, md5, $filter, coreBOSAPIStatus) {

		// Webservice access point
		var _servicebase = 'webservice.php';
		var _serviceurl = _servicebase;

		// Webservice user credentials
		var _serviceuser= false;
		var _servicekey = false;

		// Webservice login validity
		var _servertime = false;
		var _expiretime = false;
		var _servicetoken=false;

		var corebosAPI = {};
		var apiConfigured = false;
		
		corebosAPI.setConfigured = function() {
			apiConfigured = !(_servicekey=='' || _servicekey=='PUT YOUR USER ACCESS KEY HERE');
		};
		corebosAPI.setConfigured();
		corebosAPI.isConfigured = function(newkey) {
			return apiConfigured;
		};
		corebosAPI.setcoreBOSUser = function(newkey,dologin) {
			dologin = typeof dologin !== 'undefined' ? dologin : false;
			_serviceuser = newkey;
			if (dologin)
				corebosAPI.doLogin(corebosAPI.getcoreBOSUser(),corebosAPI.getcoreBOSKey()).then(function() {});
		};
		corebosAPI.getcoreBOSUser = function() {
			return _serviceuser;
		};
		corebosAPI.setcoreBOSKey = function(newkey,dologin) {
			dologin = typeof dologin !== 'undefined' ? dologin : false;
			_servicekey = newkey;
			corebosAPI.setConfigured();
			if (dologin)
				corebosAPI.doLogin(corebosAPI.getcoreBOSUser(),corebosAPI.getcoreBOSKey()).then(function() {});
		};
		corebosAPI.getcoreBOSKey = function() {
			return _servicekey;
		};
		
		// Get the URL for sending webservice request.
		function getWebServiceURL(url) {
			if(url.indexOf(_servicebase) == -1) {  // no servicebase so we setup the whole thing
				if(url.charAt(url.length-1) != '/') {
					url = url + '/';
				}
				url = url + _servicebase;
			} // if not we suppose the URL is correct
			return url;
		}
		corebosAPI.setURL = function(url,dologin) {
			dologin = typeof dologin !== 'undefined' ? dologin : false;
			_serviceurl = getWebServiceURL(url);
			coreBOSAPIStatus.setServiceURL(url); // to control invalid access
			if (dologin)
				corebosAPI.doLogin(corebosAPI.getcoreBOSUser(),corebosAPI.getcoreBOSKey()).then(function() {});
		};
		corebosAPI.getURL = function() {
			return _serviceurl;
		};
		
		// Last operation error information
		var _lasterror  = false;
		
		corebosAPI.getlasterror = function() {
			return corebosAPI._lasterror;
		};
		// Check if result has any error.
		corebosAPI.hasError = function(resultdata) {
			if (resultdata != null && resultdata['success'] == false) {
				corebosAPI._lasterror = resultdata['error'];
				return true;
			}
			corebosAPI._lasterror = false;
			return false;
		};

		/**
		 * Perform the challenge
		 * @access private
		 */
		function __doChallenge(username) {
			var getdata = {
				'operation' : 'getchallenge',
				'username'  : username
			};
			return $http({
				method : 'GET',
				url : _serviceurl,
				params: getdata
			});
		};

		function processDoChallenge(res, status) {
			var resobj = res.data;
			if(corebosAPI.hasError(res.data) == false) {
				var result = resobj['result'];
				_servicetoken = result.token;
				_servertime = result.serverTime;
				_expiretime = result.expireTime;
			}
		}

		/**
		 * Do Login Operation
		 */
		corebosAPI.doLogin = function(username, accesskey) {
			if (username==undefined) username = corebosAPI.getcoreBOSUser();
			if (accesskey==undefined) accesskey = corebosAPI.getcoreBOSKey();
			return __doChallenge(username).then(function(res){
				processDoChallenge(res);
				if(_servicetoken == false) {
					return false;  // Failed to get the service token
				}
	
				corebosAPI.setcoreBOSUser(username);
				corebosAPI.setcoreBOSKey(accesskey);

				var postdata = {
					'operation' : 'login',
					'username'  : username,
					'accessKey' : md5.createHash(_servicetoken + accesskey)
				};
				return $http({
					method : 'POST',
					url : _serviceurl,
					data: postdata
				});
			}); // end then doChallenge
		};

		/**
		 * Get actual record id from the response id.
		 */
		corebosAPI.getRecordId = function(id) {
			if (typeof id === 'undefined') return 0;
			var ids = id.split('x');
			return ids[1];
		};

		/**
		 * Do Query Operation.
		 */
		corebosAPI.doQuery = function(query) {
			if(query.indexOf(';') == -1) query += ';';

			var getdata = {
				'operation'    : 'query',
				'sessionName'  : coreBOSAPIStatus.getSessionInfo()._sessionid,
				'query'        : query
			};
			return $http({
				method : 'GET',
				url : _serviceurl,
				params: getdata
			});
		};

		corebosAPI.getWhereCondition = function(firstrow, filterBy, filterByFields, orderBy, orderByReverse, glue) {
			var where = '';
			if (angular.isUndefined(glue) || glue == '') glue = ' and ';
			if (filterBy != null ) {
				var row = [];
				row.push(firstrow);
				var search_cols = coreBOSWSAPI.getResultColumns(row);
				angular.forEach(search_cols, function(value, key) {
					if (where != '') {
						where = where + glue;
					} else {
						where = ' where ';
					}
					where = where + value + " like '%" + filterBy + "%' ";
				});
			}
			if (where == '' && !angular.equals({}, filterByFields)) {
				angular.forEach(filterByFields, function(value, key) {
					if (where != '') {
						where = where + glue;
					} else {
						where = ' where ';
					}
					where = where + key + " like '%" + value + "%' ";
				});
			}
			if (orderBy != null) {
				where = where + ' order by ' + orderBy + ' ';
				if (orderByReverse) {
					where = where + ' desc ';
				}
			}
			return where;
		};

		corebosAPI.getLimit = function(limit,offset) {
			var limit_cond = '';
			if (angular.isNumber(limit)) {
				if (!angular.isNumber(offset)) offset = '0';
				limit_cond = ' limit '+ offset + ',' + limit + ' ';
			}
			return limit_cond;
		};

		/**
		 * Get Result Column Names.
		 */
		corebosAPI.getResultColumns = function(result) {
			var columns = [];
			if(result != null && result.length != 0) {
				angular.forEach(result[0], function(value, key) {
					columns.push(key);
				});
			}
			return columns;
		};

		/**
		 * List types (modules) available.
		 */
		corebosAPI.doListTypes = function() {
			var getdata = {
				'operation'    : 'listtypes',
				'sessionName'  : coreBOSAPIStatus.getSessionInfo()._sessionid
			};
			return $http({
				method : 'GET',
				url : _serviceurl,
				params: getdata
			});
		};

		/**
		 * Process List types (modules).
		 * @param ListType.Information object returned from doListTypes call
		 * @param OnlyEntities boolean true if only Entity modules are to be returned
		 * @param SortResult boolean true if the result should be sorted by label
		 * @returns array of json objects with name of module and it's label
		 * can be used in a "select" like this:
		 * <select ng-model="selmtypes" ng-options="value.name as value.label for value in selecttypes"></select>
		 */
		corebosAPI.processListTypes = function(ListTypeInformation,OnlyEntities,SortResult) {
			if (angular.isUndefined(OnlyEntities) || OnlyEntities == '') OnlyEntities = false;
			if (angular.isUndefined(SortResult) || SortResult == '') SortResult = false;
			var ltypes = [];
			if(ListTypeInformation != null && !angular.equals({}, ListTypeInformation)) {
				angular.forEach(ListTypeInformation, function(value, key) {
					var option = {};
					if (OnlyEntities) {
						if (value.isEntity) {
							option.name = key;
							option.label = value.label;
							ltypes.push(option);
						}
					} else {
						option.name = key;
						option.label = value.label;
						ltypes.push(option);
					}
				});
			}
			if (SortResult) {
				ltypes.sort(function(a, b) {return a.label.localeCompare(b.label);});
			}
			return ltypes;
		};

		/**
		 * Do Describe Operation
		 */
		corebosAPI.doDescribe = function(module) {
			var getdata = {
				'operation'    : 'describe',
				'sessionName'  : coreBOSAPIStatus.getSessionInfo()._sessionid,
				'elementType'  : module
			};
			return $http({
				method : 'GET',
				url : _serviceurl,
				params: getdata
			});
		};

		/**
		 * Retrieve details of record
		 */
		corebosAPI.doRetrieve = function(record) {
			var getdata = {
				'operation'    : 'retrieve',
				'sessionName'  : coreBOSAPIStatus.getSessionInfo()._sessionid,
				'id'           : record
			};
			return $http({
				method : 'GET',
				url : _serviceurl,
				params: getdata
			});
		};

		/**
		 * Invoke custom operation
		 */
		corebosAPI.doInvoke = function(method, params, type) {
			if(typeof(params) == 'undefined') params = {};
			if (angular.isString(params)) params = JSON.parse(params);
			var reqtype = 'POST';
			if(typeof(type) != 'undefined') reqtype = type.toUpperCase();

			var senddata = {
				'operation' : method,
				'sessionName' : coreBOSAPIStatus.getSessionInfo()._sessionid
			};
			senddata = angular.extend(senddata,params);
			if (reqtype=='POST') {
				var http_method = { data: senddata};
			} else {
				var http_method = { params: senddata};
			}
			var invokecall = {
				method : reqtype,
				url : _serviceurl,
			};
			var invokecall = angular.extend(invokecall,http_method);
			return $http(invokecall);
		};

		/**
		 * Retrieve related records.
		 */
		corebosAPI.doGetRelatedRecords = function(record, module, relatedModule, queryParameters) {
			if (angular.isObject(queryParameters)) queryParameters = $filter('json')(queryParameters);
			var senddata = {
				'operation' : 'getRelatedRecords',
				'sessionName' : coreBOSAPIStatus.getSessionInfo()._sessionid,
				'id' : record,
				'module' : module,
				'relatedModule' : relatedModule,
				'queryParameters' : queryParameters
			};
			return $http({
				method : 'POST',
				url : _serviceurl,
				data: senddata
			});
		};

		/**
		 * Set relation between records.
		 * param relate_this_id string ID of record we want to related other records with
		 * param with_this_ids string/array either a string with one unique ID or an array of IDs to relate to the first parameter
		 */
		corebosAPI.doSetRelated = function(relate_this_id, with_these_ids) {
			if (angular.isObject(with_these_ids)) with_these_ids = $filter('json')(with_these_ids);
			var senddata = {
				'operation' : 'SetRelation',
				'sessionName' : coreBOSAPIStatus.getSessionInfo()._sessionid,
				'relate_this_id' : relate_this_id,
				'with_these_ids' : with_these_ids
			};
			return $http({
				method : 'POST',
				url : _serviceurl,
				data: senddata
			});
		};

		return corebosAPI;
	}
)
.factory('coreBOSAPIStatus',function() {
	var sessioninfo = {};
	var serviceurl = '';
	var invalidKeys = true;
	var corebosAPIIK = {};
	corebosAPIIK.hasInvalidKeys = function() {
		return this.invalidKeys;
	};
	corebosAPIIK.setInvalidKeys = function(ikey) {
		this.invalidKeys = ikey;
	};
	corebosAPIIK.setServiceURL = function(srvurl) {
		this.serviceurl = srvurl;
	};
	corebosAPIIK.getServiceURL = function() {
		return this.serviceurl;
	};
	corebosAPIIK.setSessionInfo = function(sinfo) {
		this.sessioninfo = sinfo;
	};
	corebosAPIIK.getSessionInfo = function() {
		return this.sessioninfo;
	};
	return corebosAPIIK;
})
.factory('corebosAPIInterceptor',function($q, coreBOSAPIStatus, $location) {
	return {
		'response': function(response) {
			if (response.config.url.indexOf(coreBOSAPIStatus.getServiceURL())!=-1) {
				coreBOSAPIStatus.setInvalidKeys(false);
				if (response.config.data != undefined && response.config.data.operation == 'login') {
					if (response.data.success) {  // we have a successful login > we have to save the session
						coreBOSAPIStatus.setSessionInfo({
							_sessionid: response.data.result.sessionName,
							_userid: response.data.result.userId
						});
					} else {  // unsuccessful login
						response.status = 401;
						response.statusText = response.data.error.code;
						return $q.reject(response);
					}
				}
			}
			return response;
		},
		'responseError': function (rejection) {
			var status = rejection.status;
			if ((status==401 || status==404) && rejection.config.url.indexOf(coreBOSAPIStatus.getServiceURL())!=-1) {
				coreBOSAPIStatus.setInvalidKeys(true);
			}
			return  $q.reject(rejection);
		}
	};
})
.config(function($httpProvider) {
	$httpProvider.interceptors.push('corebosAPIInterceptor');
})
;
