'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
	beforeEach(module('coreBOSJSApp'));
  //beforeEach(module('coreBOSJSApp.controllers'));
  //beforeEach(module('coreBOSJSApp.services'));
  //beforeEach(module('coreBOSJSApp.ngRoute'));


  it('should ....', inject(function($controller) {
    //spec body
    var myCtrl1 = $controller('moduleCtrl', { $scope: {} });
    expect(myCtrl1).toBeDefined();
  }));

  it('should ....', inject(function($controller) {
    //spec body
    var myCtrl2 = $controller('comicCtrl', { $scope: {} });
    expect(myCtrl2).toBeDefined();
  }));
});
