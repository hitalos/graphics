import {
	max,
	min,
	scaleLinear,
	select,
} from 'd3'

const x = (d) => d.value
const y = (d) => d.title

class Circles {
	constructor(parent) {
		this.width = parent.getBoundingClientRect().width
		this.height = parent.getBoundingClientRect().height

		this.svg = select(parent).append('svg')
			.attr('width', this.width)
			.attr('height', this.height)

		this.getData(parent.dataset['url'])
	}

	getData(url) {
		fetch(url)
			.then((response) => response.json())
			.then((data) => {
				this.title = data.question
				this.data = data.options
				this.scaleX = scaleLinear()
					.domain([0, this.data.length - 1])
					.range([0, 360 - (360 / this.data.length)])
					.range([120, -120])

				this.colorScale = scaleLinear()
					.domain([min(this.data.map(x)), max(this.data.map(x))] )
					.range(['#ff0000', '#3333ff'])

				this.mount()
			})

		return this
	}

	mount() {
		const r = this.height / 9

		const g =this.svg.append('g')
			.attr('transform', `translate(${(this.width / 2)}, ${(this.height / 2)})`)
			.selectAll('g')
			.data(this.data)
			.enter()
			.append('g')
			.attr('transform', (_, i) => `translate(0, 0) rotate(${this.scaleX(i)} 0 0)`)
			.attr('opacity', .1)
			.style('cursor', 'pointer')
			.on('mouseover', (ev) => {
				select(ev.target).attr('opacity', 1)
			})
			.on('mouseout', (ev) => {
				select(ev.target).attr('opacity', .8)
			})

		g.transition()
			.duration(2000)
			.attr('transform', (_, i) => `translate(0, ${3.5 * r}) rotate(${this.scaleX(i)} 0 ${-3.5 * r})`)
			.attr('opacity', .8)

		g.append('circle')
			.attr('r', r)
			.attr('fill', (d) => this.colorScale(x(d)))
			.attr('stroke', 'black')
			.attr('stroke-width', 1)
			.attr('opacity', .8)

		g.append('text')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.attr('transform', (_, i) => `rotate(${-this.scaleX(i)})`)
			.style('user-select', 'none')
			.style('pointer-events', 'none')
			.style('font-size', `${this.height / 24}px`)
			.text(y)

		this.svg.append('circle')
			.attr('cx', this.width / 2)
			.attr('cy', this.height / 2)
			.attr('r', this.height / 6)
			.attr('fill', 'white')
			.attr('stroke', 'black')
			.attr('stroke-width', 1)

		this.svg.append('text')
			.attr('x', this.width / 2)
			.attr('y', this.height / 2)
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.style('font-size', `${this.height / 24}px`)
			.text(this.title)

		return this
	}
}

document.querySelectorAll('.circles')
	.forEach((el) => new Circles(el))
