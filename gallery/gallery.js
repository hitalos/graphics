const galleries = document.querySelectorAll('.gallery')
const modal = document.createElement('div')

modal.classList.add('modal')
document.querySelector('body').appendChild(modal)

const zoomOut = () => {
	modal.querySelector('img').classList.remove('zoomed')
	setTimeout(() => modal.classList.remove('opened'), 300)
}

modal.addEventListener('click', zoomOut)

const zoomIn = (ev) => {
	modal.innerHTML = ''
	modal.classList.add('opened')
	const img = ev.target.cloneNode(true)
	modal.appendChild(img)
	setTimeout(() => img.classList.add('zoomed'), 300)
	img.addEventListener('click', zoomOut)
}

galleries.forEach((gal) => gal.querySelectorAll('img').forEach((img) => img.addEventListener('click', zoomIn)))
