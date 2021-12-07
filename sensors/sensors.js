import {
	axisRight,
	json,
	max,
	path,
	scaleLinear,
	select,
} from 'd3'

const updateIntervalMs = 2000
const historyLimit = 180
const margins = { top: 60, left: 20, bottom: 40, right: 80 }

class Sensor {
	constructor(el) {
		this.data = []
		this.historyLimit = +el.dataset.historyLimit || historyLimit
		this.interval = +el.dataset.interval * 1000 || updateIntervalMs
		this.field = el.dataset.field
		this.minLimit = +el.dataset.minLimit || 0
		this.suffix = el.dataset.suffix || ''

		this.createSVG(el)
		this.getData(el.dataset.url)
		setInterval(() => { this.getData(el.dataset.url) }, this.interval)
	}

	xValue = (d) => d.ts.valueOf()
	yValue = (d) => +d.data[this.field]
	x = (d) => this.scaleX(this.xValue(d))
	y = (d) => this.scaleY(this.yValue(d))

	createSVG(el) {
		this.width = el.dataset['width']
		this.height = el.dataset['height']
		this.maxValue = this.minLimit
		this.svg = select(el).append('svg')
			.attr('width', this.width)
			.attr('height', this.height)
			.attr('viewBox', `0 0 ${this.width} ${this.height}`)
			// .style('filter', 'drop-shadow(3px 3px 2px rgb(0 0 0 / .4))')

		this.innerWidth = this.width - margins.left - margins.right
		this.innerHeight = this.height - margins.top - margins.bottom

		this.setTitle(el.title)
			.setBorder()

		this.graph = this.svg.append('g')
			.attr('class','graph')
			.attr('transform', `translate(${margins.left}, ${margins.top})`)

		this.axisGroup = this.svg.append('g')
			.attr('class', 'axis')
			.attr('transform', `translate(${this.width - margins.right}, ${margins.top})`)
	}

	setTitle(title) {
		this.svg.append('text')
		.text(title)
		.attr('text-anchor', 'middle')
		.attr('x', this.width / 2)
		.attr('y', margins.top - 25)
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

	getData(url) {
		json(url, { headers: { Accept: 'application/json' }}).then((data) => {
			if (this.data.length >= this.historyLimit) this.data.splice(0, 1)
			const lastRecord = { ts: new Date(), data }
			this.data.push(lastRecord)
			this.scaleX = scaleLinear()
				.domain([this.xValue(lastRecord) - (this.historyLimit * this.interval), this.xValue(lastRecord)])
				.range([0, this.innerWidth])
			this.maxValue = Math.ceil(max(this.data.map(this.yValue)))
			this.scaleY = scaleLinear()
				.domain([this.minLimit, this.maxValue])
				.range([this.innerHeight, 0])
			this.setGraph()
				.setPoints()
				.setAxis()
		}).catch(console.error)
	}

	setGraph() {
		const graph = this.graph
			.selectAll('path')
			.data([this.data])

		const calcPath = () => (d) => {
			const curves = path()

			curves.moveTo(this.x(this.data[0]), this.y(this.data[0]))
			d.forEach((p) => curves.lineTo(this.x(p), this.y(p)))

			return curves.toString()
		}

		graph.transition().duration(500)
			.attr('d', calcPath())

		graph.enter()
			.append('path')
			.attr('fill', 'none')
			.attr('stroke', 'darkred')
			.attr('stroke-width', .7)
			.attr('d', calcPath())

		return this
	}

	setPoints() {
		const points = this.graph
			.selectAll('circle')
			.data(this.data, this.xValue)

		points.enter()
			.append('circle')
			.attr('fill', 'white')
			.attr('stroke', 'darkred')
			.attr('r', 2)
			.attr('cx', this.x)
			.attr('cy', this.y)

		points.transition().duration(500)
			.attr('cx', this.x)
			.attr('cy', this.y)

		points.exit().remove()

		return this
	}

	setAxis() {
		const axis = axisRight(this.scaleY)
			.tickSize(-this.innerWidth)
			.tickFormat((d) => `${d}${this.suffix}`)
		this.axisGroup.call(axis)

		return this
	}
}

document.querySelectorAll('.sensors')
	.forEach((el) => new Sensor(el))
