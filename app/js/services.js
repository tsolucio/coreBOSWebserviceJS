'use strict';

/* Services */

angular.module('coreBOSJSApp.services', [])
  .value('version', '0.1')
  .factory('corebosAPIservice',function($http, Setup, md5) {
		var corebosAPI = {};
		var corebosAPIGateWay = Setup.corebosapi;
		var coreBOSUser = Setup.corebosuser;
		var coreBOSKey = Setup.corebosaccesskey;
		var marvelHash = md5.createHash(marvelTS + marvelPrivateKey + marvelPublicKey);
		var apiConfigured = false;
		
		corebosAPI.setConfigured = function(newkey) {
			apiConfigured = !(coreBOSKey=='' || coreBOSKey=='PUT YOUR USER ACCESS KEY HERE');
		}
		corebosAPI.setConfigured();
		corebosAPI.isConfigured = function(newkey) {
			return apiConfigured;
		}
		corebosAPI.setPublicKey = function(newkey) {
			marvelPublicKey = newkey;
		}
		corebosAPI.setPrivateKey = function(newkey) {
			marvelPrivateKey = newkey;
		}
		corebosAPI.getPublicKey = function() {
			return marvelPublicKey;
		}
		corebosAPI.getPrivateKey = function() {
			return marvelPrivateKey;
		}
		corebosAPI.getMarvelInfo = function(info,offset,limit) {
			var URL = corebosAPIGateWay + info + '?apikey='
			+ marvelPublicKey + '&ts=' + marvelTS + '&hash='
			+ marvelHash + '&callback=JSON_CALLBACK';
			if (offset) URL = URL + '&offset=' + offset
			if (limit) URL = URL + '&limit=' + limit
			return $http({
				method : 'JSONP',
				url : URL
			});
		}
		corebosAPI.getComics = function(offset,limit) {
			return corebosAPI.getMarvelInfo('comics',offset,limit);
		}
		corebosAPI.getComicDetails = function(comicid) {
			return $http({
				method : 'JSONP',
				url : corebosAPIGateWay + 'comics/'+comicid+'?apikey='
						+ marvelPublicKey + '&ts=' + marvelTS + '&hash='
						+ marvelHash + '&callback=JSON_CALLBACK'
			});
		}
		corebosAPI.getComicCreators = function(comicid) {
			return $http({
				method : 'JSONP',
				url : corebosAPIGateWay + 'comics/'+comicid+'/creators?apikey='
						+ marvelPublicKey + '&ts=' + marvelTS + '&hash='
						+ marvelHash + '&callback=JSON_CALLBACK'
			});
		}
		corebosAPI.getComicEvents = function(comicid) {
			return $http({
				method : 'JSONP',
				url : corebosAPIGateWay + 'comics/'+comicid+'/events?apikey='
						+ marvelPublicKey + '&ts=' + marvelTS + '&hash='
						+ marvelHash + '&callback=JSON_CALLBACK'
			});
		}
		corebosAPI.getCharacters = function(offset,limit) {
			return corebosAPI.getMarvelInfo('characters',offset,limit);
		}
		corebosAPI.getCreators = function(offset,limit) {
			return corebosAPI.getMarvelInfo('creators',offset,limit);
		}
		corebosAPI.getEvents = function(offset,limit) {
			return corebosAPI.getMarvelInfo('events',offset,limit);
		}
		corebosAPI.getSeries = function(offset,limit) {
			return corebosAPI.getMarvelInfo('series',offset,limit);
		}
		corebosAPI.getStories = function(offset,limit) {
			return corebosAPI.getMarvelInfo('stories',offset,limit);
		}

		return corebosAPI;
	}
)
.factory('corebosAPIInvalidKeys',function() {
	var invalidKeys = true;
	var corebosAPIIK = {};
	corebosAPIIK.hasInvalidKeys = function() {
		return this.invalidKeys;
	}
	corebosAPIIK.setInvalidKeys = function(ikey) {
		this.invalidKeys = ikey;
	}
	return corebosAPIIK;
})
.factory('corebosAPIInterceptor',function($q, corebosAPIInvalidKeys, $location, Setup) {
	return {
		'response': function(response) {
			if (response.config.url.indexOf(Setup.corebosapi)>0) {
				corebosAPIInvalidKeys.setInvalidKeys(false);
			}
			return response;
		},
		'responseError': function (rejection) {
			var status = rejection.status;
			if ((status==401 || status==404) && rejection.config.url.indexOf(Setup.corebosapi)>0) {
				corebosAPIInvalidKeys.setInvalidKeys(true);
				$location.path('/config')
			}
			return  $q.reject(rejection);
		}
	};
});