import express from 'express';
import Ontology from '../models/ontology_model';
import nodeRestClient from 'node-rest-client';
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
			    user: req.session.user._id
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
		Ontology.findById( req.params._id , function(err, ontology){
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
		
			const createClass = new Promise((resolve,reject)=>{				
				OwlAPI.post("http://localhost:8080/API-0.0.1-SNAPSHOT/pdf/onthology/create/class/"+req.params._onto_id+'/'+req.body.classes.name, {} , function (data, response) {
					if (data){
						resolve(data);
					}
				})
			})
			createClass.then((saved)=>{
				res.sendStatus(200);
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
