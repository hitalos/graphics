const states = [
	"Acre",
	"Alagoas",
	"Amapá",
	"Amazonas",
	"Bahia",
	"Ceará",
	"Distrito Federal",
	"Espírito Santo",
	"Goiás",
	"Maranhão",
	"Mato Grosso",
	"Mato Grosso do Sul",
	"Minas Gerais",
	"Pará",
	"Paraíba",
	"Paraná",
	"Pernambuco",
	"Piauí",
	"Rio de Janeiro",
	"Rio Grande do Norte",
	"Rio Grande do Sul",
	"Rondônia",
	"Roraima",
	"Santa Catarina",
	"São Paulo",
	"Sergipe",
	"Tocantins",
]

const statesList = document.getElementById('statesList')

states.forEach((uf) => {
	const li = document.createElement('li')
	const item = document.createElement('div')
	item.draggable = true
	item.innerText = uf
	li.appendChild(item)

	item.addEventListener('dragstart', dragStart)
	item.addEventListener('dragenter', dragEnter)
	item.addEventListener('dragleave', dragLeave)
	item.addEventListener('dragover', dragOver)
	item.addEventListener('drop', drop)

	statesList.append(li)
})

let startItem

function dragStart() {
	startItem = this
}

function dragEnter() {
	this.classList.add('over')
}

function dragLeave() {
	this.classList.remove('over')
}

function dragOver(ev) {
	ev.preventDefault()
}

function drop() {
	this.classList.remove('over')
	swapItems(this, startItem)
}

function swapItems(from, to) {
	const fromContainer = from.parentNode
	const toContainer = to.parentNode

	fromContainer.appendChild(to)
	toContainer.appendChild(from)
}

