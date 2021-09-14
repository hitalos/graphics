import {
	axisLeft,
	select,
	json,
	scaleBand,
	scaleLinear,
	max,
	path
} from 'd3'

(() => {
	const sortByConfirmed = document.getElementById('sortByConfirmed')
	const sortByDeaths = document.getElementById('sortByDeaths')

	const margins = { top: 60, left: 40, bottom: 40, right: 20 }

	const cValues = (d) => parseInt(d.confirmed, 10)
	const dValues = (d) => parseInt(d.deaths, 10)
	const yValues = (d) => sortByConfirmed.checked ? cValues(d) : dValues(d)
	const xValues = (d) => d.state
	const updateValues = (d) => (new Date(...d.date.split('-'))).toLocaleDateString()

	class Area {
		constructor(parent) {
			parent.innerText = ''

			this.startColor = parent.dataset['startColor'] ? parent.dataset['startColor'] : '#05a'
			this.endColor = parent.dataset['endColor'] ? parent.dataset['endColor'] : '#0a5'
			this.id = Math.random().toString(36).substr(2)

			this.createSVG(parent)
			this.defGradient()
			this.getDataAndMount(parent.dataset['url'])

			sortByConfirmed.addEventListener('change', () => {
				this.startColor = parent.dataset['startColor'] ? parent.dataset['startColor'] : '#05a'
				this.endColor = parent.dataset['endColor'] ? parent.dataset['endColor'] : '#0a5'
				this.svg.select('defs').remove()
				this.defGradient()
				this.getDataAndMount(parent.dataset['url'])
			})
			sortByDeaths.addEventListener('change', () => {
				this.startColor = '#000'
				this.endColor = '#555'
				this.svg.select('defs').remove()
				this.defGradient()
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

			this.svg.append('g')
				.attr('class', 'labels')
				.attr('transform', `translate(${margins.left}, ${this.innerHeight + margins.top + 16})`)

			this.svg.append('g')
				.attr('class','axis')
				.attr('transform', `translate(${margins.left}, ${margins.top})`)
				.style('stroke-width', .7)
				.style('stroke-dasharray', '1 2')

			this.svg.append('g')
				.attr('class', 'area')
				.attr('transform', `translate(${margins.left}, ${margins.top})`)

			this.svg.append('g')
				.attr('class', 'points')
				.attr('transform', `translate(${margins.left}, ${margins.top})`)
		}

		defGradient() {
			const gradient = this.svg
				.append('defs')
				.append('linearGradient')
				.attr('id', `linearGradient_${this.id}`)
				.attr('x1', '0%')
				.attr('y1', '0%')
				.attr('x2', '100%')
				.attr('y2', '100%')
			gradient.append('stop')
				.attr('offset', '0%')
				.attr('stop-color', this.startColor)
			gradient.append('stop')
				.attr('offset', '100%')
				.attr('stop-color', this.endColor)

			return this
		}

		getDataAndMount(url) {
			json(url).then((data) => {
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

				this.setArea()
					.setLabels()
					.setAxis()
					.setPoints()
			})
		}

		setTitle(title) {
			this.svg.append('text')
			.text(title)
			.attr('text-anchor', 'middle')
			.attr('x', this.width / 2)
			.attr('y', margins.top - 20)
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

		setArea() {
			const step = this.scaleX.step()
			const calcPath = (isInitial) => (d) => {
				const graph = path()

				graph.moveTo(0, this.scaleY(0))
				d.forEach((p, i) => graph.lineTo((i * step) + (step / 2), this.scaleY(isInitial ? 0 : yValues(p))))
				graph.lineTo((this.data.length * step) - (step / 2), this.scaleY(0))
				graph.closePath()

				return graph.toString()
			}

			const area = this.svg.selectAll('g.area')
				.selectAll('path')
				.data([this.data])

			area.transition().duration(500)
				.attr('d', calcPath(false))

			area.enter()
				.append('path')
				.style('fill', `url(#linearGradient_${this.id})`)
				.attr('d', calcPath(true))
				.transition().duration(500)
				.attr('d', calcPath(false))

			return this
		}

		setLabels() {
			const labels = this.svg
				.select('g.labels')
				.selectAll('text')
				.data(this.data)

			labels.enter()
				.append('text')
				.text((d) => xValues(d))
				.style('font-size', '.7em')
				.style('cursor', 'help')
				.attr('text-anchor', 'middle')
				.attr('x', (_, i) => (i * this.scaleX.step()) + this.scaleX.step() / 2)
				.append('title')
				.text((d) => `Estado: ${xValues(d)}\nCasos confirmados: ${cValues(d).toLocaleString()}\nMortes: ${dValues(d).toLocaleString()}\nÚltima atualização: ${updateValues(d)}`)

			return this
		}

		setAxis() {
			const axis = axisLeft(this.scaleY)
				.ticks(10, 's')
				.tickSize(-this.innerWidth)

			this.svg.select('g.axis').call(axis)

			return this
		}

		setPoints() {
			const gPoints = this.svg.selectAll('g.points')
				.selectAll('circle')
				.data(this.data)

			const gEnter = gPoints.enter()
				.append('circle')
				.on('mouseover', (ev) => select(ev.target).transition().attr('r', 6).attr('stroke-width', 2))
				.on('mouseout', (ev) => select(ev.target).transition().attr('r', 4).attr('stroke-width', 1))
				.style('fill', 'white')
				.style('stroke', 'navy')
				.style('cursor', 'help')
				.attr('cx', (_, i) => (i * this.scaleX.step()) + this.scaleX.step() / 2)
				.attr('cy', (d) => this.scaleY(0))
				.attr('r', 0)

			gEnter.append('title')
				.text((d) => `Estado: ${xValues(d)}\nCasos confirmados: ${cValues(d).toLocaleString()}\nMortes: ${dValues(d).toLocaleString()}\nÚltima atualização: ${updateValues(d)}`)

			gEnter.transition().duration(500)
				.attr('r', 4)
				.attr('cy', (d) => this.scaleY(yValues(d)))

			gPoints.transition().duration(500)
				.attr('r', 4)
				.attr('cy', (d) => this.scaleY(yValues(d)))
		}
	}

	document.querySelectorAll('.area')
		.forEach((el) => new Area(el))
})()
