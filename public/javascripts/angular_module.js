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
	for (var i = 0; i < current_ontology.classes.length; i++) {
		count++;
		$scope.classes.push({index: count , _id: current_ontology.classes[i]._id ,name: current_ontology.classes[i].name, attributes: [], instances: current_ontology.classes[i].entities })
	}

	$scope.add_class = function(){
		count++;
		$http({
			method: 'POST',
			url: '/ontology/class/create/'+current_ontology._id,
			data: {
				classes: {index: count , name: 'Clase'+count, attributes: [], instances:[] }
			}
			}).then(function successCallback(response) {
				console.log(response);
				$scope.classes.push({index: count , _id: response._id ,name: 'Clase'+count, attributes: [], instances:[] })
				M.updateTextFields();

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
				var random_str = makeid();
				$http({
					method: 'POST',
					url: '/ontology/instance/create/'+$scope.classes[i]._id,
					data: {
						name: 'NuevaInstancia-'+random_str
					}
					}).then(function successCallback(response) {
						//console.log(response);
						$scope.classes[i].instances.push({ name: 'NuevaInstancia-'+random_str, _id: response._id });
						M.updateTextFields();

					}, function errorCallback(response) {
						M.toast({html: 'Error al Guardar'})
					})
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
	$scope.edit_class = function(index){
		console.log('blured_class '+index);
		for (var i = 0; i < $scope.classes.length; i++) {
			if (parseInt(index) == $scope.classes[i].index){
				$http({
					method: 'PUT',
					url: '/ontology/class/'+$scope.classes[i]._id,
					data: {
						name: $scope.classes[i].name
					}
					}).then(function successCallback(response) {
						//console.log(response);

					}, function errorCallback(response) {
						M.toast({html: 'Error al Guardar'})
					})
				break;
			}
		}
	}
	function makeid() {
	  var text = "";
	  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	  for (var i = 0; i < 4; i++)
	    text += possible.charAt(Math.floor(Math.random() * possible.length));

	  return text;
	}
});