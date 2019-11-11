import express from 'express';
import Ontology from '../models/ontology_model';
import Onto_Class from '../models/onto_class_model';
import Entity_Class from '../models/entity_model';
import Relation from '../models/relation_model';
import Class_Property from '../models/class_property_model';
import nodeRestClient from 'node-rest-client';
import path from 'path';
const Client = nodeRestClient.Client;
const OwlAPI = new Client();
const router = express.Router();

/* GET home page. */
router.post('/create', (req, res, next) => {
	if (req.session.active){
		const createOntology = new Promise((resolve,reject)=>{
			
			var new_ontology = new Ontology({
				name: req.body.name,
			    date: new Date(),
			    user: req.session.user._id,
			    classes: []
			})

			new_ontology.save((err,saved)=>{
				if(err){
					console.log(err);
					reject(err);
				}
				resolve(saved);
			})
		})

		createOntology.then((saved)=>{
			OwlAPI.post("http://localhost:8080/API-0.0.1-SNAPSHOT/pdf/onthology/create/"+saved._id, {} , function (data, response) {
				res.status(200).send(saved);
			})
		}).catch((err)=>{
			console.log(err);
			res.status(500).send({err:err});
		})
	}
	else{
		res.redirect('/users/login');
	}
});

router.get('/edit/:_id', (req, res, next) => {
	if (req.session.active){
		Relation.find({ontology: req.params._id}).populate('subject').populate('complement').sort('-date').exec(function(err,relations){
			Ontology.findById( req.params._id).populate({
				path:'classes',
				model:'Onto_Class',
				populate:{
					path:'entities properties',
					populate:{
						path:'properties.property',
						
					}	
				}
			}).exec(function(err, ontology){
				Class_Property.find({}).sort('-date').exec(function(err, properties){
					res.render('edit_ontology', { 
						name: req.session.user.name,
						last_name: req.session.user.last_name,
						email: req.session.user.email,
						ontology: ontology,
						relations: relations
					});		
				})
			})
		})
	}
	else{
		res.redirect('/users/login');
	}
});

router.post('/class/create/:_onto_id', (req, res, next) => {
	if (req.session.active){

			const createOntoClass = new Promise((resolve,reject)=>{
				var new_class = new Onto_Class({
					name: req.body.classes.name,
				    date: new Date(),
				    ontology: req.params._onto_id,
				    entities: []
				})

				Ontology.findById(req.params._onto_id, function(err,onto){
					new_class.save((err,saved)=>{
						onto.classes.push(saved._id);
						onto.date = new Date();
						onto.save(function(err2,saved_2){
							if(err){
								console.log(err);
								reject(err);
							}
							if(err2){
								console.log(err2);
								reject(err);
							}
							resolve(saved);
						})
					})
				})
			})
			const createClass = new Promise((resolve,reject)=>{				
				OwlAPI.post("http://localhost:8080/API-0.0.1-SNAPSHOT/pdf/onthology/create/class/"+req.params._onto_id+'/'+req.body.classes.name, {} , function (data, response) {
					if (data){
						resolve(data);
					}
				})
			})
			createClass.then((saved)=>{
				createOntoClass.then((class_saved)=>{
					res.status(200).send({_id:class_saved._id});
				}).catch((err)=>{
					console.log(err);
					res.status(500).send({err:err});
				})	
			}).catch((err)=>{
				console.log(err);
				res.status(500).send({err:err});
			})
		
	}
	else{
		res.redirect('/users/login');
	}
});

router.post('/instance/create/:_class_id', (req, res, next) => {
	if (req.session.active){

			const createEntity = new Promise((resolve,reject)=>{
				Onto_Class.findById(req.params._class_id).populate('properties').exec(function(err,classes){
					Ontology.findById(classes.ontology, function(err,onto){
						var temp_props = [];
						for (var j = 0; j < classes.properties.length; j++) {
							temp_props.push({property: classes.properties[j]._id, val: req.body.name+'('+(j+1)+')'})
						}

						var new_entity = new Entity_Class({
							name: 'Nueva-Instancia-'+req.body.name,
						    date: new Date(),
						    class: req.params._class_id,
						    properties: temp_props
						})
						new_entity.save((err,saved)=>{
							classes.entities.push(saved._id);
							classes.date = new Date();
							onto.date = new Date();
							classes.save(function(err2,saved_2){
								onto.save(function(err3,saved_3){
									if(err){
										console.log(err);
										reject(err);
									}
									if(err2){
										console.log(err2);
										reject(err);
									}
									if(err3){
										console.log(err3);
										reject(err);
									}
									resolve(saved);
								})
							})
						})
					})
				})
			})
			const createAPIEntity = new Promise((resolve,reject)=>{				
				Onto_Class.findById(req.params._class_id).populate('properties').exec(function(err,classes){
					for (var j = 0; j < classes.properties.length; j++) {
						OwlAPI.post("http://localhost:8080/API-0.0.1-SNAPSHOT/pdf/onthology/create/instance/"+classes.ontology+"/"+classes.name+"/"+'Nueva-Instancia-'+req.body.name+'/'+classes.properties[j].name+'/'+req.body.name+'('+(j+1)+')', {} , function (data, response) {
							
						})
					}
					resolve(200);
				})
			})
			createAPIEntity.then((saved)=>{
				createEntity.then((ent_saved)=>{
					res.status(200).send({_id:ent_saved._id});
				}).catch((err)=>{
					console.log(err);
					res.status(500).send({err:err});
				})	
			}).catch((err)=>{
				console.log(err);
				res.status(500).send({err:err});
			})
		
	}
	else{
		res.sendStatus(401);
	}
});

router.post('/property/create/:_class_id', (req, res, next) => {
	if (req.session.active){

			const createProperty = new Promise((resolve,reject)=>{
				var new_prop = new Class_Property({
					name: req.body.name,
				    date: new Date(),
				    class: req.params._class_id,
				})

				Onto_Class.findById(req.params._class_id, function(err,classes){
					Ontology.findById(classes.ontology, function(err,onto){
						new_prop.save((err,saved)=>{
							classes.properties.push(saved._id);
							classes.date = new Date();
							onto.date = new Date();
							classes.save(function(err2,saved_2){
								onto.save(function(err3,saved_3){
									if(err){
										console.log(err);
										reject(err);
									}
									if(err2){
										console.log(err2);
										reject(err);
									}
									if(err3){
										console.log(err3);
										reject(err);
									}
									resolve(saved);
								})
							})
						})
					})
				})
			})
			
			
			createProperty.then((prop_saved)=>{
				res.status(200).send({_id:prop_saved._id});
			}).catch((err)=>{
				console.log(err);
				res.status(500).send({err:err});
			})	
			
		
	}
	else{
		res.sendStatus(401);
	}
});


router.put('/class/:_class_id', (req, res, next) => {
	if (req.session.active){

			const editClass = new Promise((resolve,reject)=>{
				Onto_Class.findById(req.params._class_id, function(err,classes){
					Ontology.findById(classes.ontology, function(err,onto){
						var fs = require('fs')
						fs.readFile('./public/ontologies/'+classes.ontology+'.owl', 'utf8', function (err,data) {
						  if (err) {
						    return console.log(err);
						  }
						  
						  var re = new RegExp(classes.name,"g");
						  //console.log(re + ' '+req.body.name);
						  var result = data.replace(re , req.body.name);

						  fs.writeFile('./public/ontologies/'+classes.ontology+'.owl', result, 'utf8', function (err) {
						    	if (err) return console.log(err);

								classes.name = req.body.name;
								classes.date = new Date();
								onto.date = new Date();
								classes.save(function(err2,saved_2){
									onto.save(function(err3,saved_3){								
										if(err2){
											console.log(err2);
											reject(err);
										}
										if(err3){
											console.log(err3);
											reject(err);
										}
										resolve(saved_2);
									})
								})
							})
						})
					})
				})
			})
			
			editClass.then((saved)=>{				
				res.status(200).send({_id:saved._id});									
			}).catch((err)=>{
				console.log(err);
				res.status(500).send({err:err});
			})
		
	}
	else{
		res.sendStatus(401);
	}
});

router.put('/instance/:_instance_id', (req, res, next) => {
	if (req.session.active){

			const editEntity = new Promise((resolve,reject)=>{
				Entity_Class.findById(req.params._instance_id).populate('class').exec(function(err,instance){
					Ontology.findById(instance.class.ontology, function(err,onto){
						var fs = require('fs')
						fs.readFile('./public/ontologies/'+instance.class.ontology+'.owl', 'utf8', function (err,data) {
						  if (err) {
						    return console.log(err);
						  }
						  
						  var re = new RegExp(instance.name,"g");
						  //console.log(re + ' '+req.body.name);
						  var result = data.replace(re , req.body.name);
						  for (var i = 0; i < instance.properties.length; i++) {
						  	for (var j = 0; j < req.body.properties.length; j++) {
						  		if (instance.properties[i].property.toString() ===  req.body.properties[j].property._id.toString() ){
						  			re = new RegExp(instance.properties[i].val, "g");
									result = result.replace(re , req.body.properties[j].val);
									instance.properties[i].val = req.body.properties[j].val;
									break;
						  		}
						  	}
						  }

						  fs.writeFile('./public/ontologies/'+instance.class.ontology+'.owl', result, 'utf8', function (err) {
						    	if (err) return console.log(err);
						    	
								instance.name = req.body.name;
								onto.date = new Date();
								instance.save(function(err2,saved_2){
									onto.save(function(err3,saved_3){								
										if(err2){
											console.log(err2);
											reject(err);
										}
										if(err3){
											console.log(err3);
											reject(err);
										}
										resolve(saved_2);
									})
								})
							})
						})
					})
				})
			})
			
			editEntity.then((saved)=>{				
				res.status(200).send({_id:saved._id});									
			}).catch((err)=>{
				console.log(err);
				res.status(500).send({err:err});
			})
		
	}
	else{
		res.sendStatus(401);
	}
});

router.put('/property/:_property_id', (req, res, next) => {
	if (req.session.active){

			const editProperty = new Promise((resolve,reject)=>{
				Class_Property.findById(req.params._property_id).populate('class').exec(function(err,property){
					Ontology.findById(property.class.ontology, function(err,onto){
						    	
						property.name = req.body.name;
						onto.date = new Date();
						property.save(function(err2,saved_2){
							onto.save(function(err3,saved_3){								
								if(err2){
									console.log(err2);
									reject(err);
								}
								if(err3){
									console.log(err3);
									reject(err);
								}
								resolve(saved_2);
							})
						})
					})
				})
			})
			
			editProperty.then((saved)=>{				
				res.status(200).send({_id:saved._id});									
			}).catch((err)=>{
				console.log(err);
				res.status(500).send({err:err});
			})
		
	}
	else{
		res.sendStatus(401);
	}
});

router.get('/download/:_id',function (req,res,next){
	if(req.session.active === true){
		res.sendFile(path.join(__dirname, '../public/ontologies/'+req.params._id+'.owl'));
	}
	else{
		res.redirect('/authenticate/login');
	}	
})


router.post('/relation', (req, res, next) => {
	if (req.session.active){

			const createRelation = new Promise((resolve,reject)=>{
				var newRelation = new Relation({
					subject: req.body.subject,
					verb: req.body.verb,
					complement: req.body.complement,
					ontology: req.body.ontology,
					date: new Date()
				})	
				newRelation.save(function(err, saved){
					if (err){
						reject(err);
					}
					Relation.findById(saved._id).populate('subject').populate('complement').exec(function(err, rel){
						resolve(rel);
					})
				})
			})

			const createAPIRelation = new Promise((resolve,reject)=>{	
				Entity_Class.findById(req.body.subject, function(err, entity_a){ 
					Entity_Class.findById(req.body.complement, function(err, entity_b){ 
						OwlAPI.post("http://localhost:8080/API-0.0.1-SNAPSHOT/pdf/onthology/create/property/"+req.body.ontology+'/'+entity_a.name+'/'+entity_b.name+'/'+req.body.verb , {} , function (data, response) {
							if (data){
								resolve(data);
							}
						})
					})
				})
			})

			createAPIRelation.then((saved)=>{
				createRelation.then((class_saved)=>{
					res.status(200).send(class_saved);
				}).catch((err)=>{
					console.log(err);
					res.status(500).send({err:err});
				})	
			}).catch((err)=>{
				console.log(err);
				res.status(500).send({err:err});
			})
		
	}
	else{
		res.redirect('/users/login');
	}
});

module.exports = router;
