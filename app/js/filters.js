'use strict';

/* Filters */

angular.module('coreBOSJSApp.filters', [])
.filter('getById', function() {
	return function(input, idvalue, idprop) {
		if (idprop===undefined) idprop='id';
		var i = 0, len = input.length;
		for (; i < len; i++) {
			if (input[i][idprop] == idvalue) {
				return input[i];
			}
		}
		return null;
	}
})
.filter("formatNameInfo", function() {
	return function(name) {
		var ninfo = '';
		if (!angular.isUndefined(name)) {
			ninfo = '<b>' + name.label + '<b><br>' + name.name;
		}
		return ninfo;
	}
})
.filter("formatFieldInfo", function() {
	return function(field) {
		var finfo = '';
		if (!angular.isUndefined(field)) {
			finfo = finfo + 'Mandatory: ' + (mandatory ? 'yes' : 'no') + '<br>';
//			Null: {{gridItem.nullable ? 'yes' : 'no'}}<br>
//			Editable: {{gridItem.editable ? 'yes' : 'no'}}
//			{{angular.isUndefined(gridItem.sequence) ? '' : '<br>Sequence: ' + gridItem.sequence}}
		}
		return finfo;
	}
})
.filter("formatBlockInfo", function() {
	return function(block) {
		var binfo = '';
		if (!angular.isUndefined(block)) {
			binfo = 'ID: ' + block.blockid + '<br>';
			binfo = binfo + 'Sequence: ' + block.blocksequence + '<br>';
			binfo = binfo + 'Label: ' + block.blocklabel + '<br>';
			binfo = binfo + 'Name: ' + block.blockname;
		}
		return binfo;
	}
})
.filter("formatTypeInfo", function() {
	return function(type) {
		var tinfo = '';
		if (!angular.isUndefined(type)) {
			tinfo = 'Type: ' + type.name;
	//		tinfo = tinfo + (angular.isUndefined(gridItem.typeofdata) ? '' : '&nbsp;(' + gridItem.typeofdata + ')');
	//		tinfo = tinfo + (angular.isUndefined(gridItem.uitype) ? '' : '<br>UIType: ' + gridItem.uitype);
			tinfo = tinfo + (angular.isUndefined(type.format) ? '' : '<br>Format: ' + type.format);
	//		tinfo = tinfo + (angular.isUndefined(gridItem.default) ? '' : '<br>Default: ' + gridItem.default);
		}
		return tinfo;
	}
})
.filter("formatReferenceInfo", function() {
	return function(reference) {
		var rinfo = '';
		if (!angular.isUndefined(reference)) {
			rinfo = rinfo + (angular.isUndefined(refersTo) ? '' : refersTo);
			rinfo = rinfo + (angular.isUndefined(picklistValues) ? '' : picklistValues);
		}
		return rinfo;
	}
})
.filter('interpolate', [ 'version', function(version) {
	return function(text) {
		return String(text).replace(/\%VERSION\%/mg, version);
	};
} ]);
