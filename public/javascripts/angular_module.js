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
	$scope.global_instances = [];
	var count = 0;
	for (var i = 0; i < current_ontology.classes.length; i++) {
		count++;
		$scope.classes.push({index: count , _id: current_ontology.classes[i]._id ,name: current_ontology.classes[i].name, attributes: [], instances: current_ontology.classes[i].entities })
		
		for (var j = 0; j < current_ontology.classes[i].entities.length; j++) {
			$scope.global_instances.push(current_ontology.classes[i].entities[j]);
		}
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
				$scope.classes.push({index: count , _id: response.data._id ,name: 'Clase'+count, attributes: [], instances:[] })
				M.updateTextFields();

			}, function errorCallback(response) {
				M.toast({html: 'Error al Guardar'})
			})
		
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
						$scope.classes[i].instances.push({ name: 'NuevaInstancia-'+random_str, _id: response.data._id });
						$scope.global_instances.push({ name: 'NuevaInstancia-'+random_str, _id: response.data._id });
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
					var inst_id = $scope.classes[i].instances._id;
					$scope.classes[i].instances.pop();

					for (var j = 0; j < $scope.global_instances.length; j++) {
						if ($scope.global_instances[j]._id == inst_id){
							delete $scope.global_instances[j];
							break;
						}
					}

					break;
				}
			}
		}
	}	
	$scope.edit_class = function(index){
		//console.log('blured_class '+index);
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
	$scope.edit_inst = function(index, index_inst){
		//console.log('blured_class '+index);
		for (var i = 0; i < $scope.classes.length; i++) {
			if (parseInt(index) == $scope.classes[i].index){
				for (var j = 0; j < $scope.classes[i].instances.length; j++) {
					if (index_inst == $scope.classes[i].instances[j]._id){
						$http({
							method: 'PUT',
							url: '/ontology/instance/'+$scope.classes[i].instances[j]._id,
							data: {
								name: $scope.classes[i].instances[j].name
							}
							}).then(function successCallback(response) {
								//console.log(response);

							}, function errorCallback(response) {
								M.toast({html: 'Error al Guardar'})
							})

						var inst_id = $scope.classes[i].instances[j]._id;
						for (var k = 0; k < $scope.global_instances.length; k++) {
							if ($scope.global_instances[k]._id == inst_id){
								$scope.global_instances[k].name = $scope.classes[i].instances[j].name ;
								break;
							}
						}

						break;
					}
				}
			}
		}
	}

	$scope.relations = relations;
	$scope.subject = 'na';
	$scope.complement = 'na';
	$scope.add_relation = function(){
		$http({
			method: 'POST',
			url: '/ontology/relation',
			data: {
				subject: $scope.subject,
				verb: $scope.verb,
				complement: $scope.complement,
				ontology: current_ontology._id
			}
			}).then(function successCallback(response) {
				console.log(response);
				$scope.relations.unshift(response.data);
			}, function errorCallback(response) {
				M.toast({html: 'Error al Guardar'})
			})
	}

	function makeid() {
	  var text = "";
	  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	  for (var i = 0; i < 4; i++)
	    text += possible.charAt(Math.floor(Math.random() * possible.length));

	  return text;
	}
});