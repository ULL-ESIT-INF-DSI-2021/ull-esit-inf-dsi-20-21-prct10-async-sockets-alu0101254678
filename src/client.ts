import * as yargs from 'yargs';
import * as net from 'net';
import chalk from 'chalk';

/**
 * Comando que sirve para listar las notas de un usuario, mostrando
 * el resultado del lado del cliente, tiene un argumento que es el usuario
 * y en el manejador se conecta al servidor
 */
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
});

/**
 * Comando que sirve para leer una nota concreta del usuario, dandole
 * el titulo, tiene dos argumentos que son el usuario y el titulo, y en el
 * manejador es donde se realiza la conexion al servidor
 */
yargs.command({
  command: 'read',
  describe: 'Lee una nota concreta del usuario',
  builder: {
    user: {
      describe: 'Usuario',
      demandOption: true,
      type: 'string',
    },
    title: {
      describe: 'Título de la nota',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.user === 'string' && typeof argv.title === 'string') {
      const client = net.connect({port: 60300});

      const peticion = {
        'user': argv.user,
        'title': argv.title,
        'type': 'read',
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
        if (data.tipo === 'read' && data.success === 'true') {
          console.log(chalk.bgGreen(`Esta es la nota que estabas buscando, ${argv.user}: `));
          console.log(chalk.keyword(data.col).bold(data.tit));
          console.log(chalk.keyword(data.col).bold(data.cur));
        } else if (data.tipo === 'read' && data.success === 'false' && data.nonotes) {
          console.log(chalk.bgRed(`${data.nonotes}`));
        } else if (data.tipo === 'read' && data.success === 'false' && data.nonamenotes) {
          console.log(chalk.bgRed(`${data.nonamenotes}`));
        }
      });
    }
  },
});

/**
 * Comando que sirve para eliminar una nota del usuario, tiene dos argumentos que son
 * el usuario y el titulo de la nota que quiere eliminar, en el manejador es donde se conecta
 * al cliente, todos los comandos por un puerto determinado
 */
yargs.command({
  command: 'remove',
  describe: 'Elimina una nota del usuario',
  builder: {
    user: {
      describe: 'Usuario',
      demandOption: true,
      type: 'string',
    },
    title: {
      describe: 'Título de la nota a eliminar',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.user === 'string' && typeof argv.title === 'string') {
      const client = net.connect({port: 60300});

      const peticion = {
        'user': argv.user,
        'title': argv.title,
        'type': 'remove',
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

      /**
       * Cuando el cliente recibe los datos los procesa con un evento que creamos aqui
       */
      client.on('request', (data) => {
        if (data.success === 'true') {
          console.log(chalk.green(`Se ha eliminado la nota ${data.tit} del usuario ${argv.user}`));
        } else if (data.success === 'false' && data.nonotes) {
          console.log(chalk.red(`${data.nonotes}`));
        } else if (data.success === 'false' && data.nonamenotes) {
          console.log(chalk.red(`${data.nonamenotes}`));
        } else {
          console.log(chalk.red(`Ha ocurrido un error inesperado`));
        }
      });
    }
  },
});

/**
 * Comando que sirve para modificar una nota del usuario, entonces como argumentos
 * tiene que tener el usuario, el titulo de la nota, el cuerpo y el color, podrían
 * haberse puesta de forma opcional pero decidimos que fueran todos obligatorios
 */
yargs.command({
  command: 'mod',
  describe: 'Modifica una nota del usuario',
  builder: {
    user: {
      describe: 'Usuario',
      demandOption: true,
      type: 'string',
    },
    title: {
      describe: 'Título de la nota que se quiere modificar, el título no se modifica',
      demandOption: true,
      type: 'string',
    },
    body: {
      describe: 'Cuerpo de la nota que se quiere modificar',
      demandOption: true,
      type: 'string',
    },
    color: {
      describe: 'Color de la nota que se quiere modificar',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.user === 'string' && typeof argv.title === 'string' && typeof argv.body === 'string' &&
    typeof argv.color === 'string') {
      const client = net.connect({port: 60300});

      const peticion = {
        'user': argv.user,
        'title': argv.title,
        'body': argv.body,
        'color': argv.color,
        'type': 'mod',
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
          console.log(chalk.green(`Se ha modificado la nota ${data.tit} del usuario ${argv.user}`));
        } else if (data.success === 'false' && data.nonotes) {
          console.log(chalk.red(`${data.nonotes}`));
        } else if (data.success === 'false' && data.nonamenotes) {
          console.log(chalk.red(`${data.nonamenotes}`));
        } else {
          console.log(chalk.red(`Ha ocurrido un error inesperado`));
        }
      });
    }
  },
});

/**
 * Comando que sirve para añadir una nota, se tienen que dar entonces todos los argumentos
 * para construir la nota, tanto el usuario, el titulo, el cuerpo y el color de la nota que se
 * desea añadir, en todos los comandos en sus manejadores se controlan los errores que
 * puedan surgir
 */
yargs.command({
  command: 'add',
  describe: 'Añade una nota en el directorio del usuario',
  builder: {
    user: {
      describe: 'Usuario',
      demandOption: true,
      type: 'string',
    },
    title: {
      describe: 'Título de la nota que se va a añadir',
      demandOption: true,
      type: 'string',
    },
    body: {
      describe: 'Cuerpo de la nota que se va a añadir',
      demandOption: true,
      type: 'string',
    },
    color: {
      describe: 'Color de la nota que se va a añadir',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.user === 'string' && typeof argv.title === 'string' && typeof argv.body === 'string' &&
    typeof argv.color === 'string') {
      const client = net.connect({port: 60300});

      const peticion = {
        'user': argv.user,
        'title': argv.title,
        'body': argv.body,
        'color': argv.color,
        'type': 'add',
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
          console.log(chalk.green(`Se ha añadido la nota ${data.tit} del usuario ${argv.user}`));
        } else if (data.success === 'false') {
          console.log(chalk.red(`${data.samename}`));
        } else {
          console.log(chalk.red(`Ha ocurrido un error inesperado`));
        }
      });
    }
  },
});

/**
 * Esta sentencia hace que se analice lo que se pasa por la línea
 * de comandos
 */
yargs.parse();
