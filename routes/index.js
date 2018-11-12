import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	if (req.session.active){
		res.render('index', { 
			name: req.session.user.name,
			last_name: req.session.user.last_name,
			email: req.session.user.email
		});		
	}
	else{
		res.redirect('/users/login');
	}
});

module.exports = router;
