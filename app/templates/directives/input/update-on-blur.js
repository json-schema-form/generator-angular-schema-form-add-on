angular.module('asfAddon').directive('updateOnBlur', [function() {
  return {
    require: 'ngModel',
    restrict: 'E',
    scope: {},
    templateUrl: 'src/templates/update-on-blur-directive.html',
    link: function(scope, element, attrs, ngModel) {

      ngModel.$render(function() {
        scope.modelValue = ngModel.$viewValue();
      });

      scope.updateModel = function(value) {
        ngModel.$setViewValue(value);
      };

    }
  };
}]);
