//conectar la socket
//el io() sale de la libreria exportada de socket.io.js
//ejecutar la funcion signifca que se va a conectar con el servidor de web socket
var socket= io();
//agregar un evento para cuando nos llegue un nuevo mensaje. el new image debe coincidir con el de que se emiti la información
//la variable data es el mensaje que se está emitiendo por socket.io (información de la imagen)
socket.on("new image", function(data){
	data = JSON.parse(data);
	console.log(data);

	var container = document.querySelector("#imagenes");
	//querySelector recibe como argumento un selector css, lo que queremos no es el elemento como tal, sino lo que contiene.
	var source = document.querySelector("#entry-template").innerHTML;

	var template = Handlebars.compile(source);

	container.innerHTML +=template(data);
});