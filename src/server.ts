import * as net from 'net';
import * as fs from 'fs';
import path from 'path';

/**
 * Se crea un servidor, connection es un socket, que también
 * puede emitir eventos, los datos que se envian entre el cliente
 * y servidor se envian en formato json, por lo tanto se tiene que
 * convertir a datos manejables, type es una de las propiedades del
 * mensaje del cliente, con la informacion del propio comando
 */
net.createServer((connection) => {
  console.log('Un cliente se ha conectado');

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

  /**
   * Este es el evento que maneja la operacion de lectura
   */
  connection.on('requestread', (usuario, titulo) => {
    const filenames = fs.readdirSync(path.resolve(__dirname, `../users/${usuario}`));

    if (filenames.length === 0) {
      connection.write(`{"tipo": "read", "success": "false", "nonotes": "No se ha encontrado ninguna nota en el directorio ${usuario}"}\n`);
      connection.end();
    } else {
      let contador: number = 0;
      filenames.forEach((file) => {
        const rawdata = fs.readFileSync(path.resolve(__dirname, `../users/${usuario}/${file}`));
        const note = JSON.parse(rawdata.toString());
        if (note.title === titulo) {
          const respuesta = {
            titulo: note.title,
            cuerpo: note.body,
            color: note.color,
          };
          contador += 1;
          connection.write(`{"tipo": "read", "success": "true", "tit": "${respuesta.titulo}", "cur": "${respuesta.cuerpo}", "col": "${respuesta.color}"}\n`);
          connection.end();
        }
      });
      if (contador === 0) {
        connection.write(`{"tipo": "read", "success": "false", "nonamenotes": "No se ha encontrado ninguna nota con nombre ${titulo} en el directorio ${usuario}"}\n`);
        connection.end();
      }
    }
  });

  /**
   * Este es el evento que maneja la operacion de lista, en todas las operaciones se tiene que abrir
   * el directorio, lo hacemos con readdirSync, las respuestas las enviamos en json
   */
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

  /**
   * Este es el evento que maneja la operacion remove, cuando se envia una respuesta al cliente, se tien
   * que cerrar la conecxion del lado del cliente, mientras el servidor sigue esperando, porque ya se ha
   * procesado la informacion
   */
  connection.on('requestremove', (usuario, titulo) => {
    const filenames = fs.readdirSync(path.resolve(__dirname, `../users/${usuario}`));

    if (filenames.length === 0) {
      connection.write(`{"tipo": "remove", "success": "false", "nonotes": "No se ha encontrado ninguna nota en el directorio ${usuario}"}\n`);
      connection.end();
    } else {
      let contador: number = 0;

      filenames.forEach((file) => {
        const rawdata = fs.readFileSync(path.resolve(__dirname, `../users/${usuario}/${file}`));
        const note = JSON.parse(rawdata.toString());
        const title: string = note.title;
        if (title === titulo) {
          contador += 1;
          fs.unlinkSync(path.resolve(__dirname, `../users/${usuario}/${file}`));
          connection.write(`{"tipo": "remove", "success": "true", "tit": "${titulo}"}\n`);
          connection.end();
        }
      });
      if (contador === 0) {
        connection.write(`{"tipo": "remove", "success": "false", "nonamenotes": "No se ha encontrado ninguna nota con nombre ${titulo} en el directorio ${usuario}"}\n`);
        connection.end();
      }
    }
  });

  /**
   * Este es el evento que maneja la operacion mod, recordamos que estamos ejecutando funciones asincronas
   */
  connection.on('requestmod', (usuario, titulo, cuerpo, color) => {
    const filenames = fs.readdirSync(path.resolve(__dirname, `../users/${usuario}`));

    if (filenames.length === 0) {
      connection.write(`{"tipo": "mod", "success": "false", "nonotes": "No se ha encontrado ninguna nota en el directorio ${usuario}"}\n`);
      connection.end();
    } else {
      let contador: number = 0;
      filenames.forEach((file) => {
        const rawdata = fs.readFileSync(path.resolve(__dirname, `../users/${usuario}/${file}`));
        const note = JSON.parse(rawdata.toString());
        const title: string = note.title;
        if (title === titulo) {
          contador += 1;
          const objetoNotas = {
            title: titulo,
            body: cuerpo,
            color: color,
          };
          fs.unlinkSync(path.resolve(__dirname, `../users/${usuario}/${file}`));
          const data: string = JSON.stringify(objetoNotas, null, 2);
          fs.writeFileSync((path.resolve(__dirname, `../users/${usuario}/${file}`)), data);
          connection.write(`{"tipo": "mod", "success": "true", "tit": "${titulo}"}\n`);
          connection.end();
        }
      });
      if (contador === 0) {
        connection.write(`{"tipo": "mod", "success": "false", "nonamenotes": "No se ha encontrado ninguna nota con nombre ${titulo} en el directorio ${usuario}"}\n`);
        connection.end();
      }
    }
  });

  /**
   * Este es el evento que maneja la operacion add, todos estos eventos reciben parámetros
   * para luego utilizarlos en el sistema de ficheros
   */
  connection.on('requestadd', (usuario, titulo, cuerpo, color) => {
    const filenames = fs.readdirSync(path.resolve(__dirname, `../users/${usuario}`));

    let contador: number = 0;

    filenames.forEach((file) => {
      const rawdata = fs.readFileSync(path.resolve(__dirname, `../users/${usuario}/${file}`));
      const note = JSON.parse(rawdata.toString());
      const title: string = note.title;
      if (title === titulo) {
        contador += 1;
        connection.write(`{"tipo": "add", "success": "false", "samename": "Ya existe una nota con título ${titulo} en el directorio ${usuario}"}\n`);
        connection.end();
      }
    });
    if (contador === 0) {
      const objetoNotas = {
        title: titulo,
        body: cuerpo,
        color: color,
      };
      const data: string = JSON.stringify(objetoNotas, null, 2);
      fs.writeFileSync((path.resolve(__dirname, `../users/${usuario}/${titulo}.json`)), data);
      connection.write(`{"tipo": "add", "success": "true", "tit": "${titulo}"}\n`);
      connection.end();
    }
  });

  /**
   * Este es el evento que se activa una vez se envia la respuesta al cliente
   */
  connection.on('end', () => {
    console.log('Se ha terminado de procesar la respuesta y se ha enviado');
  });

  /**
   * Este es el evento que se activa cuando un cliente se desconecta, se ejecuta despues
   * del end
   */
  connection.on('close', () => {
    console.log('Un cliente se ha desconectado');
  });
}).listen(60300, () => {
  console.log('Esperando a que los clientes se conecten.');
});

// El servidor estará escuchando constantemente, en el puerto 60300
