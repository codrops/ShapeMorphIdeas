/**
 * demo1.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2017, Codrops
 * http://www.codrops.com
 */
{
	const getRandomFloat = (min,max) => {
    	return Math.random() * (max - min) + min;
	};

	// From https://davidwalsh.name/javascript-debounce-function.
	const debounce = (func, wait, immediate) => {
		let timeout;
		return function() {
			let context = this;
			var args = arguments;
			let later = () => {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			let callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	const DOM = {};
	DOM.scene = document.querySelector('svg.scene');
	DOM.gElems = Array.from(DOM.scene.querySelectorAll('g > g'));

	class Bacteria {
		constructor(el) {
			this.DOM = {};
			this.DOM.el = el;
			this.DOM.path = this.DOM.el.querySelector('path');
			this.CONFIG = {
				// Random value from 5 to 30px.
				motionIncrement: [5,20]
			};
			this.init();
			this.initEvents();
		}
		init() {
			// Measures.
			this.getSizes();
			
			// Different shape/paths.
			this.paths = this.DOM.path.getAttribute('pathdata:id').split(';');

			// Current values for the transform.
			this.transform = {tx: 0, ty: 0, rz: 0, sx:0, sy:0};
			// Current step.
			this.step = 0;

			// The element will alternate its shape (initial path plus all the other ones defined in pathdata:id).
			this.paths.splice(this.paths.length, 0, this.DOM.path.getAttribute('d'));
			// The total number of possible shapes/paths.
			this.totalPaths = this.paths.length;
			
			// Set Origin.
			this.DOM.el.style.transformOrigin = '50% 50%';

			// Start the shape animatation (path morphing).
			this.changeShape();
			// Start the transforms animation.
			this.move();
		}
		initEvents() {
			window.addEventListener('resize', debounce(() => this.getSizes(), 10));
		}
		getSizes() {
			this.domrect = {
				scene: DOM.scene.getBoundingClientRect(),
				el: this.DOM.el.getBoundingClientRect()
			};
		}
		changeShape() {
			anime.remove(this.DOM.path);
			anime({
				targets: this.DOM.path,
				duration: anime.random(2000,8000), 
				easing: 'linear',
				d: this.paths,
				loop: true
			});
		}
		getTransform(prop) {
			let val;
			if ( prop === 'rz' ) {
				val = anime.random(-30,30);
			}
			else if (prop === 'sx' || prop === 'sy') {
				val = getRandomFloat(0.8,1.2);
			}
			else {
				const inc = anime.random(this.CONFIG.motionIncrement[0],this.CONFIG.motionIncrement[1]) * (anime.random(0,1) ? -1 : 1);

				const vSize = prop === 'tx' ? 'width' : 'height';
				const position = prop === 'tx' ? 'left' : 'top';

				val = this.transform[prop] + inc;
				// Out of viewport.
				if ( val > 0 && val > this.domrect.scene[vSize] - this.domrect.el[position] || val < 0 && Math.abs(val) > this.domrect.el[position] + this.domrect.el[vSize] ) {
					val -= 2*inc;
				}
			}

			return val;
		}
		move() {
			this.step++;
			this.transform.tx = this.getTransform('tx');
			this.transform.ty = this.getTransform('ty');
			this.transform.rz = this.getTransform('rz');
			this.transform.sx = this.getTransform('sx');
			this.transform.sy = this.getTransform('sy');
			
			let pos;
			if ( this.step % this.totalPaths === 0 ) {
				this.step = pos = 0;
			}
			else {
				pos = this.totalPaths - (this.totalPaths - this.step);
			}
			
			const delay = anime.random(0,1) ? 0 : anime.random(0, 1000);
			const duration = anime.random(4000,8000);
			const easing = 'easeInOutQuad';
			anime.remove(this.DOM.el);
			anime({
				targets: this.DOM.el,
				duration: duration,
				easing: easing,
				delay: delay,
				translateX: this.transform.tx,
				translateY: this.transform.ty,
				scaleX: this.transform.sx,
				scaleY: this.transform.sy,
				rotate: this.transform.rz,
				complete: () => this.move()
			});
		}
	};

	DOM.gElems.forEach(gElem => new Bacteria(gElem));

	DOM.scene.querySelector('g').addEventListener('mouseenter', () => document.body.classList.add('scene-hover'));
	DOM.scene.querySelector('g').addEventListener('mouseleave', () => document.body.classList.remove('scene-hover'));
};