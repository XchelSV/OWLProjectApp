import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from "mongoose";
import session from 'express-session';
import bodyParser from 'body-parser';
import multipart from 'connect-multiparty';
import uuid from 'uuid';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import ontologyRoutes from './routes/ontology';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
app.use(multipart());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    genid: function (req){ return uuid.v1()},
    secret: 'q~!!#mtsport--_-`´ç@',
    saveUninitialized:  false,
    resave: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/ontology', ontologyRoutes);

const connStr = 'mongodb://localhost:27017/OwlDB';
const promise = mongoose.connect(connStr, { server: { reconnectTries: Number.MAX_VALUE } });
promise.then(
	() => { console.log('MondoDB Arriba') },
  	err => { console.log('Error al conectarse en la base de datos: '+err) }
);

// catch 404 and forward to error handler
app.use( (req, res, next) => {
  next(createError(404));
});

// error handler
app.use( (err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
