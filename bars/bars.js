import {
	csv,
	max,
	select,
	scaleBand,
	scaleLinear,
} from 'd3'

(() => {
	const sortByConfirmed = document.getElementById('sortByConfirmed')
	const sortByDeaths = document.getElementById('sortByDeaths')

	const margins = { top: 50, left: 10, bottom: 30, right: 10 }

	const cValues = (d) => parseInt(d.confirmed, 10)
	const dValues = (d) => parseInt(d.deaths, 10)
	const yValues = (d) => sortByConfirmed.checked ? cValues(d) : dValues(d)
	const xValues = (d) => d.state
	const updateValues = (d) => (new Date(...d.date.split('-'))).toLocaleDateString()

	class Bars {
		constructor(parent) {
			parent.innerText = ''

			this.createSVG(parent)
			this.getDataAndMount(parent.dataset['url'])

			sortByConfirmed.addEventListener('change', () => {
				this.getDataAndMount(parent.dataset['url'])
			})
			sortByDeaths.addEventListener('change', () => {
				this.getDataAndMount(parent.dataset['url'])
			})
		}

		createSVG(parent) {
			this.width = parent.dataset['width']
			this.height = parent.dataset['height']
			this.svg = select(parent)
				.append('svg')
				.attr('width', this.width)
				.attr('height', this.height)
				.attr('viewBox', `0 0 ${this.width} ${this.height}`)
				.style('filter', 'drop-shadow(3px 3px 2px rgb(0 0 0 / .4))')

			this.innerWidth = this.width - margins.left - margins.right
			this.innerHeight = this.height - margins.top - margins.bottom

			this.setTitle(parent.title)
			this.setBorder()

			this.gBars = this.svg.append('g')
				.attr('transform', `translate(${margins.left}, ${margins.top})`)
				.attr('class', 'bars')

			this.gLabels = this.svg.append('g')
				.attr('transform', `translate(${margins.left}, ${this.innerHeight + margins.top + 16})`)
				.attr('class', 'labels')
		}

		getDataAndMount(url) {
			csv(url).then((data) => {
				this.data = data
				this.data.sort((a, b) => yValues(a) - yValues(b))

				this.scaleX = scaleBand()
					.domain(this.data.map(xValues))
					.range([0, this.innerWidth])
					.padding(0.1)

				this.scaleY = scaleLinear()
					.domain([max(this.data.map(yValues)), 0])
					.range([0, this.innerHeight])

				this.scaleColor = scaleLinear()
					.domain([0, this.data.length])
					.range(['#597', '#3333aa'])

				this.setBars()
					.setLabels()
			})
		}

		setTitle(title) {
			this.svg.append('text')
			.text(title)
			.attr('text-anchor', 'middle')
			.attr('x', this.width / 2)
			.attr('y', margins.top)
			.style('font-size', '2em')

			return this
		}

		setBorder() {
			this.svg.append('rect')
				.attr('stroke', 'black')
				.attr('fill', 'none')
				.attr('width', this.width)
				.attr('height', this.height)

			return this
		}

		setBars() {
			const bars = this.gBars.selectAll('rect').data(this.data, yValues)

			bars.enter()
				.append('rect')
				.on('mouseover', (ev) => select(ev.target).style('stroke', 'black'))
				.on('mouseout', (ev) => select(ev.target).style('stroke', 'none'))
				.style('fill', (_, i) => this.scaleColor(i))
				.attr('x', (_, i) => i * this.scaleX.step())
				.attr('width', this.scaleX.bandwidth())
				.attr('y', this.innerHeight)
				.attr('height', 0)
				.transition().duration(500)
				.attr('y', (d) => this.scaleY(yValues(d)))
				.attr('height', (d) => this.innerHeight - this.scaleY(yValues(d)))

			bars.enter()
				.append('title')
				.text((d) => `Estado: ${xValues(d)}\nCasos confirmados: ${cValues(d).toLocaleString()}\nMortes: ${dValues(d).toLocaleString()}\nÚltima atualização: ${updateValues(d)}`)

			bars.style('fill', sortByDeaths.checked ? 'black' : (_, i) => this.scaleColor(i))
				.attr('y', this.innerHeight)
				.attr('height', 0)
				.transition().duration(500)
				.attr('y', (d) => this.scaleY(yValues(d)))
				.attr('height', (d) => this.innerHeight - this.scaleY(yValues(d)))

			bars.append('title')
				.text((d) => `Estado: ${xValues(d)}\nCasos confirmados: ${cValues(d).toLocaleString()}\nMortes: ${dValues(d).toLocaleString()}\nÚltima atualização: ${updateValues(d)}`)

			return this
		}

		setLabels() {
			const labels = this.gLabels.selectAll('text').data(this.data)

			labels.enter()
				.append('text')
				.text((d) => xValues(d))
				.style('font-size', '.7em')
				.style('cursor', 'help')
				.attr('text-anchor', 'middle')
				.attr('x', (_, i) => (i * this.scaleX.step()) + this.scaleX.step() / 2)

			return this
		}
	}

	document.querySelectorAll('.bars')
		.forEach((el) => new Bars(el))
})()
