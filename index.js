//Config Inicial
const http = require('http');
const express = require('express');
const port = process.env.PORT || 4040;
const app = express();
const server = http.createServer(app);
const util = require('util');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
//Socket
const { Server } = require("socket.io");
const io = new Server(server);

const passport = require('./functions/passport')

//DB y Clases
const { mysql, mongoAtlas } = require('./db/db-config')
const Productos = require('./classes/Productos');
const ChatNorm = require('./classes/ChatNormalizr');
const Producto = new Productos(mysql);
const ChatNormalizr = new ChatNorm();

//Normalizer
const normalizr = require('normalizr');

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser())

//SESSION
app.use(session({
	secret: 'protego',
	resave: true,
	saveUninitialized: false,
	rolling: true,
	cookie: {
		maxAge: 600000
	}
 }))

app.use(passport.initialize());
app.use(passport.session());

const routes_back = require('./routes/routes_back');
app.use("/api/productos", routes_back);

const routes_faker = require('./routes/routes_faker');
app.use("/api/productos-test", routes_faker);

const routes_front = require('./routes/routes_front');
app.use('', routes_front)

app.set('view engine', 'ejs');
app.set('views', 'public');

app.post('/login', passport.authenticate('authentication'), (req, res) => {
   let msg = '';
   if(req.user.email === -1) {
      msg = 'Usuario no existe';
      req.logout(function(err) {
         if (err) { return next(err); }
         res.render('error', {data: msg});
      });
   } else if (req.user.email === 0) {
      msg = 'Contraseña incorrecta';
      req.logout(function(err) {
         if (err) { return next(err); }
         res.render('error', {data: msg});
      });
   } else {
      res.redirect('/');
   }

})
app.post('/signup', passport.authenticate('registration'), (req, res) => {
   let msg = '';
   if(req.user.data === -1) {
      msg = 'No se pudo crear el usuario'
      req.logout(function(err) {
         if (err) { return next(err); }
         res.render('error', {data: msg});
       });
      
   } else if (req.user.data === 0) {
      msg = 'Usuario ya existe'
      req.logout(function(err) {
         if (err) { return next(err); }
         res.render('error', { data: msg });
      });
   } else {
      // console.log(req.user)
      msg = req.user.data;
      req.logout(function(err) {
         if (err) { return next(err); }
         res.render('success', { data: msg });
      })
   }
})

io.on('connection', function(socket) {
   const ProductosConst = Producto.getAll().then(result => {
      if (result !== undefined) {
         return socket.emit('listProducts', result);
      } else {
         return socket.emit('listProducts', []);
      }
   });

   const ChatConstN = ChatNormalizr.getAll().then(res => {
      let chatArr = {
         "id": 0,
         "mensajes": res
      }
      const autoresSchema = new normalizr.schema.Entity('autor', {}, {idAttribute: 'id'});
      const chatsSchema = new normalizr.schema.Entity('mensajes', {
         autor: autoresSchema
      }, {idAttribute: 'id'});
   
      let result = normalizr.normalize(chatArr, chatsSchema);

      return socket.emit('listMessages', result);
   });
   ProductosConst;
   ChatConstN;
   

   socket.on('messages', data => {
      const ChatSave = ChatNormalizr.save(data).then(result => {
         const ChatConstN2 = ChatNormalizr.getAll().then(res => {
            let chatArr = {
               "id": 0,
               "mensajes": res
            }
            const autoresSchema = new normalizr.schema.Entity('autor');
            const chatsSchema = new normalizr.schema.Entity('mensajes', {
               autor: autoresSchema
            });
         
            let result = normalizr.normalize(chatArr, chatsSchema);
            // console.log(result)
            return socket.emit('listMessages', result);
         });
      });
   });

   //Guardar productos
   socket.on('newProduct', data => {
      const ProductosSave = Producto.save(data).then(result => {
         const ProductosConst2 = Producto.getAll().then(result => {
            if (result !== undefined) {
               return socket.emit('listProducts', result);
            } else {
               return socket.emit('listProducts', []);
            }
         });
     });
   });

});


server.listen(port, () => {
   console.log(`Aplicación ejecutandose en el puerto: ${port}`);
});
