const express = require('express');
const app = express();
const { mysql } = require('../db/db-config');
const { publicAuthorization } = require('../functions/auth');
const Productos = require('../classes/Productos');
const FakerProducts = require('../classes/Faker')
// const Usuarios = require('../classes/Usuarios');
const Producto = new Productos(mysql);
const FakerP = new FakerProducts();
// const Usuario = new Usuarios();
app.set('view engine', 'ejs');
app.set('views', './public');

app.get('/', publicAuthorization, (req, res) => {
	Producto.getAll().then((result) => {
		let info = {
			result: result,
			name: req.user
		}
		if (result !== undefined) {
			res.render('index', { data: info});
		} else {
			res.status(404).json({
				error: `No existen productos`
			});
		}
	});
});

app.get('/agregar', publicAuthorization, (req, res) => {
	res.render('agregar');
});

app.get('/editar/:id', publicAuthorization, (req, res) => {
	Producto.getById(req.params.id).then((result) => {
		if (result !== undefined) {
			if (result === null) {
				res.status(404).json({
					error: `Producto no encontrado para el id ${id}`
				});
			} else {
				res.render('editar', { data: result });
			}
		} else {
			res.status(404).json({
				error: `El archivo no se puede leer`
			});
		}
	});
});

// FAKER //
app.get('/productos-test', publicAuthorization, (req, res) => {
	FakerP.FakerFunction().then((result) => {
		if (result !== undefined) {
			res.render('productos-test', { data: result });
		} else {
			res.status(404).json({
				error: `No existen productos`
			});
		}
	});
	
});


// LOGIN //
app.get('/login', (req, res) => {
    const person = req.user;
    if (person) {
        res.redirect('/')
    } else {
        res.render('login');
    }
})

app.get('/logout', (req, res) => {
	let nombre = req.user
	req.logout(function(err) {
		if (err) { return next(err); }
    	res.render('logout', { data: nombre } );
	});
})

//REGISTRO
app.get('/signup',  (req, res) => {
    res.render('signup');
})



module.exports = app;
