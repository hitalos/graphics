import {
	color,
	format,
	geoAzimuthalEquidistant,
	geoConicConformal,
	geoConicEqualArea,
	geoEquirectangular,
	geoMercator,
	geoPath,
	json,
	scaleOrdinal,
	schemeSet3,
	select,
} from 'd3'

const [width, height] = [960, 640]
const svg = select('#graph').append('svg')
	.attr('width', width).attr('height', height)
	.attr('viewBox', `0 -130 ${width} ${height}`)
const g = svg.append('g')
const colorScale = scaleOrdinal(schemeSet3)
const formatPop = (str) => format(',')(str).replace(/,/g, '.')

const projections = {
	A: geoAzimuthalEquidistant().translate([width / 2, height / 2]),
	C: geoConicConformal().translate([width / 2, height / 2]),
	CEA: geoConicEqualArea().translate([width / 2, height / 2]),
	E: geoEquirectangular().translate([width / 2, height / 2]),
	M: geoMercator().translate([width / 2, height / 2]),
}

const render = (data, path) => {
	g.selectAll('path').data(data).enter().append('path').attr('d', path)
		.attr('fill', (_, i) => color(colorScale(i)))
		.append('title')
		.text((d) => `Country: ${d.properties.name}\nPopulation: ${formatPop(d.properties.pop_est)}`)
	g.selectAll('path').transition().duration(2000).attr('d', path)
}

json('world.geo.json').then(({ features }) => {
	render(features, geoPath(projections.M))
	const pSelector = document.getElementById('projections')
	pSelector.addEventListener('change', () => {
		render(features, geoPath(projections[pSelector.value]))
	})
})
