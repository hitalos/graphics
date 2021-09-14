import {
	select,
} from 'd3'


class Gauge {
	constructor(el) {
		if (el.title === '') el.title = el.innerText
		el.innerText = ''
		this.value = el.dataset['value']
		this.id = Math.random().toString(36).substr(2)
		this.startColor = el.dataset['startColor'] ? el.dataset['startColor'] : '#05a'
		this.endColor = el.dataset['endColor'] ? el.dataset['endColor'] : '#0a5'

		this.svg = select(el)
			.append('svg')
			.attr('width', '220')
			.attr('height', '220')
			.attr('viewBox', '-120 -120 240 240')
			.style('filter', 'drop-shadow(5px 5px 5px rgb(0 0 0 / .4))')

		this.defText().defCircle().defGradient()

		return this
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

	defCircle() {
		this.svg
			.append('circle')
			.attr('cy', 0)
			.attr('cx', 0)
			.attr('r', 100)
			.attr('fill', 'none')
			.attr('stroke-width', 40)
			.attr('stroke', `url(#linearGradient_${this.id})`)
			.attr('stroke-linecap', 'round')
			.attr('stroke-dashoffset', `${50*Math.PI}`)
			.attr('stroke-dasharray', `1 ${(100 * 2 * Math.PI)}`)
			.transition().duration(500)
			.attr('stroke-dasharray', `${this.value * 2 * Math.PI} ${((100 - this.value) * 2 * Math.PI)}`)

		return this
	}

	defText() {
		this.svg
			.append('text')
			.text(`${this.value}%`)
			.attr('x', 0)
			.attr('y', 0)
			.attr('text-anchor', 'middle')
			.attr('fill', 'darkgray')
			.attr('dy', '.3em')
			.style('font-size', '3em')
			.style('user-select', 'none')

		return this
	}
}

document.querySelectorAll('.gauge')
	.forEach((el) => new Gauge(el))
