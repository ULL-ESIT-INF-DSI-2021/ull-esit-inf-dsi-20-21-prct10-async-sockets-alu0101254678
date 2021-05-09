# __Desarrollo de Sistemas Informáticos__
## __Práctica 10 - Implementación de un Cliente y un Servidor de la Aplicación de Procesamiento de Notas mediante Sockets en Node.js__
## __Yago Pérez Molanes (alu0101254678@ull.edu.es)__
__*Contenidos del informe*__

__*Pasos realizados para el desarrollo de la práctica*__

* Algunas tareas a realizar previamente: 
  * Aceptar la tarea asignada a [GitHub Classroom](https://classroom.github.com/assignment-invitations/2040e575f8d4b7d81e9336c0d617baf0/status)
  * En esta práctica deberemos familiarizarnos con el módulo [net](https://nodejs.org/dist/latest-v16.x/docs/api/net.html) de Node.js.
  * También es de especial interés la clase [EventEmitter](https://nodejs.org/dist/latest-v16.x/docs/api/events.html#events_class_eventemitter) del módulo Events de Node.js
  * Por último, como sucedió en la [práctica 8](https://github.com/ULL-ESIT-INF-DSI-2021/ull-esit-inf-dsi-20-21-prct08-filesystem-notes-app-alu0101254678.git) volveremos
    a emplear los paquetes [yargs](https://www.npmjs.com/package/yargs) y [chalk](https://www.npmjs.com/package/chalk).

## __Introducción y Objetivos__
En esta práctica tendremos que partir de la implementación de la aplicación de procesamiento de notas de texto que llevamos a cabo en la [práctica 8](https://github.com/ULL-ESIT-INF-DSI-2021/ull-esit-inf-dsi-20-21-prct08-filesystem-notes-app-alu0101254678.git) para escribir un servidor y un cliente haciendo uso de los sockets
que podemos encontrar en el módulo **net** de Node.js.

Recordamos de la práctica 8 que las operaciones que el usuario puede realizar consisten en añadir o modificar una nota, eliminar una nota, y listar el conjunto
de notas o una nota en concreto.

Los usuarios interactúan con la aplicación a través de la línea de comandos, mientras que el formato elegido para almacenar las notas será JSON, de eso se 
encargará el servidor

Comentaremos la solución propuesta para esta práctica, y además trataremos aspectos como las GitHub Actions.

## **Requisitos de la Aplicación de Procesamiento de Notas de Texto**

Estos son los requisitos que debe cumplir:

1.  La aplicación permitirá que varios usuarios interactúen con ella.
  
2.  Una nota estará formada por un *título*, un *cuerpo*, y un *color* (rojo, verde, azul o amarillo).
   
3.  Cada usuario dispondrá de su propia lista de notas, con la que podrá llevar a cabo las siguientes acciones:
  * Añadir una nota a la lista, antes de añadirla, se debe comprobar si ya existe, en cuyo caso se debe mostrar un mensaje de error.
  * Modificar una nota, tenemos que comprobar si existe una nota con el título a modificar, si es así se procede a su modificación, y si no es
    el caso se deberá informar al usuario con un mensaje de error en el cliente.
  * Eliminar una nota de la lista. Se deberá comprobar si la nota previamente existe para que pueda ser borrada.
  * Listar los títulos de las notas de la lista, según el color del atributo *color*, esto se hará con el paquete **chalk**.
  * Leer una nota concreta de la lista, se debe mostrar el título y el cuerpo de la nota, pero se debe verificar previamente que existe el título
    de la nota que se está buscando.
  * Los mensajes informativos se mostrarán en color verde, y los mensajes de eror en color rojo.
  * El servidor es responsable de hacer persistentes la lista de notas de cada usuario.
    1.  Guardar una nota de la lista a un fichero con formato *json*. Los ficheros correspondientes a las notas del usuario deben alojarse en un
        directorio que tendrá como nombre el del propio usuario.
    2.  Cargar una nota desde los diferentes ficheros con formato *json* almacenados en el directorio del usuario correspondiente.
   
4.  El usuario solo podrá interactuar con la aplicación a través de la línea de comandos. Los diferentes comandos, opciones de los mismos, así 
    como manejadores asociados a cada uno de ellos deben gestionarse haciendo uso del paquete **yagrs**.

## **Client.ts**

Empezamos explicando el funcionamiento del lado del cliente, en el directorio *src* se almacena un fichero llamado *client.ts* que hace las funciones necesarias
para que el usuario interactúe con el cliente.

Recordamos que se gestiona el paso de argumentos desde la línea de comandos a través de yargs, veamos un ejemplo para el comando list, aunque es aplicable
para todos los comandos:

```TypeScript
yargs.command({
  command: 'list',
  describe: 'Lista las notas del usuario',
  builder: {
    user: {
      describe: 'Usuario',
      demandOption: true,
      type: 'string',
    },
  },
```

En este caso nos encontramos con el comando *list*, que, recordamos, lista las notas de un usuario, de ahí que tenga como único argumento el usuario en cuestión,
también, cabe destacar, que las notas, por cuestiones de simplicidad, se almacenan en un directorio fijo, seguido del nombre del usuario, por ejemplo si tuvieramos
un usuario llamado *user1* este sería su directorio:

**/users/user1**

y dentro tendría las notas correspondientes.

Por otro lado, una vez que hemos construido el comando propiamente dicho, lo que tenemos que hacer es manejar su lógica, estos se hace con *handler(argv)* tal y como se
muestra a continuación:

```TypeScript
  handler(argv) {
    if (typeof argv.user === 'string') {
      const client = net.connect({port: 60300});

      const peticion = {
        'user': argv.user,
        'type': 'list',
      };

      client.write(JSON.stringify(peticion));

      let wholeData = '';
      client.on('data', (dataChunk) => {
        wholeData += dataChunk.toString();

        let messageLimit = wholeData.indexOf('\n');
        while (messageLimit !== -1) {
          const message = wholeData.substring(0, messageLimit);
          wholeData = wholeData.substring(messageLimit + 1);
          client.emit('request', JSON.parse(message));
          messageLimit = wholeData.indexOf('\n');
        }
      });

      client.on('request', (data) => {
        if (data.success === 'true') {
          console.log(chalk.bgGreen(`Estas son tus notas, ${argv.user}: `));
          console.log(chalk.keyword(data.col).bold(data.tit));
        } else if (data.success === 'false') {
          console.log(chalk.bgRed(data.nonotes));
        }
      });
    }
  },
```
La siguiente sentencia nos permite conectarnos al cliente:

```TypeScript
const client = net.connect({port: 60300});
```

Nos estamos conectando al servidor por el puerto 60300, el servidor es local, asimismo, client, es un socket, por lo tanto podemos manejar eventos con
este objeto creado.

Posteriormente con la siguiente sentencia construimos una petición al servidor en formato json, y se la enviamos con el método write del socket:

```TypeScript
client.write(JSON.stringify(peticion));
```
La petición debe de contener el tipo de la propia petición para que el servidor sepa que clase de operación desea realizar el usuario.

Más adelante lo que haceoms es controlar un evento, en esencia, sabemos que el servidor nos va a responder con algún tipo de mensaje, pues el cliente lo 
maneja con el siguiente evento:

```TypeScript
client.on('data', (dataChunk) => {
```
Sin embargo, dataChunk es un buffer y tenemos que realizar una conversión a string para poder manejar los datos que hemos recibido de parte del servidor.

```TypeScript
wholeData += dataChunk.toString();

  let messageLimit = wholeData.indexOf('\n');
  while (messageLimit !== -1) {
    const message = wholeData.substring(0, messageLimit);
    wholeData = wholeData.substring(messageLimit + 1);
    client.emit('request', JSON.parse(message));
    messageLimit = wholeData.indexOf('\n');
  }
```
Luego para averiguar si es un mensaje completo intentamos controlar donde se enccuentra en retorno de carro, y una vez lo sabemos podemos manejar nuestro
propio evento, que será un request, con el mensaje dispuesto enteramente para poder procesarlo, en formato json.

```TypeScript
client.on('request', (data) => {
  if (data.success === 'true') {
```
Por último, todos los mensajes tienen un atributo que es *success*, con el que podemos averiguar si el procesamiento de la petición ha siso existosa, o por
el contrario, ha sucedido algún error durante su ejecución, y dependiendo del comando, tendrá mas atributos o menos, en este caso para list, tendrá col y tit,
para el caso de que sea éxito, y nonotes, que es un mensaje relacionado con que no se han encontrado notas en el directorio del usuario correspondiente, en el 
caso de que succes sea un fracaso.

Recordamos que los mensajes informativos se colorean en verde y los de error en rojo.

## **Server.ts**

El servidor por su parte está más encaminado a dar respuesta por parte de las peticiones del cliente, empezamos creando la conexión con esta estructura inicial:

```TypeScript
net.createServer((connection) => {
  console.log('Un cliente se ha conectado');
}).listen(60300, () => {
  console.log('Esperando a que los clientes se conecten.');
});
```

No lo estamos diciendo, pero es necesario importar las librerías de código adecuadas, por supuesto, necesitamos el módulo net, el módulo fs, y por último, el
módulo path, este último para controlar las rutas a los directorios del sistema de ficheros, concretamente las rutas relativas, mientras que el cliente usa net, yargs
y chalk.

```TypeScript
import * as net from 'net';
import * as fs from 'fs';
import path from 'path';
```

Iniciamos la conexión, y tenemos que *connection* es un socket, que une dos extremos de comunicaciones, cuando un cliente se conecta por la consola del servidor
se muestra el mensaje correspondiente, además el servidor está constantemente escuchando en un puerto determinado, en este caso hemos elegido el 60300, y el cliente
se conectará a través de ese mismo puerto, es una conexión TCP, internamente.

Luego, al final del programa podemos apreciar como hemos escrito dos eventos, que son los siguientes:

```TypeScript
connection.on('end', () => {
  console.log('Se ha terminado de procesar la respuesta y se ha enviado');
});

connection.on('close', () => {
  console.log('Un cliente se ha desconectado');
});
```

El primero de ellos se activa cuando el servidor ha terminado de procesar los datos, entonces puede cerrar la conexión, es decir, socket para que no se envíen
más datos por parte del cliente.

El segundo y último sirve para registrar cuando un cliente cierra la conexión, porque, por ejemplo, presiona la tecla *ctr + c* para abortar la ejecución
del programa. En ambos caso, simplemente se meustran mensajes informativos por la consola del servidor.

Aquí entramos en lo que se conoce como el patrón cliente-servidor, ya que, el cliente le envía una petición al servidor, y éste tiene que procesarla, para ello
necesitamos el evento *on data*, que se ejecuta cada vez que el cliente emite un mensaje y se lo pasa al servidor:

```TypeScript
connection.on('data', (dataJSON) => {
    console.log('He recibido tu petición\n');
    const message = JSON.parse(dataJSON.toString());

    if (message.type === 'list') {
      connection.emit('requestlist', message.user);
    }

    if (message.type === 'read') {
      console.log(`Ya tengo la peticion`);
      connection.emit('requestread', message.user, message.title);
    }

    if (message.type === 'remove') {
      connection.emit('requestremove', message.user, message.title);
    }

    if (message.type === 'mod') {
      connection.emit('requestmod', message.user, message.title, message.body, message.color);
    }

    if (message.type === 'add') {
      connection.emit('requestadd', message.user, message.title, message.body, message.color);
    }
  });
```

El tipo de dato dataJSON, es un string, entonces lo que deberemos hacer es pasarlo a formato json, para poder manejarlo adecuandamente, y como ya podemos intuir,
en función de lo que contenga el atributo mesaage.type, activaremos un evento correspondiente, al que le pasaremos como parámetros los datos correspondientes, es
decir que emitimos un evento, los tipos de datos son diferentes dependiendo del comando que estemos empleando,aquí los mostramos:

```TypeScript
// comando list
const peticion = {
  'user': argv.user,
  'type': 'list',
};

// comando read
const peticion = {
  'user': argv.user,
  'title': argv.title,
  'type': 'read',
};

// comando remove
const peticion = {
  'user': argv.user,
  'title': argv.title,
  'type': 'remove',
};

// comando mod
const peticion = {
  'user': argv.user,
  'title': argv.title,
  'body': argv.body,
  'color': argv.color,
  'type': 'mod',
};

// comando add
const peticion = {
  'user': argv.user,
  'title': argv.title,
  'body': argv.body,
  'color': argv.color,
  'type': 'add',
};
```

Y todos estos objetos se envían siempre de la misma forma, en un string:

```TypeScript
client.write(JSON.stringify(peticion));
```

Pues una vez que sabemos esto y el servidor sabe de que tipo es la petición del cleinte, ya puede procesar dicha petición, por ejemplo, imaginemos
que el cliente le ha enviado al servidor una petición de tipo list, que lista las notas de un usuario en concreto, entonces se activa el evento que 
hemos denominado *requestlist*:

```TypeScript
connection.on('requestlist', (usuario) => {
  const filenames = fs.readdirSync(path.resolve(__dirname, `../users/${usuario}`));

  if (filenames.length === 0) {
    connection.write(`{"tipo": "list", "success": "false", "nonotes": "No se ha encontrado ninguna nota en el directorio ${usuario}"}\n`);
    connection.end();
  } else {
    filenames.forEach((file) => {
      const rawdata = fs.readFileSync(path.resolve(__dirname, `../users/${usuario}/${file}`));
      const note = JSON.parse(rawdata.toString());
      const respuesta = {
        titulo: note.title,
        color: note.color,
      };
      connection.write(`{"tipo": "list", "success": "true", "tit": "${respuesta.titulo}", "col": "${respuesta.color}"}\n`);
    });
    connection.end();
  }
});
```

En este caso como único parámetro tenemos usuario, que es el que nos envió el cliente previamente, y aquí es donde entramos en el sistema de ficheros, la
primera tarea que haremos será abrir el directorio, y en el caso de que no exista ninguna nota, se lo tenemos que hacer ver al cliente con un mensaje, que será
un string que tomará el formato json posteriormente, y tenemos que hacer que termine en el carácter \n para que el cliente sepa que es un mensaje completo.

Por otro lado, en el caso de que si tengamos notas, lo que hacemos es iterar en cada uno de los ficheros y para ellos obtener el título y el color de cada una de
ellas, la estructura de cada uno de los manejadores de los distintos comandos es más o menos similar.

También los errores que pueden suceder son que no exista ninguna nota en el directorio del usuario, o que, para las operaciones de lectura de un archivo en
concreto, el borrado o la modificación de notas, o exista la propia nota en cuestión.

Recordamos que una nota tiene un formato como el que se muestra a continuación:

```JSON
{
  "title": "White note",
  "body": "Cuerpo de la nota blanca",
  "color": "white"
}
```

## **Ejemplos de uso de la Aplicación**

![server](https://github.com/ULL-ESIT-INF-DSI-2021/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0101254678/blob/master/img/pr10/server.png?raw=true)

![client-list](https://github.com/ULL-ESIT-INF-DSI-2021/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0101254678/blob/master/img/pr10/client-list.png?raw=true)

![client-add-list-read](https://github.com/ULL-ESIT-INF-DSI-2021/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0101254678/blob/master/img/pr10/client-add-list-read.png?raw=true)

![server-some-commands](https://github.com/ULL-ESIT-INF-DSI-2021/ull-esit-inf-dsi-20-21-prct10-async-sockets-alu0101254678/blob/master/img/pr10/server-commands-message.png?raw=true)
## **Conclusiones**
La realización de las dos prácticas anteriores a esta, práctica 8, y la práctica 9, y esta, en concreto, están relacionadas entre sí,ya que el objetivo final
es poder manejar las notas de los usuarios y poder procesarlas, sin embargo, la práctica 10 es algo especial ya que se maneja un nuevo concepto que son los
sockets, los canales de comunicación, y en esencia, estamos definiendo un protocolo de comunicación entre un cliente y un servidor.

También hemos vuelto a necesitar el manejo de ficheros, y el manejo de los parámetros con yargs, por último, los mensajes se muestran en color gracias al paquete
chalk. Por último, hemos descubierto la importancia del formato de intercambio de archivos, el json.

## **Bibliografía**
1.  Enunciado de la [Práctica 8](https://ull-esit-inf-dsi-2021.github.io/prct08-filesystem-notes-app/) - Aplicación de procesamiento de notas de texto.
2.  ¿Cómo funcionan los [eventos](https://dev.to/lydiahallie/javascript-visualized-event-loop-3dif)?
3.  ¿Cómo funciona el paquete [yargs](https://www.npmjs.com/package/yargs)?
4.  ¿Cómo funciona el paquete [chalk](https://www.npmjs.com/package/chalk)?
5.  Módulo [net](https://nodejs.org/dist/latest-v16.x/docs/api/net.html) para el manejo de sockets en Node.js
6.  Documentación del [sistema de ficheros](https://nodejs.org/api/fs.html) de Node.js