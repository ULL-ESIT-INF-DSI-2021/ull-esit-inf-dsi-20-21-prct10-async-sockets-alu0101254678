import * as yargs from 'yargs';
import * as net from 'net';
import chalk from 'chalk';

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

      console.log(chalk.green(`Estas son tus notas, ${argv.user}: `));

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
        console.log(chalk.keyword(data.col).bold(data.tit));
      });
    }
  },
});

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

      // console.log(chalk.green(`Estas son tus notas, ${argv.user}: `));

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
        if (data.tipo === 'read') {
          console.log(chalk.green(`Esta es la nota que estabas buscando, ${argv.user}: `));
          console.log(chalk.keyword(data.col).bold(data.tit));
          console.log(chalk.keyword(data.col).bold(data.cur));
        }
      });
    }
  },
});

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

      client.on('request', (data) => {
        if (data.success === 'true') {
          console.log(chalk.green(`Se ha eliminado la nota ${data.tit} del usuario ${argv.user}`));
        } else {
          console.log(chalk.red(`Ha ocurrido un error inesperado`));
        }
      });
    }
  },
});

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
        } else {
          console.log(chalk.red(`Ha ocurrido un error inesperado`));
        }
      });
    }
  },
});

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
        } else {
          console.log(chalk.red(`Ha ocurrido un error inesperado`));
        }
      });
    }
  },
});

yargs.parse();
