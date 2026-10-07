// Gerenciador de tarefas de estudo
// Tarefa: { id, title, due (AAAA-MM-DD), level: 'low' | 'medium' | 'high', desc, status: 'todo' | 'doing' | 'done' }

const STORAGE_KEY = 'app_task_manager_tasks_v1'
const LEVELS = { low: 'Baixa', medium: 'Média', high: 'Alta' }

const dialog = document.getElementById('form-modal')
const form = document.getElementById('task-form')

// Data de hoje + n dias, no formato AAAA-MM-DD
function addDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

// Tarefas iniciais, usadas quando ainda não há nada salvo
const SEED = [
  { id: '1', title: 'Ler capítulo 3 de Algoritmos', due: addDays(2), level: 'high', desc: 'Priorizar exercícios 3.1-3.5', status: 'todo' },
  { id: '2', title: 'Resolver lista de TS', due: addDays(5), level: 'medium', desc: 'Atenção a generics', status: 'doing' },
  { id: '3', title: 'Revisão rápida: HTML/CSS', due: addDays(10), level: 'low', desc: '30 minutos', status: 'done' },
]

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? SEED

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  render()
}

// Cor do indicador conforme a proximidade da data de término
function dueColor(due) {
  const days = (new Date(due) - new Date()) / 86_400_000
  if (days < 0) return 'bg-gray-500'
  if (days <= 1) return 'bg-red-500'
  if (days <= 3) return 'bg-orange-400'
  if (days <= 7) return 'bg-yellow-300'
  return 'bg-green-400'
}

// Evita que o texto digitado pelo usuário seja interpretado como HTML
const escapeHtml = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

function cardHtml(t) {
  return `
    <div class="p-3 border rounded bg-white shadow-sm">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-3">
          <span class="size-3.5 rounded-full ${dueColor(t.due)}" title="Proximidade"></span>
          <div>
            <div class="font-semibold text-slate-800">${escapeHtml(t.title)}</div>
            <div class="text-xs text-slate-500">Término: ${t.due} • ${LEVELS[t.level]}</div>
          </div>
        </div>
        <button data-delete="${t.id}" class="text-xs text-red-500">Excluir</button>
      </div>
      <p class="mt-2 text-sm text-slate-600">${escapeHtml(t.desc)}</p>
    </div>`
}

// Desenha os cards de cada coluna de acordo com o status
function render() {
  document.querySelectorAll('[data-status]').forEach((col) => {
    col.innerHTML = tasks
      .filter((t) => t.status === col.dataset.status)
      .map(cardHtml)
      .join('')
  })
}

// Abrir e fechar o modal
document.getElementById('open-form-btn').addEventListener('click', () => dialog.showModal())
document.getElementById('close-form-btn').addEventListener('click', () => dialog.close())
dialog.addEventListener('close', () => form.reset())

// Adicionar: lê os campos pelo atributo name; o method="dialog" fecha o modal
form.addEventListener('submit', () => {
  const data = Object.fromEntries(new FormData(form))
  tasks.push({ id: String(Date.now()), ...data, status: 'todo' })
  save()
})

// Remover: um único listener para todos os botões "Excluir"
document.querySelector('main').addEventListener('click', (e) => {
  const id = e.target.dataset.delete
  if (!id) return
  tasks = tasks.filter((t) => t.id !== id)
  save()
})

render()
