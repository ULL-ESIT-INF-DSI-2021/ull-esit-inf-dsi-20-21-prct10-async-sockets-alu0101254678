import 'mocha';
import {expect} from 'chai';
import {Notes} from '../src/notes';
import chalk from 'chalk';

describe('Tests de la clase Notes', () => {
  const objetoNotas: Notes = new Notes('yago');

  it('Puede ser instanciado', () => {
    expect(objetoNotas instanceof Notes).to.be.true;
  });

  it('Se accede al atributo user', () => {
    expect(objetoNotas.getUser()).to.be.eq('yago');
  });

  it('Se añade una nota correctamente', () => {
    const data = {
      title: 'nota-x',
      body: 'este es el cuerpo de la nota x',
      color: 'yellow',
    };
    const objetoString = JSON.stringify(data, null, 2);
    expect(objetoNotas.addNote('nota-x', 'este es el cuerpo de la nota x', 'yellow')).to.be.equal(objetoString);
  });

  it('Se lee una nota correctamente', () => {
    const titulo1: string = 'nota-x';

    const titulo2: string = 'nota-x2';
    const mensajeError = new Error(`No se ha encontrado ninguna nota con título ${titulo2} en el directorio ${objetoNotas.getUser()}`);
    const mensajeErrorRed = chalk.red('Ha ocurrido un error inesperado: ', mensajeError.message);

    expect(objetoNotas.readTitle(titulo1)).not.be.equal(mensajeErrorRed);
    expect(objetoNotas.readTitle(titulo2)).to.be.equal(mensajeErrorRed);
  });

  it('Se modifica una nota correctamente', () => {
    const data1 = {
      title: 'nota-x',
      body: 'este es el cuerpo de la nota x',
      color: 'yellow',
    };

    const data2 = {
      title: 'nota-x2',
      body: 'este es el cuerpo de la nota x2',
      color: 'blue',
    };

    const mensajeError = new Error(`No se ha encontrado ninguna nota con título ${data2.title} en el directorio ${objetoNotas.getUser()}`);
    const mensajeErrorRed = chalk.red('Ha ocurrido un error inesperado: ', mensajeError.message);

    expect(objetoNotas.modNote(data1.title, data1.body, data1.color)).to.be.equal(`La nota con título ${data1.title} se ha modificado con éxito!`);
    expect(objetoNotas.modNote(data1.title, data1.body, data1.color)).not.be.equal(mensajeErrorRed);
    expect(objetoNotas.modNote(data2.title, data2.body, data2.color)).to.be.equal(mensajeErrorRed);
  });

  it('Se elimina una nota correctamente', () => {
    const titulo1: string = 'nota-x';
    const titulo2: string = 'nota-x2';

    const mensajeError = new Error(`No se ha encontrado ninguna nota con título ${titulo2} en el directorio ${objetoNotas.getUser()}`);
    const mensajeErrorRed = chalk.red('Ha ocurrido un error inesperado: ', mensajeError.message);

    expect(objetoNotas.removeNote(titulo1)).not.be.equal(mensajeErrorRed);
  });
});
