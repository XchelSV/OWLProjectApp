import express from 'express';
import Promise from 'promise';
import User from '../models/user_model'
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/login', (req, res, next) => {
  
	const checkUser = new Promise( (resolve, reject) => {
		User.findOne({email: req.body.email}, (err,user) => {
			if (user != undefined){
				resolve(user);
			}
			else{
				reject('na');
			}
		})
	})
	const checkPass = new Promise( (resolve, reject) => {
		User.findOne({email: req.body.email}, (err,user) => {
			user.comparePassword(req.body.pass, (err , pass) => {
				if(pass){
					resolve(user);
				}
				else{
					reject(500);
				}
			})
		})
	})

	checkUser.then( (user) => {
		checkPass.then( (checked) => {
			req.session.active = true;
			req.session.user = checked;
			res.sendStatus(200);
		}).catch( (err) => { res.status(401).send({err:'pass'}) });
	}).catch( (err) => {
		res.status(401).send({err:'user'});	
	})

});

router.post('/signin', (req, res, next) => {

	const createUser = new Promise((resolve,reject)=>{
		var new_user = new User({
			name: req.body.name,
		    last_name: req.body.last_name,
		    email: req.body.email,
		    password: req.body.password
		})

		new_user.save((err,saved)=>{
			if(err){
				console.log(err);
				reject(err);
			}
			resolve(saved);
		})
	})

	createUser.then((saved)=>{
		res.sendStatus(200);
	}).catch((err)=>{
		console.log(err);
		res.status(500).send({err:err});
	})
})

router.get('/login', (req, res, next) => {
	if (req.session.active){
		res.redirect('/');
	}
	else{
		res.render('login',{});
	}
})

router.get('/logout', function(req, res, next) {
  if (req.session.active === true){
  	req.session.destroy(function(err){
      //res.clearCookie('articulos');
  		res.redirect('/')		
  	})
  }
  else{
  	res.redirect('/')
  }
});

module.exports = router;
