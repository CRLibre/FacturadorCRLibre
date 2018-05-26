'use strict';

/* jasmine specs for services go here */
describe('Dom Utility Service', function () {
    var $dUtils;
    var $scope;
    var $linker;
    var $cache;
    beforeEach(module('ngGrid'));
    beforeEach(inject(function ($rootScope, $domUtilityService, $templateCache, $compile) {
        $scope = $rootScope.$new();
        $dUtils = $domUtilityService;
        $linker = $compile;
        $cache = $templateCache;
    }));

    // AssignGridContainers
    describe('AssignGridContainers', function () {
        it('should should find the correct elements and assign them in the grid properly', function () {
            var domsizesCalled;
            var grid = {
                elementDims: {},
                refreshDomSizes: function () {
                    domsizesCalled = true;
                }
            };
            $scope.adjustScrollTop = function(top) {
                expect(top).toEqual(grid.$canvas.scrollTop());
            };
            var root = angular.element('<div class="ng-scope ngGrid"></div>');
            root.append(angular.element($cache.get('gridTemplate.html')));
            $dUtils.AssignGridContainers($scope, root, grid);
            
            expect(grid.$root.is(".ngGrid")).toEqual(true);
            expect(grid.$root.length).toEqual(1);
            expect(grid.$topPanel.is(".ngTopPanel")).toEqual(true);
            expect(grid.$topPanel.length).toEqual(1);
            expect(grid.$groupPanel.is(".ngGroupPanel")).toEqual(true);
            expect(grid.$groupPanel.length).toEqual(1);
            expect(grid.$headerContainer.is(".ngHeaderContainer")).toEqual(true);
            expect(grid.$headerContainer.length).toEqual(1);
            expect(grid.$headerScroller.is(".ngHeaderScroller")).toEqual(true);
            expect(grid.$headerScroller.length).toEqual(1);
            expect(grid.$viewport.is(".ngViewport")).toEqual(true);
            expect(grid.$viewport.length).toEqual(1);
            expect(grid.$canvas.is(".ngCanvas")).toEqual(true);
            expect(grid.$canvas.length).toEqual(1);
            expect(grid.$footerPanel.is(".ngFooterPanel")).toEqual(true);
            expect(grid.$footerPanel.length).toEqual(1);
            expect(grid.elementDims.rootMaxH).toEqual(grid.$root.height());
            expect(domsizesCalled).toEqual(true);
        });
    });
    // BuildStyles
    describe('BuildStyles', function () {
        it('should set the $styleSheet object of the grid to be a stylesheet object with CSS', function () {
            var domsizesCalled;
            var scrollLeftCalled;
            var scrollTopCalled;

            $scope.columns = [
                { visible: true, pinned: false, width: 100, },
                { visible: true, pinned: false, width: 100, },
                { visible: true, pinned: false, width: 100, },
                { visible: true, pinned: false, width: 100, }];
            $scope.totalRowWidth = function() {
                return 400;
            };
            $scope.adjustScrollLeft = function () {
                scrollLeftCalled = true;
            };
            $scope.adjustScrollTop = function () {
                scrollTopCalled = true;
            };

            var root = angular.element('<div class="ng-scope ngGrid"></div>');
            root.append(angular.element($cache.get('gridTemplate.html')));
            var grid = {
                config: {
                    rowHeight: 30
                },
                gridId: 1,
                elementDims: {},
                refreshDomSizes: function () {
                    domsizesCalled = true;
                }
            };
            $dUtils.AssignGridContainers($scope, root, grid);
            $dUtils.BuildStyles($scope, grid, true);
            var temp = grid.$styleSheet.html();
            expect(domsizesCalled).toEqual(true);
            expect(scrollLeftCalled).toEqual(true);
            expect(scrollTopCalled).toEqual(true);
            expect(temp).toEqual(".1 .ngCanvas { width: 400px; }.1 .ngRow { width: 400px; }.1 .ngCanvas { width: 400px; }.1 .ngHeaderScroller { width: 419px}.1 .col0 { width: 100px; left: 0px; height: 30px }.1 .colt0 { width: 100px; }.1 .col1 { width: 100px; left: 100px; height: 30px }.1 .colt1 { width: 100px; }.1 .col2 { width: 100px; left: 200px; height: 30px }.1 .colt2 { width: 100px; }.1 .col3 { width: 100px; left: 300px; height: 30px }.1 .colt3 { width: 100px; }")
        });
    });
    // setColLeft
    describe('setColLeft', function () {
        it('should set the left positioning of the specified column to the given integer', function () {
            $scope.columns = [
                { visible: true, pinned: false, width: 100, index: 0 },
                { visible: true, pinned: false, width: 100, index: 1 },
                { visible: true, pinned: false, width: 100, index: 2 },
                { visible: true, pinned: false, width: 100, index: 3 }];
            $scope.totalRowWidth = function () {return 400;};
            $scope.adjustScrollLeft = function () {};
            $scope.adjustScrollTop = function () {};
            var root = angular.element('<div class="ng-scope ngGrid"></div>');
            root.append(angular.element($cache.get('gridTemplate.html')));
            var grid = {
                config: {
                    rowHeight: 30
                },
                gridId: 1,
                elementDims: {},
                refreshDomSizes: function () {}
            };
            $dUtils.AssignGridContainers($scope, root, grid);
            $dUtils.BuildStyles($scope, grid, true);
            $dUtils.setColLeft($scope.columns[0], 300, grid);
            var temp = grid.$styleSheet.html();
            expect(temp).toEqual(".1 .ngCanvas { width: 400px; }.1 .ngRow { width: 400px; }.1 .ngCanvas { width: 400px; }.1 .ngHeaderScroller { width: 419px}.1 .col0 { width: 100px; left: 300px; height: 30px }.1 .colt0 { width: 100px; }.1 .col1 { width: 100px; left: 100px; height: 30px }.1 .colt1 { width: 100px; }.1 .col2 { width: 100px; left: 200px; height: 30px }.1 .colt2 { width: 100px; }.1 .col3 { width: 100px; left: 300px; height: 30px }.1 .colt3 { width: 100px; }")
        });
    });
});

describe('Sort Service', function () {
    var $sort;
    beforeEach(module('ngGrid'));
    beforeEach(inject(function ($sortService) {
        $sort = $sortService;
    }));
});

describe('Utility Service', function () {
    var $utils;
    beforeEach(module('ngGrid'));
    beforeEach(inject(function ($utilityService) {
        $utils = $utilityService;
    }));
    // evalProperty
    describe('evalProperty should find the right property given a heirarchy.', function () {
        // foundme
        it('returns foundme', function() {
            var obj = { foo: { bar: { hello: { world: "foundme" } } } };
            expect($utils.evalProperty(obj, "foo.bar.hello.world")).toEqual("foundme");
        });
        // undefined
        it('returns undefined', function () {
            var obj = { foo: { bar: { hello: { world: "foundme" } } } };
            expect($utils.evalProperty(obj, "foo.bar.omg")).toEqual(undefined);
        });
    });
    // visualLength
    describe('visualLength should return the correct visual length of text.', function () {
        it('returns integer', function() {
            var node = angular.element('<div style="width: 30px;">The quick brown fox jumped over the lazy dog.</div>');
            expect($utils.visualLength(node)).toEqual(286);
        });
    });
    // forIn
    describe('forIn should execute the function for each key in an object.', function() {
        it('executes some code', function () {
            var obj = {
                foo: "foo",
                bar: "bar",
                hello: "hello",
                world: "world"
            };

            $utils.forIn(obj, function (val, key) {
                obj[key] = "foundme";
            });
            expect(obj.foo).toEqual("foundme");
            expect(obj.bar).toEqual("foundme");
            expect(obj.hello).toEqual("foundme");
            expect(obj.world).toEqual("foundme");
        });
    });
    // endsWith
    describe('endsWith should return true or false based on the last character in a string', function () {
        var str = "Peter Piper picked a peck of pickeled peppers";
        it('returns true', function() {
            
            expect($utils.endsWith(str, "peppers")).toEqual(true);
        });
        it('returns false', function () {
            expect($utils.endsWith(str, "peter")).toEqual(false);
        });
    });
    // isNullOrUndefined
    describe('isNullOrUndefined return true or false based on wherer or not a given reference is explucitly null or undefined', function () {
        it('returns true', function () {
            var hello; 
            expect($utils.isNullOrUndefined(hello)).toEqual(true);
            var hello = null;
            expect($utils.isNullOrUndefined(hello)).toEqual(true);
            var hello = undefined;
            expect($utils.isNullOrUndefined(hello)).toEqual(true);
            expect($utils.isNullOrUndefined(null)).toEqual(true);
            expect($utils.isNullOrUndefined(undefined)).toEqual(true);
        });
        it('returns false', function () {
            expect($utils.isNullOrUndefined("foundme")).toEqual(false);
            expect($utils.isNullOrUndefined("")).toEqual(false);
            expect($utils.isNullOrUndefined(0)).toEqual(false);
        });
    });
});
