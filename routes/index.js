import express from 'express';
import moment from 'moment';
import Ontology from '../models/ontology_model';
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	if (req.session.active){
		Ontology.find({}).sort('-date').limit(6).exec(function(err,ontos){
			res.render('index', { 
				name: req.session.user.name,
				last_name: req.session.user.last_name,
				email: req.session.user.email,
				ontos: ontos,
				moment: moment
			});
		})
	}
	else{
		res.redirect('/users/login');
	}
});

module.exports = router;
