var mongoose = require("mongoose");
var Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost:27017/fotos", { useNewUrlParser: true });

var posibles_valores = ["M", "F"];

var email_match = [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,"Coloca un email válido"];

var password_validation = {
	validator: function(p){
		return this.password_confirmation == p;
		},
	message: "Las contraseñas no son iguales",
};

var user_schema = new Schema({
	name: String,
	last_name: String,
	username: {type: String, required: true, maxlength: [50, "Username muy grande"]}, 
	password: {
		type: String, 
		minlength: [8, "El password es miy corto"],
		validate: password_validation,
	},
	age: {type: Number, min: [5, "La edad no puede ser menor que 5"], max: [100, "La edad no puede ser mayor que 100"]},
	email: {type: String, required: "El correo es obligatorio", match: email_match},
	date_of_birth: Date,
	sex: {type: String, enum: {values: posibles_valores, message: "Opción no válida"}},
});
// Collections -> tablas // Documents -> filas //"User" será el nombre de la collection
user_schema.virtual("password_confirmation").get(function(){
	return this.p_c;
}).set(function(password){
	this.p_c = password;
})

var User = mongoose.model("User", user_schema);

module.exports.User = User;