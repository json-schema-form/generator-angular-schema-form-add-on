angular.module('<%= module %>').directive('updateOnBlur', function () {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {},
    template: '<input type="text" class="form-control" ng-model="modelValue" ng-blur="updateModel(modelValue)"></input>',
    link: function (scope, element, attrs, ngModel) {
      scope.modelValue = ngModel.$viewValue;

      scope.updateModel = function (modelValue) {
        ngModel.$setViewValue(modelValue);
      };
    },
  };
});
