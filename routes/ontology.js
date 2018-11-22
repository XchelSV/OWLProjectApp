import express from 'express';
import Ontology from '../models/ontology_model';
import Onto_Class from '../models/onto_class_model';
import Entity_Class from '../models/entity_model';
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
		Ontology.findById( req.params._id).populate({
				path:'classes',
				model:'Onto_Class',
				populate:{
					path:'entities',
					model:'Entity'
				}
			}).exec(function(err, ontology){
				res.render('edit_ontology', { 
					name: req.session.user.name,
					last_name: req.session.user.last_name,
					email: req.session.user.email,
					ontology: ontology
				});		
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
				var new_entity = new Entity_Class({
					name: req.body.name,
				    date: new Date(),
				    class: req.params._class_id,
				})

				Onto_Class.findById(req.params._class_id, function(err,classes){
					Ontology.findById(classes.ontology, function(err,onto){
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
				Onto_Class.findById(req.params._class_id, function(err,classes){
					OwlAPI.post("http://localhost:8080/API-0.0.1-SNAPSHOT/pdf/onthology/create/instance/"+classes.ontology+"/"+classes.name+"/"+req.body.name, {} , function (data, response) {
						if (data){
							resolve(data);
						}
					})
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

router.get('/download/:_id',function (req,res,next){
	if(req.session.active === true){
		res.sendFile(path.join(__dirname, '../public/ontologies/'+req.params._id+'.owl'));
	}
	else{
		res.redirect('/authenticate/login');
	}	
})

module.exports = router;
