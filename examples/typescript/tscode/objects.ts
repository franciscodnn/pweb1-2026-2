/*
function saudar(pessoa: { nome: string; idade: number }) {
  return `Olá ${pessoa.nome}, você tem ${pessoa.idade} anos!`;
}

const pessoa = {
    nome: 'Francisco',
    idade: 40
}

console.log( typeof saudar(pessoa) );

// 1. typeof saudar(pessoa)
// 2. typeof 'Olá Francisco, você tem 40 anos!'
// 3. string

interface Pessoa {
    nome: string;
    idade: number;
    endereco?: string;  // Propriedade opcional
}

const user: Pessoa = {
    nome: 'Maria',
    idade: 30,
    // endereco: 'Rua XYZ, 50'
}

interface Animal {
    nome: string;
}

interface Cachorro extends Animal {
    raca: string;
    latir(): void;
}

const cachorro: Cachorro = {
    nome: 'Bob',
    raca: 'Poodle',
    latir: function(): void {
        console.log( `${this.nome} latiu` );
    }
}

cachorro.latir();
*/

type Pessoa = { nome: string; idade: number; email: string };
type Empregado = { empresa: string; cargo: string; email: string };

type Funcionario = Pessoa & Empregado;

const funcionario: Funcionario = {
  nome: "João",
  idade: 30,
  empresa: "TechCorp",
  cargo: "Desenvolvedor",
  email: "teste@gmail.com"
};

interface PessoaInterface {
    nome: string;
    idade: number;
}

interface EmpregadoInterface {
    empresa: string;
    cargo: string;
}

interface FuncionarioInterface 
    extends PessoaInterface, EmpregadoInterface {

    }

interface Servidor {
    nome: string;
    email: string;
}

interface Servidor {
    matricula: number;
}

const servidorIfpb: Servidor = {
    nome: 'Francisco',
    email: 'teste@gmail.com',
    matricula: 123
}



interface Formatavel {
    formato(): string;
}

class Documento implements Formatavel {
    constructor(private conteudo: string) {}

    formato(): string {
        return this.conteudo.toUpperCase();
    }
}

type StatusCodeHTTP = "200" | "201" | "202";


interface Dicionario {
    [chave: string]: string;
  }
  
  const cores: Dicionario = {
    vermelho: "#FF0000",
    verde: "#00FF00",
    azul: "#0000FF",
    123: "teste"
  };

interface Produto {
    id: number;
    nome: string;
    preco: number;
}
/*
Partial<Produto> => interface Produto {
    id?: number;
    nome?: string;
    preco?: number;
}
*/

const produto: Partial<Produto> = {
    id: 1,
    nome: 'filé',
}



interface Opcoes {
    largura: number;
    altura: number;
}

const opcoes: Opcoes = {
    largura: 10,
    altura: 30,
    profundidade: "5"
} as Opcoes;




function saudar({ nome, idade }: { nome: string; idade: number }) {
    return `Olá ${nome}, 
    você tem ${idade} anos!`;
}