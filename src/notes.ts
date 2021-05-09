import * as fs from 'fs';
import chalk from 'chalk';
import path from 'path';

// fs forma parte de la librería de APIS de node.js, en este caso
// necesitamos la que nos permite trabajar con ficheros

// chalk es una librería que permite resaltar los colores y
// representarlos en la terminal de distinto color

/**
 * Clase Notes, que se encarga del sistema de ficheros, y de realizar
 * las operaciones con las notas de texto
 */
export class Notes {
  /**
   * El único atributo es 'user', y representa al
   * directorio del usuario
   */
  private user: string;

  /**
   * El constructor inicializa el atributo user
   * @param user
   */
  constructor(user: string) {
    this.user = user;
  }

  /**
   * Getter del atributo user
   * @returns El atributo user
   */
  getUser() {
    return this.user;
  }

  /**
   * Método que sirve para añadir una nota, tiene
   * como parámetros el título(string), el cuerpo(string) y
   * el color(string), tiene que comprobar si la nota ya
   * existe para poder añadirla
   * @param titleAux
   * @param bodyAux
   * @param colorAux
   */
  addNote(titleAux: string, bodyAux: string, colorAux: string) {
    try { // declaraciones para try
      const filenames = fs.readdirSync(path.resolve(__dirname, `../users/${this.user}`));

      let contador: number = 0;

      filenames.forEach((file) => {
        const rawdata = fs.readFileSync(path.resolve(__dirname, `../users/${this.user}/${file}`));
        const note = JSON.parse(rawdata.toString());
        const titulo: string = note.title;
        if (titulo === titleAux) {
          contador += 1;
          throw new Error(`Ya existe una nota con título ${titulo} en el directorio ${this.user}`);
        }
      });
      if (contador === 0) {
        const objetoNotas = {
          title: titleAux,
          body: bodyAux,
          color: colorAux,
        };
        const data: string = JSON.stringify(objetoNotas, null, 2);
        fs.writeFileSync((path.resolve(__dirname, `../users/${this.user}/${titleAux}.json`)), data);
        console.log(chalk.green(`La nota con título ${titleAux} se ha creado con éxito!`));
        return data;
      }
    } catch (error) {
      console.error(chalk.red('Ha ocurrido un error inesperado: ', error.message));
      const mensajeError = chalk.red('Ha ocurrido un error inesperado: ', error.message);
      return mensajeError;
    }
  }

  /**
   * Método que sirve para modificar una nota, las partes que se modifican
   * de la nota son el cuerpo y el color, (este último opcionalmente), el procedimiento
   * que se sigue es que se elimina una nota, y se vuelve a crear la misma nota
   * pero con el cuerpo y el color cambiados
   * @param tituloAux el titulo que se va a aplicar
   * @param cuerpoAux el cuerpo que se va a aplicar
   * @param colorAux el color que se va a aplicar
   * @returns Una cadena de datos con los parámetros modificados o un mensaje de error
   */
  modNote(tituloAux: string, cuerpoAux: string, colorAux:string = 'blue') {
    try { // declaraciones para try
      const filenames = fs.readdirSync(path.resolve(__dirname, `../users/${this.user}`));

      let contador: number = 0;

      filenames.forEach((file) => {
        const rawdata = fs.readFileSync(path.resolve(__dirname, `../users/${this.user}/${file}`));
        const note = JSON.parse(rawdata.toString());
        const titulo: string = note.title;
        if (titulo === tituloAux) {
          contador += 1;
          const objetoNotas = {
            title: tituloAux,
            body: cuerpoAux,
            color: colorAux,
          };
          fs.unlinkSync(path.resolve(__dirname, `../users/${this.user}/${file}`));
          const data: string = JSON.stringify(objetoNotas, null, 2);
          console.log(chalk.green(`La nota con título ${tituloAux} se ha modificado con éxito!`));
          fs.writeFileSync((path.resolve(__dirname, `../users/${this.user}/${tituloAux}.json`)), data);
        }
      });
      if (contador === 0) {
        throw new Error(`No se ha encontrado ninguna nota con título ${tituloAux} en el directorio ${this.user}`);
      } else {
        return `La nota con título ${tituloAux} se ha modificado con éxito!`;
      }
    } catch (error) {
      console.error(chalk.red('Ha ocurrido un error inesperado: ', error.message));
      const mensajeError = chalk.red('Ha ocurrido un error inesperado: ', error.message);
      return mensajeError;
    }
  }

  /**
   * Método que sirve para leer una nota que el usuario
   * introduce a través de su título, tiene como parámetro
   * el título de la nota a listar(string)
   * @param tituloListar
   */
  readTitle(tituloListar: string) {
    try { // declaraciones para try
      const filenames = fs.readdirSync(path.resolve(__dirname, `../users/${this.user}`));

      if (filenames.length === 0) {
        throw new Error(`No se ha encotrado ninguna nota en el directorio ${this.user}`);
      }

      let contador: number = 0;

      filenames.forEach((file) => {
        const rawdata = fs.readFileSync(path.resolve(__dirname, `../users/${this.user}/${file}`));
        const note = JSON.parse(rawdata.toString());
        const titulo: string = note.title;
        const cuerpo: string = note.body;
        const color: string = note.color;
        if (titulo === tituloListar) {
          contador += 1;
          console.log(chalk.keyword(color).bold(titulo));
          console.log(chalk.keyword(color).bold(cuerpo));
        }
      });
      if (contador === 0) {
        throw new Error(`No se ha encontrado ninguna nota con título ${tituloListar} en el directorio ${this.user}`);
      }
    } catch (error) {
      console.error(chalk.red('Ha ocurrido un error inesperado: ', error.message));
      const mensajeError = chalk.red('Ha ocurrido un error inesperado: ', error.message);
      return mensajeError;
    }
  }

  /**
   * Método que sirve para eliminar una nota, en función
   * de un título de la propia nota que se desea eliminar,es
   * necesario comprobar si esa nota existe
   * @param tituloEliminar
   */
  removeNote(tituloEliminar: string) {
    try {
      const filenames = fs.readdirSync(path.resolve(__dirname, `../users/${this.user}`));

      if (filenames.length === 0) {
        throw new Error(`No se ha encotrado ninguna nota en el directorio ${this.user}`);
      }

      let contador: number = 0;

      filenames.forEach((file) => {
        const rawdata = fs.readFileSync(path.resolve(__dirname, `../users/${this.user}/${file}`));
        const note = JSON.parse(rawdata.toString());
        const titulo: string = note.title;
        if (titulo === tituloEliminar) {
          contador += 1;
          fs.unlinkSync(path.resolve(__dirname, `../users/${this.user}/${file}`));
          console.log(chalk.green(`Se ha eliminado la nota con título ${titulo}`));
        }
      });
      if (contador === 0) {
        throw new Error(`No se ha encontrado ninguna nota con título ${tituloEliminar} en el directorio ${this.user}`);
      }
    } catch (error) {
      console.error(chalk.red('Ha ocurrido un error inesperado: ', error.message));
      const mensajeError = chalk.red('Ha ocurrido un error inesperado: ', error.message);
      return mensajeError;
    }
  }


  /**
   * Método que sirve para listar el conjunto
   * de notas del usuario
   */
  readNotes() {
    try {
      const filenames = fs.readdirSync(path.resolve(__dirname, `../users/${this.user}`));

      if (filenames.length === 0) {
        throw new Error(`No se ha encotrado ninguna nota en el directorio ${this.user}`);
      }

      console.log(chalk.green(`Estas son tus notas, ${this.user}: `));

      filenames.forEach((file) => {
        const rawdata = fs.readFileSync(path.resolve(__dirname, `../users/${this.user}/${file}`));
        const note = JSON.parse(rawdata.toString());
        const titulo: string = note.title;
        const color: string = note.color;

        console.log(chalk.keyword(color).bold(titulo));
      });
    } catch (error) {
      console.error(chalk.red('Ha ocurrido un error inseperado: ', error.message));
    }
  }
}
