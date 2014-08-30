angular.module('coreBOSJSApp.setup', [])
.constant('Setup', {
	debug:			true,
	
	corebosapi:			'http://localhost/coreBOSwork',
	corebosuser:		'admin',
	corebosaccesskey:	'PUT YOUR USER ACCESS KEY HERE',  //**** DO NOT SHARE THIS WITH ANYONE!!! ***
	
	// default theme
	themeId: 		'bs-binary-admin',
	
	// default lanugage
	language: 		'es',
	
	// app branding
	app:			'coreBOSJS',
	version:		'1.0',
	copy: 			'Made by Joe Bordes, JPL TSolucio, S.L.'
	
});