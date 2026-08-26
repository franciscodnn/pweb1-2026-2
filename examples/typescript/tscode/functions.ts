function soma(a: number, b: number): number {
    return a + b;
}

const resultado: number = soma(5, 10);

// ----
type OperacaoMatematica = (x: number, y: number) => number;

const somar: OperacaoMatematica = (x: number, y: number) => x + y;

somar(5, 10);

function criarItem(nome: string, quantidade = 1): void {
    console.log(`${quantidade} ${nome}(s) criado(s)`);
}
console.log(criarItem('Feijão', 5));

function somarTodos(...numeros: number[]): number {
    return numeros.reduce((total, n) => total + n, 0);
}

console.log( somarTodos(5, 10, 15, 20) );

//----
function criarUsuario(nome: string, idade: number) { /* ... */ }

type ParamsCriarUsuario = Parameters<typeof criarUsuario>;

const user: ParamsCriarUsuario = ["Francisco", 40];

// -----
function buscarUsuario(): { id: number, nome: string} { 
    return { id: 1, nome: "João" };
}

type Usuario = ReturnType<typeof buscarUsuario>;

// const usuarioBuscado: { id: number, nome: string} = 
const usuarioBuscado: Usuario = 
   buscarUsuario();
  

// { id: number, nome: string }

// ------
interface FuncaoFormatadora {
    (valor: string): string;
    formato: string;
}

const formatarMaiusculo: FuncaoFormatadora = (s: string) => s.toUpperCase();
formatarMaiusculo.formato = "MAIÚSCULO";

const formatarMinusculo: FuncaoFormatadora = (s: string) => s.toLowerCase();
formatarMinusculo.formato = "MINÚSCULO";

console.log( formatarMinusculo("TEXTO em minusculo") );