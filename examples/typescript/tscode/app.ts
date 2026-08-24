let nomeAny: any = 'Francisco';

// Quantidade de caracteres
console.log( nomeAny.length );

let nomeUnknown: unknown = 'Francisco';

if(nomeUnknown === 'string')
  console.log( nomeUnknown.length );


console.log( (nomeUnknown as string).length );

function soma(x: number, y?: number): number {
  // console.log(y);
  // if(y === undefined) return x;

  // return (y === undefined) ? x : x + y;

  return x + (y || 0);
}

// Funções de seta
const multiplicar = (x: number, y: number): number => {
  return x * y;
}

console.log( `Soma: ${soma(10)}` );
console.log( `Soma: ${soma(10, 5)}` );

let status: "ativo" | "inativo" | "pendente";

status = "ativo";
// status = "concluído"; => // Erro

let id: number | string ;

id = 5;
id = "5";
// id = [];

// ------

interface Usuario {
  readonly id: number;
  nome: string;
}

const usuario: Readonly<Usuario> = {
  id: 1,
  nome: 'Francisco'
};


const usuario2: Partial<Usuario> = {
  id: 2
};

interface Escola {
  nome: string;
  sigla: string;
  endereco: string;
  quantidadeSalas: number;
}

const escolaNova: Omit<Escola, "sigla"> = {
  nome: "Escola Nova",
  endereco: "Rua ...",
  quantidadeSalas: 20
};

const escolaNova2: Pick<Escola, "nome" | "endereco" | "quantidadeSalas" > = {
  nome: "Escola Nova",
  endereco: "Rua ...",
  quantidadeSalas: 20
};


export { }