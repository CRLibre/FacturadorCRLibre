﻿ngGridDirectives.directive('ngGrid', ['$compile', '$filter', '$templateCache', '$sortService', '$domUtilityService', '$utilityService', '$timeout', '$parse', function ($compile, $filter, $templateCache, sortService, domUtilityService, $utils, $timeout, $parse) {
    var ngGridDirective = {
        scope: true,
        compile: function() {
            return {
                pre: function($scope, iElement, iAttrs) {
                    var $element = $(iElement);
                    var options = $scope.$eval(iAttrs.ngGrid);
                    options.gridDim = new ngDimension({ outerHeight: $($element).height(), outerWidth: $($element).width() });
                    var grid = new ngGrid($scope, options, sortService, domUtilityService, $filter, $templateCache, $utils, $timeout, $parse);

                    // if columndefs are a string of a property ont he scope watch for changes and rebuild columns.
                    if (typeof options.columnDefs == "string") {
                        $scope.$parent.$watch(options.columnDefs, function (a) {
                            if (!a) {
                                grid.refreshDomSizes();
                                grid.buildColumns();
                                return;
                            }
                            // we have to set this to false in case we want to autogenerate columns with no initial data.
                            grid.lateBoundColumns = false;
                            $scope.columns = [];
                            grid.config.columnDefs = a;
                            grid.buildColumns();
                            grid.configureColumnWidths();
                            grid.eventProvider.assignEvents();
                            domUtilityService.RebuildGrid($scope, grid);
                        });
                    } else {
						grid.buildColumns();
					}
					
                    // if it is a string we can watch for data changes. otherwise you won't be able to update the grid data
                    if (typeof options.data == "string") {
                        var dataWatcher = function (a) {
                            // make a temporary copy of the data
                            grid.data = $.extend([], a);
                            grid.rowFactory.fixRowCache();
                            angular.forEach(grid.data, function (item, j) {
                                var indx = grid.rowMap[j] || j;
                                if (grid.rowCache[indx]) {
                                    grid.rowCache[indx].ensureEntity(item);
                                }
                                grid.rowMap[indx] = j;
                            });
                            grid.searchProvider.evalFilter();
                            grid.configureColumnWidths();
                            grid.refreshDomSizes();
                            if (grid.config.sortInfo.fields.length > 0) {
                                grid.getColsFromFields();
                                grid.sortActual();
                                grid.searchProvider.evalFilter();
                                $scope.$emit('ngGridEventSorted', grid.config.sortInfo);
                            }
                            $scope.$emit("ngGridEventData", grid.gridId);
                        };
                        $scope.$parent.$watch(options.data, dataWatcher);
                        $scope.$parent.$watch(options.data + '.length', function() {
                            dataWatcher($scope.$eval(options.data));
                        });
                    }
					
                    grid.footerController = new ngFooter($scope, grid);
                    //set the right styling on the container
                    iElement.addClass("ngGrid").addClass(grid.gridId.toString());
                    if (!options.enableHighlighting) {
                        iElement.addClass("unselectable");
                    }
                    if (options.jqueryUITheme) {
                        iElement.addClass('ui-widget');
                    }
                    iElement.append($compile($templateCache.get('gridTemplate.html'))($scope)); // make sure that if any of these change, we re-fire the calc logic
                    //walk the element's graph and the correct properties on the grid
                    domUtilityService.AssignGridContainers($scope, iElement, grid);
                    //now use the manager to assign the event handlers
                    grid.eventProvider = new ngEventProvider(grid, $scope, domUtilityService, $timeout);

                    // method for user to select a specific row programatically
                    options.selectRow = function (rowIndex, state) {
                        if (grid.rowCache[rowIndex]) {
                            if (grid.rowCache[rowIndex].clone) {
                                grid.rowCache[rowIndex].clone.setSelection(state ? true : false);
                            } 
                            grid.rowCache[rowIndex].setSelection(state ? true : false);
                        }
                    };
                    // method for user to select the row by data item programatically
                    options.selectItem = function (itemIndex, state) {
                        options.selectRow(grid.rowMap[itemIndex], state);
                    };
                    // method for user to set the select all state.
                    options.selectAll = function (state) {
                        $scope.toggleSelectAll(state);
                    };
                    // method for user to set the groups programatically
                    options.groupBy = function (field) {
                        if (field) {
                            $scope.groupBy($scope.columns.filter(function(c) {
                                return c.field == field;
                            })[0]);
                        } else {
                            var arr = $.extend(true, [], $scope.configGroups);
                            angular.forEach(arr, $scope.groupBy);
                        }
                    };
                    // method for user to set the sort field programatically
                    options.sortBy = function (field) {
                        var col = $scope.columns.filter(function (c) {
                            return c.field == field;
                        })[0];
                        if (col) col.sort();
                    };
                    // the grid Id, entity, scope for convenience
					options.gridId = grid.gridId;
					options.ngGrid = grid;
					options.$gridScope = $scope;
					$scope.$on('ngGridEventDigestGrid', function(){
						domUtilityService.digest($scope.$parent);
					});			
					
					$scope.$on('ngGridEventDigestGridParent', function(){
						domUtilityService.digest($scope.$parent);
					});
                    // set up the columns 
                    $scope.$evalAsync(function() {
                        $scope.adjustScrollLeft(0);
                    });
                    //initialize plugins.
                    angular.forEach(options.plugins, function (p) {
                        if (typeof p === 'function') {
                            p = p.call(this);
                        }
                        p.init($scope.$new(), grid, { SortService: sortService, DomUtilityService: domUtilityService });
                        options.plugins[$utils.getInstanceType(p)] = p;
                    });
                    //send initi finalize notification.
                    if (options.init == "function") {
                        options.init(grid, $scope);
                    }
                    return null;
                }
            };
        }
    };
    return ngGridDirective;
}]);