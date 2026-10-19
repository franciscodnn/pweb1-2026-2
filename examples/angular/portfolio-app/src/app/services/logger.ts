// src/app/logger.ts
import { Service, isDevMode } from '@angular/core';

@Service({
  // decide qual objeto será o singleton
  factory: () => (isDevMode() ? new LoggerConsole() : new Logger()),
})
export class Logger {
  log(mensagem: string) {
    // não faz nada por padrão
  }
}

class LoggerConsole extends Logger {
  override log(mensagem: string) {
    console.log('[DEV]', mensagem);
  }
}