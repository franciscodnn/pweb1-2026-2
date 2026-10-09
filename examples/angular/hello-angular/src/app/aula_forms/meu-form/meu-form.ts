// src/app/exemplos/usuario-inicial/usuario-inicial.ts
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form, FormField, required, email } from '@angular/forms/signals';

interface UsuarioData {
  nome: string;
  email: string;
  idade: number;
  telefone: string;              // opcional: vazio = ''
  dataNascimento: Date | null;   // opcional: vazio = null
}

@Component({
  selector: 'app-meu-form',
  imports: [FormField, JsonPipe],
  template: `
    <div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
      <input [formField]="usuarioForm.nome" placeholder="Nome" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      
      <input type="email" [formField]="usuarioForm.email" placeholder="E-mail"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      
             <input type="number" [formField]="usuarioForm.idade" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <input type="tel" [formField]="usuarioForm.telefone" placeholder="Telefone (opcional)"
             class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <input type="date" [formField]="usuarioForm.dataNascimento" class="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      <pre class="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-green-300">{{ usuarioModel() | json }}</pre>
      
      @if(usuarioForm.nome().touched()
        && usuarioForm.nome().invalid()) {
        <p>Erro: Nome exigido!</p>
      }

      @if(usuarioForm.email().touched()
        && usuarioForm.email().invalid()) {
        <p>Erro: {{ usuarioForm.email().errors()[0].message }}</p>
      }
      </div>
    
  `,
})
export class MeuForm {
  // ✅ Correto: todos os campos inicializados
  usuarioModel = signal<UsuarioData>({
    nome: '',
    email: '',
    idade: 0,
    telefone: '',
    dataNascimento: null,
  });

  // ❌ Evite: signal({ nome: '', email: '' }) não teria usuarioForm.idade
  usuarioForm = form(this.usuarioModel, (p) => {
    required(p.nome, { message : 'Nome é obrigatório!' } ),
    email(p.email, { message : 'E-mail inválido! ' })
  });
}