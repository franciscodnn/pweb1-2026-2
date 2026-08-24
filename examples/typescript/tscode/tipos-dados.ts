let numeros: Array<number> = [1, 5, 10];

console.log(typeof numeros);

console.log(`É array? ${Array.isArray(numeros)}`);

let PI: any = 3.1415;

console.log( PI.toFixed(2) );

PI = '3.14';

let raio: unknown = 5;

if(typeof raio === 'number')
    console.log( raio.toFixed(2) );

type Shape = 'circle' | 'square' | 'triangle' | 'rectangle';
const forma: Shape = 'rectangle';

console.log( getArea(forma) );

function getArea(shape: Shape): number {
  switch (shape) {
    case 'circle':
      return Math.PI * 2;
    case 'square':
      return 10 * 2;
    case 'triangle':
      return 10 * 5;
    case 'rectangle':
      return 10 * 50;
    default:
      // TypeScript knows this should never happen
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}