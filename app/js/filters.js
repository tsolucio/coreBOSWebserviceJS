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
	};
})
.filter("formatNameInfo", function() {
	return function(label,name) {
		return '<b>' + label + '</b><br>' + name;
	};
})
.filter("formatFieldInfo", function() {
	return function(field) {
		var finfo = '';
		if (!angular.isUndefined(field)) {
			finfo = finfo + 'Mandatory: ' + (field.mandatory ? 'yes' : 'no') + '<br>';
			finfo = finfo + 'Null: ' + (field.nullable ? 'yes' : 'no') + '<br>';
			finfo = finfo + 'Editable: ' + (field.editable ? 'yes' : 'no');
			finfo = finfo + (angular.isUndefined(field.sequence) ? '' : '<br>Sequence: ' + field.sequence);
		}
		return finfo;
	};
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
	};
})
.filter("formatTypeInfo", function() {
	return function(field) {
		var tinfo = '';
		if (!angular.isUndefined(field.type)) {
			tinfo = 'Type: ' + field.type.name;
			tinfo = tinfo + (angular.isUndefined(field.typeofdata) ? '' : '&nbsp;(' + field.typeofdata + ')');
			tinfo = tinfo + (angular.isUndefined(field.uitype) ? '' : '<br>UIType: ' + field.uitype);
			tinfo = tinfo + (angular.isUndefined(field.type.format) ? '' : '<br>Format: ' + field.type.format);
			tinfo = tinfo + (angular.isUndefined(field['default']) ? '' : '<br>Default: ' + field['default']);
		}
		return tinfo;
	};
})
.filter("formatReferenceInfo", function() {
	return function(reference) {
		var rinfo = '';
		if (!angular.isUndefined(reference.refersTo)) {
			angular.forEach(reference.refersTo, function (value, key) {
				rinfo = rinfo + value + ', ';
			});
		}
		if (!angular.isUndefined(reference.picklistValues)) {
			angular.forEach(reference.picklistValues, function (value, key) {
				rinfo = rinfo + value.label + ': ' + value.value + ', ';
			});
		}
		return rinfo.substring(0, rinfo.length - 2);
	};
})
.filter("formatModuleFields", function($filter) {
	return function(mfields) {
		var rinfo = [];
		if (!angular.isUndefined(mfields)) {
			angular.forEach(mfields, function(value, key) {
				var finfo = {
					labelinfo: $filter('formatNameInfo')(value.label,value.name),
					fieldinfo: $filter('formatFieldInfo')(value),
					blockinfo: $filter('formatBlockInfo')(value.block),
					typeinfo: $filter('formatTypeInfo')(value),
					refinfo: $filter('formatReferenceInfo')(value.type)
				};
				rinfo.push(finfo);
			});
		}
		return rinfo;
	};
})
.filter('interpolate', [ 'version', function(version) {
	return function(text) {
		return String(text).replace(/\%VERSION\%/mg, version);
	};
} ]);
