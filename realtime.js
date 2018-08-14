//comunicación directa entre cliente y servidor (actualización en tiempo real) 
module.exports = function(server, sessionMiddleware){
	var io = require("socket.io")(server);
	//Redis comunicarlo con express y socket.io
	var redis = require("redis");
	var client = redis.createClient();

	client.subscribe("images");

	io.use(function(socket, next){
		//Configuramos el socket para que comparta la misma sesión con express
		sessionMiddleware(socket.request, socket.request.res, next);
	});

	//cada vez que se reciba un mensaje en el canal, se va a disparar el evento message que va a ejecutar un callback de dos argumentos. El primero es el canal en el cual se definio o se publico la información y despues qué se publico.
	client.on("message", function(channel, message){
		//console.log("Recibimos un mensaje del canal " + channel);
		//console.log(message);
		//verificar que el canal que se haya publicado sea el de imagenes
		if(channel == "images"){
			//emitir un mensaje a todos los sockets conectados al servidor utilizando io.emit()
			io.emit("new image", message);
		};
	});

	io.sockets.on("connection", function(socket){
		//Cuando hay conexion se escuchará (conexión entre socket.io y express)
		//console.log(socket.request.session.user_id);
	})
}