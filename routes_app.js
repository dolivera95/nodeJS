//A veces es mejor utilizar promises y en otras ocasiones es mejor utilizar callbacks (para realizar refactor)

var express = require("express");
var Imagen = require("./models/imagenes");
var router = express.Router();

//redis (comunicar redis con express)
var redis = require("redis");

var client = redis.createClient();

var image_finder_middleware = require("./middlewares/find_image");

var fs = require("fs.extra");
/*app.com/app/*/
router.get("/", function(req, res){
	/*Buscar al usuario*/
	Imagen.find({})
		.populate("creator")
		.exec(function(err, imagenes){
			if(err){
				console.log(err);
			};
			res.render("app/home", {imagenes: imagenes});
		});
});



router.get("/imagenes/new", function(req, res){
	res.render("app/imagenes/new");
})

router.all("/imagenes/:id*", image_finder_middleware);

router.get("/imagenes/:id/edit", function(req, res){
	res.render("app/imagenes/edit");
})

////////////////////////////////////////////////////////////////////////////////
/* REST */
/*CRUD (Crear, Read, Update, Delete*/
/*Utilizar app.route("/").get({};) es similar.a usar app.get pero usando app.route. app.route es basicamente un shortcut para llamar a Express Router. En cambio de hacer un llamado a express.Router, nosotros podemos llamar app.route y empezar a aplicar nuestras rutas aqui */

router.route("/imagenes/:id")
	.get(function(req, res){
		//Cada vez que se visite una imagen, se va a publicar en el canal de images la información de esta imagen y la debería recibir socket.io porque está subscrito a ese mismo canal
		//client.publish("images", res.locals.imagen.toString());
		res.render("app/imagenes/show");

	});

/*
router.route("/imagenes/:id")
	.get(function(req, res){
		Imagen.findById(req.params.id).then(function(imagen){
			console.log("USANDO PROMISE")
			res.render("app/imagenes/show", {imagen: imagen});
		}, function(err){
			if(err){
				res.send("ERROR");
			}
		})
	})
*/
router.route("/imagenes/:id")
	.put(function(req, res){
		res.locals.imagen.title = req.body.title;
		res.locals.imagen.save().then(function(imagen_edit){
			res.render("app/imagenes/show", {imagen:imagen_edit});
		}, function(err){
			if(err){
				res.send("ERROR")
			}
		})
	});

router.route("/imagenes/:id")
	.delete(function(req, res){
		Imagen.findOneAndRemove({_id: req.params.id}, function(err){
			if(!err){
				res.redirect("/app/imagenes");
			}else{
				console.log(err);
				res.redirect("/app/imagenes/"+req.params.id);
			}
		})
	});

////////////////////////////////////////////////////////////////////////////////
router.route("/imagenes")
	.get(function(req, res){
		Imagen.find({creator: res.locals.user._id}, function(err, imagenes){
			if(err){
				res.redirect("/app");
				return;
			}
			res.render("app/imagenes/index", {imagenes: imagenes});
		})
	});

router.route("/imagenes")
	.post(function(req, res){
		console.log(req.files.archivo);
		var extension = req.files.archivo.name.split(".").pop();
		console.log(extension);
		var data = {
			title: req.body.title,
			creator: res.locals.user._id,
			extension: extension,
		};

		var imagen = new Imagen(data);

		imagen.save().then(function(imagen_new){

				var imgJSON = {
					"id": imagen._id,
					"title": imagen.title,
					"extension": imagen.extension,
				};

				client.publish("images", JSON.stringify(imgJSON));
				fs.copy(req.files.archivo.path, "public/imagenes/"+imagen_new._id+"."+extension);
				res.redirect("/app/imagenes/" + imagen_new._id);
		}, function(err){
			if(err){
				console.log(err);
				res.send("Error");
			}
		})

	});



module.exports = router;