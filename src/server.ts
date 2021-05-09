import * as net from 'net';
import * as fs from 'fs';
import path from 'path';

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
          fs.writeFileSync((path.resolve(__dirname, `../users/${usuario}/${file}.json`)), data);
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

  connection.on('end', () => {
    console.log('Se ha terminado de procesar la respuesta y se ha enviado');
  });

  connection.on('close', () => {
    console.log('Un cliente se ha desconectado');
  });
}).listen(60300, () => {
  console.log('Esperando a que los clientes se conecten.');
});
