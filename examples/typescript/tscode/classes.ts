class Usuario {
    // public nome: string;
    // private password: string;
    // readonly id: number;

    // constructor(nome: string, pass: string, id: number) {
    //     this.nome = nome;
    //     this.password = pass;
    //     this.id = id;
    // }

    constructor(
        public nome: string,
        private password: string,
        readonly id: number
    ){ 

    };

    public saudar(): string {
        return `Olá, ${this.nome}. Seu id: ${ this.id }!`;
    }
}

const user: Usuario = new Usuario('Francisco', '123', 1);

console.log( user.saudar() );



class Calculadora {
    private resultado: number = 0;

    public constructor() { 

    }
    
    public somar(valor: number): void {
      this.resultado += valor;
    }
    
    subtrair(valor: number): void {
      this.resultado -= valor;
    }
    
    obterResultado(): number {
      return this.resultado;
    }
    
    // Método com parâmetros opcionais
    multiplicarOuDividir(valor: number, multiplicar: boolean = true): void {
      if (multiplicar) {
        this.resultado *= valor;
      } else {
        this.resultado /= valor;
      }
    }
}

const calc: Calculadora = new Calculadora();

class Pessoa {
    public nome: string;
    private email: string;
    private emailProf: string;

    constructor(nome: string, email: string, email2: string){
        this.nome = nome;
        this.email = email;
        this.emailProf = email2;
    }

    get emailProfissional() {
        return this.emailProf;
    }

    set emailProfissional(email: string) {
        this.emailProf = email;
    }

    get emailPessoal() {
        return this.email;
    }

    set emailPessoal(email: string) {
        this.email = email;
    }
}

const pessoa: Pessoa = new Pessoa('Francisco', 
                'f@gmail.com', 'd@gmail.com');

pessoa.emailProfissional = 'teste@gmail.com';
pessoa.emailPessoal = 'a@gmail.com';
console.log( pessoa.emailProfissional );

abstract class FormaGeometrica {
    
    constructor( protected tipo: string  ) {

    }

    abstract calcularArea(): number;

}

class Quadrado extends FormaGeometrica {
    constructor( tipo: string, private lado: number) {
        super(tipo);
        super.tipo = tipo.toUpperCase();
    }

    calcularArea(): number {
        return this.lado ** 2;
    }
}

const quadrado: Quadrado = new Quadrado('quadrado', 10);





