//A veces es mejor utilizar promises y en otras ocasiones es mejor utilizar callbacks (para realizar refactor)

var express = require("express");
var Imagen = require("./models/imagenes");
var router = express.Router();

var image_finder_middleware = require("./middlewares/find_image");
/*app.com/app/*/
router.get("/", function(req, res){
	/*Buscar al usuario*/
	res.render("app/home");
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
		console.log(res.locals.user._id);
		var data = {
			title: req.body.title,
			creator: res.locals.user._id,
		};

		var imagen = new Imagen(data);

		imagen.save().then(function(imagen_new){
			console.log(imagen_new);
			res.redirect("/app/imagenes/" + imagen_new._id);
		}, function(err){
			if(err){
				console.log(err);
				res.send("Error");
			}
		})

	});



module.exports = router;