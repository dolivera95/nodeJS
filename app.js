//Los controladores (app.js) deben ser delgados y los modelos deben ser gordos. La logica de la aplicacion deben residir fuertemente en los modelos y no en el controalador. El controlador debe ser mas especifico en lo que debe hacer. Si se pone en el controlador, es difcil probar si el sistema esta bien porque si la validacion no hace lo que deberia hay muchas cosas que pueden estar pasando (parametro no esta pasando, la url, etc). En cambio si se pone en el modelo es muchisimo mas facil probar si esta bien o mal.
var express = require("express");
var bodyParser = require("body-parser");
var User = require("./models/user").User;

var session = require("express-session");
//var cookieSession = require("cookie-session");

var router_app = require("./routes_app");
var session_middleware = require("./middlewares/session");
var formidable = require("express-form-data");
var os = require("os");
var RedisStore = require("connect-redis")(session);
//Socket.io
var http = require("http");
var realtime = require("./realtime");

var methodOverride = require("method-override");

var app = express();
//Servidor para socket.io
var server = http.Server(app);

//app.use(cookieSession({
//	name: "session",
//	keys: ["llave-1", "llave-2"],
//}));
var sessionMiddleware = session({
	//Incluir el puerto, password cuando se haga a producción. (GITHUB-CONNECT REDIS)
	store: new RedisStore({}),
	//Poner un buen secret cuando se suba a producción.
	secret: "super ultra secret word",
	resave: false,
	saveUninitialized: false,
});
//Socket.io y Express comparten la misma sesión.
realtime(server, sessionMiddleware);

app.use("/public" ,express.static("public"));

app.use(bodyParser.json()); //Peticiones json
app.use(bodyParser.urlencoded({extended: true}));
//app.use(session({
//	secret: "123qwe",
//	resave: false,
//	saveUninitialized: false,
//}));

app.use(methodOverride("_method"))

app.use(sessionMiddleware);
//Debe ser un almacenamiento TEMPORAL
var options = {
	uploadDir: os.tmpdir(),
	// autoClean: true,
}
app.use(formidable.parse(options));

app.set("view engine", "pug");
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/*app.get("/", function(req, res){
	console.log(req.session.user_id);
	res.render("index");
});
*/
////////////////////////////////////////////////////////////////////////////////
app.route("/")
	.get(function(req, res){
		//console.log(req.session.user_id);
		console.log(os.tmpdir());
		res.render("index");
	});
////////////////////////////////////////////////////////////////////////////////
/*
app.get("/signup", function(req, res){
	//User.find(function(err, doc){
	//	console.log(doc);
	//	res.render("signup");
	//})
	res.render("signup");
});
*/
////////////////////////////////////////////////////////////////////////////////
app.route("/signup")
	.get(function(req, res){
		User.find(function(err, doc){
			console.log(doc);
			res.render("signup");
		})
	})
////////////////////////////////////////////////////////////////////////////////
/*
app.get("/login", function(req, res){
	//User.find(function(err, doc){
	//	console.log(doc);
	//	res.render("login");
	//})
	res.render("login");
});
*/
////////////////////////////////////////////////////////////////////////////////
app.route("/login")
	.get(function(req, res){
		User.find(function(err, doc){
			console.log(doc);
			res.render("login");
		});
	});
/*////////////////////////////////////////////////////////////////////////////////
app.post("/users", function(req, res){
	var user = User({
						username: req.body.username,
						email: req.body.email, 
						password: req.body.password, 
						password_confirmation: req.body.password_confirmation
					});

	user.save().then(function(us){
		res.send("Guardamos el usuario exitosamente");
	}, function(err){
		if(err){
			console.log(err);
			res.send("No pudimos guardar la informacióm");
		}
	});
});
*/
////////////////////////////////////////////////////////////////////////////////
app.route("/users")
	.post(function(req, res){
		var user = User({
			username: req.body.username,
			email: req.body.email,
			password: req.body.password,
			password_confirmation: req.body.password_confirmation,
		});
		user.save().then(function(us){
			res.send("Guardamos el usuario exitosamente");
		}, function(err){
			if(err){
				console.log(err);
				res.send("No pudimos guardar la información");
			};
		});
	});

////////////////////////////////////////////////////////////////////////////////
/*
app.post("/sessions", function(req, res){
	//Devuelve un conjunto o un arreglo de documentos que cumplen la condicion, primer parametro es el query, el segundo parametro son los fields del docuemnto que estamos extayendo y el tercer parametro es un callback para cuando la consulta haya retornado
	//User.find({email: req.body.email, password: req.body.password,}, "username email", function(err, docs){
	//	console.log(docs);
	//	res.send("Hola mundo");
	//});

	//User.findById("5b608e5a2b313e0311a5682e", function(err, doc){
	//
	//});

	User.findOne({email: req.body.email, password: req.body.password,}, "username email", function(err, user){
		//el store no esta diseñado para funcionar en producción. tiende a ocupar mucha memoria, es dificil para escalar
		req.session.user_id = user._id;
		res.redirect("/app");
	})
});
*/
////////////////////////////////////////////////////////////////////////////////
app.route("/sessions")
	.post(function(req, res){
		User.findOne({email: req.body.email, password: req.body.password}, "username email", function(err, user){
			//el store no esta diseñado para funcionar en producción. tiende a ocupar mucha memoria, es dificil para escalar

			req.session.user_id = user._id;
			res.redirect("/app");
		});
	});

app.use("/app", session_middleware);
app.use("/app", router_app);

//EN lugar que sea la aplicacion quien reciba las peticiones, sea el servidor quien reciba las peticion, el cual es una instancia de http y no de express
//app.listen(8080);
server.listen(8080);