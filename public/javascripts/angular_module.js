angular.module('Onto', [])

.directive('select', function () {
    return {
        model: {
            size: '@'
        },
        link: function ($scope, element, attrs, controller) {
           $('select').formSelect();
        }
    };
})

.controller('editController', function($scope, $http) {
	
	$scope.classes = [];
	var count = 0;
	$scope.add_class = function(){
		count++;
		$scope.classes.push({index: count , name: 'Clase'+count, attributes: [], instances:[] })
		M.updateTextFields();

		$http({
			method: 'POST',
			url: '/ontology/class/create/'+current_ontology._id,
			data: {
				classes: {index: count , name: 'Clase'+count, attributes: [], instances:[] }
			}
			}).then(function successCallback(response) {
				//M.toast({html: 'Cambios Guardados'})

			}, function errorCallback(response) {
				M.toast({html: 'Error al Guardar'})
			})
		
	}

	$scope.push_att = function(index){
		for (var i = 0; i < $scope.classes.length; i++) {
			if (parseInt(index) == $scope.classes[i].index){
				$scope.classes[i].attributes.push({ name: 'NuevoAtributo', type: 'N/A' });
				break;
			}
		}
		$('select').formSelect();
	}
	$scope.pop_att = function(index){
		for (var i = 0; i < $scope.classes.length; i++) {
			if (parseInt(index) == $scope.classes[i].index){
				if ($scope.classes[i].attributes.length > 0 ){
					$scope.classes[i].attributes.pop();
					break;
				}
			}
		}	
	}
	$scope.push_inst = function(index){
		for (var i = 0; i < $scope.classes.length; i++) {
			if (parseInt(index) == $scope.classes[i].index){
				$scope.classes[i].instances.push({ name: 'NuevaInstancia' });
				break;
			}
		}
	}
	$scope.pop_inst = function(index){
		for (var i = 0; i < $scope.classes.length; i++) {
			if (parseInt(index) == $scope.classes[i].index){
				if ($scope.classes[i].instances.length > 0 ){
					$scope.classes[i].instances.pop();
					break;
				}
			}
		}
	}	
	$scope.save_class = function(index){

	}
});