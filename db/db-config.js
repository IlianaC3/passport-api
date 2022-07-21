//CLASE 16 CONFIGURACIÓN
const mysql = require('knex')({
	client: 'mysql',
	connection: {
		host: '127.0.0.1',
		port: 3306,
		user: 'root',
		password: '',
		database: 'productos'
	},
	pool: { min: 2, max: 8 }
});
//CLASE 16 CONFIGURACIÓN

//CLASE 24 CONFIGURACIÓN
const mongoAtlas = {
	client: 'mongodb',
	conString: 'mongodb+srv://ilianaCarpetres:pWHqJ5TCBo2ozH0U@cluster0.i9u1k.mongodb.net/?retryWrites=true&w=majority'
};
//

//CLASE 26 CONFIGURACION
const mongodbU = {
	cnxStr: 'mongodb://localhost:27017/tienda-paris',
	options: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverSelectionTimeoutMS: 5000
	}
};

module.exports = {mysql, mongoAtlas, mongodbU};
