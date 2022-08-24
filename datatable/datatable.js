import {
	ascending,
	descending,
	json,
	select,
} from 'd3'

class DataTable {
	constructor(parent) {
		parent.innerText = ''

		json(parent.dataset['url']).then((data) => {
			this.data = data
			this.columns = Object.keys(this.data[0])
			this.sortColumn = ''
			this.ascOrder = true
			this.createTable(parent)
		})
	}

	createTable(parent) {
		this.data.sort(this.sort(parent.dataset.sortCol || this.columns[0]))

		const table = select(parent).append('table')
		const thead = table.append('thead')
		const rows = table.append('tbody')
			.selectAll('tr')
			.data(this.data)
			.enter()
			.append('tr')

		this.columns.forEach((col) => { rows.append('td').text((d) => d[col]) })

		thead.append('tr')
			.selectAll('th')
			.data(this.columns)
			.enter()
			.append('th')
			.style('cursor', 'pointer')
			.text((d) => d)
			.on('click', (_, col) => { rows.sort(this.sort(col)) })
	}

	sort(col) {
		this.ascOrder = col === this.sortColumn ? !this.ascOrder : true
		this.sortColumn = col

		return (a, b) => this.ascOrder ? ascending(a[col], b[col]) : descending(a[col], b[col])
	}
}

document.querySelectorAll('.datatable').forEach((el) => new DataTable(el))
