/* coreBOS Webservice API Service */
'use strict';
angular.module('coreBOSAPIservice', [])
  .value('version', 'coreBOS2.1')
  .factory('coreBOSWSAPI', function($http, md5, $rootScope, corebosAPIKeys) {

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
		}
		corebosAPI.setConfigured();
		corebosAPI.isConfigured = function(newkey) {
			return apiConfigured;
		}
		corebosAPI.setcoreBOSUser = function(newkey) {
			_serviceuser = newkey;
		}
		corebosAPI.getcoreBOSUser = function() {
			return _serviceuser;
		}
		corebosAPI.setcoreBOSKey = function(newkey) {
			_servicekey = newkey;
			corebosAPI.setConfigured();
		}
		corebosAPI.getcoreBOSKey = function() {
			return _servicekey;
		}
		
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
		corebosAPI.setURL = function(url) {
			_serviceurl = getWebServiceURL(url);
			corebosAPIKeys.setServiceURL(url); // to control invalid access
		}
		corebosAPI.getURL = function() {
			return _serviceurl;
		}
		
		// Last operation error information
		var _lasterror  = false;
		
		corebosAPI.getlasterror = function() {
			return corebosAPI._lasterror;
		}
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

			var reqtype = 'GET';
			var getdata = {
				'operation'    : 'query',
				'sessionName'  : corebosAPIKeys.getSessionInfo()._sessionid,
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
		}

		corebosAPI.getLimit = function(limit,offset) {
			var limit_cond = '';
			if (angular.isNumber(limit)) {
				if (!angular.isNumber(offset)) offset = '0';
				limit_cond = ' limit '+ offset + ',' + limit + ' ';
			}
			return limit_cond;
		}

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
				'sessionName'  : corebosAPIKeys.getSessionInfo()._sessionid
			};
			return $http({
				method : 'GET',
				url : _serviceurl,
				params: getdata
			});
		};

		return corebosAPI;
	}
)
.factory('corebosAPIKeys',function() {
	var sessioninfo = {};
	var serviceurl = '';
	var invalidKeys = true;
	var corebosAPIIK = {};
	corebosAPIIK.hasInvalidKeys = function() {
		return this.invalidKeys;
	}
	corebosAPIIK.setInvalidKeys = function(ikey) {
		this.invalidKeys = ikey;
	}
	corebosAPIIK.setServiceURL = function(srvurl) {
		this.serviceurl = srvurl;
	}
	corebosAPIIK.getServiceURL = function() {
		return this.serviceurl;
	}
	corebosAPIIK.setSessionInfo = function(sinfo) {
		this.sessioninfo = sinfo;
	}
	corebosAPIIK.getSessionInfo = function() {
		return this.sessioninfo;
	}
	return corebosAPIIK;
})
.factory('corebosAPIInterceptor',function($q, corebosAPIKeys, $location) {
	return {
		'response': function(response) {
			if (response.config.url.indexOf(corebosAPIKeys.getServiceURL())!=-1) {
				corebosAPIKeys.setInvalidKeys(false);
				if (response.config.data != undefined && response.config.data.operation == 'login') {
					if (response.data.success) {  // we have a successful login > we have to save the session
						corebosAPIKeys.setSessionInfo({
							_sessionid: response.data.result.sessionName,
							_userid: response.data.result.userId
						});
					} else {  // unsuccessful login
						response.status = 401;
						response.statusText = response.data.error.code;
						return $q.reject(response)
					}
				}
			}
			return response;
		},
		'responseError': function (rejection) {
			var status = rejection.status;
			if ((status==401 || status==404) && rejection.config.url.indexOf(corebosAPIKeys.getServiceURL())!=-1) {
				corebosAPIKeys.setInvalidKeys(true);
			}
			return  $q.reject(rejection);
		}
	};
})
.config(function($httpProvider) {
	$httpProvider.interceptors.push('corebosAPIInterceptor');
//	coreBOSWSAPI.setcoreBOSUser(Setup.corebosuser);
//	coreBOSWSAPI.setcoreBOSKey(Setup.corebosaccesskey);
//	coreBOSWSAPI.setURL(Setup.corebosapi);
})
;
