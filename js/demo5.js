/**
 * demo5.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2017, Codrops
 * http://www.codrops.com
 */
{
	// equation of a line
	const lineEq = (y2, y1, x2, x1, currentVal) => {
		// y = mx + b
		const m = (y2 - y1) / (x2 - x1);
		const b = y1 - m * x1;

		return m * currentVal + b;
	}

	// from http://www.quirksmode.org/js/events_properties.html#position
	const getMousePos = (e) => {
		let posx = 0;
		let posy = 0;
		if (!e) {let e = window.event};
		if (e.pageX || e.pageY) 	{
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY) 	{
			posx = e.clientX + document.body.scrollLeft
				+ document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop
				+ document.documentElement.scrollTop;
		}
		return {
			x : posx,
			y : posy
		};
	};

	// From https://davidwalsh.name/javascript-debounce-function.
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	const ua = navigator.userAgent.toLowerCase();
	const isSafari = ua.indexOf('safari') != -1 && ua.indexOf('chrome') <= -1;

	let win = {width: window.innerWidth, height: window.innerHeight};

	class Blob {
		constructor(path, link, shape, content) {
			this.DOM = {};
			this.DOM.path = path;
			this.DOM.link = link;
			this.DOM.shape = shape;
			this.DOM.content = content;
			this.DOM.path.style.transformOrigin = this.DOM.link.style.transformOrigin = '50% 50%';
			this.DOM.path.style.transition = isSafari ? 'none' : 'transform 0.2s ease-out';
			this.transform = {tx: 0, ty: 0, rz: 0};
			this.paths = {
				reveal: this.DOM.path.getAttribute('pathdata:id'),
				unreveal: this.DOM.path.getAttribute('d')
			};
			this.tilt = true;
			this.initEvents();
		}
		initEvents() {
			// Mousemove event / Tilt functionality.
			const tilt = {
				tx: anime.random(5,40),
				ty: anime.random(20,60),
				rz: anime.random(-10,10)
			}
			const onMouseMoveFn = (ev) => {
				requestAnimationFrame(() => {
					if ( !this.tilt ) return false;
					const mousepos = getMousePos(ev);

					const rotZ = 2*tilt.rz/win.width*mousepos.x - tilt.rz;
					const transX = 2*tilt.tx/win.width*mousepos.x - tilt.tx;
					const transY = 2*tilt.ty/win.height*mousepos.y - tilt.ty;

					this.DOM.path.style.transform = `translateX(${transX}px) translateY(${transY}px) rotate(${rotZ}deg)`;

					this.transform = {tx: transX, ty: transY, rz: rotZ};
				});
			};
			document.addEventListener('mousemove', onMouseMoveFn);
		}
		reveal() {
			this.tilt = false;
			if ( this.isRevealed || this.isAnimating ) return false; 
			this.toggleLink();
			this.isRevealed = true;
			anime.remove(this.DOM.path);
			anime({
				targets: this.DOM.path,
				duration: 1000,
				easing: 'easeInOutQuint',
				d: this.paths.reveal,
				translateX: 0,
				translateY: 0,
				rotate: 0,
				begin: () => this.isAnimating = true,
				complete: () => {
					this.isAnimating = false;
				}
			});
			setTimeout(() => this.DOM.content.classList.add('content__inner--visible'), 600);
			this.transform = {tx: 0, ty: 0, rz: 0};
		}
		unreveal() {
			setTimeout(() => this.DOM.content.classList.remove('content__inner--visible'), 200);
			anime.remove(this.DOM.path);
			anime({
				targets: this.DOM.path,
				duration: 1000,
				easing: 'easeInOutQuint',
				d: this.paths.unreveal,
				begin: () => this.isAnimating = true,
				complete: () => {
					this.tilt = true;
					this.isRevealed = false;
					this.isAnimating = false;
				}
			});
			this.toggleLink(true, 550);
		}
		hide() {
			const duration = anime.random(300,600);
			const easing = 'easeInOutSine';

			anime.remove(this.DOM.path);
			anime({
				targets: this.DOM.path,
				duration: duration,
				easing: easing,
				translateX: this.transform.tx,
				translateY: this.transform.ty,
				scale: [1,0],
				rotate: this.transform.rz
			});

			anime.remove(this.DOM.shape);
			anime({
				targets: this.DOM.shape,
				duration: duration,
				easing: easing,
				opacity: [1,0]
			});

			this.toggleLink();
		}
		show() {
			this.tilt = false;
			const duration = anime.random(300,600);
			const easing = 'easeOutQuint';
			const delay = 500;

			anime.remove(this.DOM.shape);
			anime({
				targets: this.DOM.path,
				duration: duration,
				delay: delay,
				easing: easing,
				translateX: this.transform.tx,
				translateY: this.transform.ty,
				scale: [0,1],
				rotate: this.transform.rz,
				complete: () => {
					this.tilt = true;
				}
			});

			anime.remove(this.DOM.shape);
			anime({
				targets: this.DOM.shape,
				duration: duration,
				delay: delay,
				easing: easing,
				opacity: 1
			});

			this.toggleLink(true, 550);
		}
		toggleLink(isVisible = false, delay = 0) {
			setTimeout(() => {
				anime.remove(this.DOM.link);
				anime({
					targets: this.DOM.link,
					duration: isVisible ? 700 : 1200,
					easing: 'easeOutQuint',
					opacity: isVisible ? [0,1] : [1,0],
					translateX: isVisible ? (t,i) => {
						return [anime.random(-50,50),0];
					} : (t,i) => {
						return [0,anime.random(-20,20)];
					} 
				});
			}, delay);
		}
	};

	class MorphingBG {
		constructor() {
			this.DOM = {};
			this.DOM.scene = document.querySelector('svg.scene');
			this.DOM.links = Array.from(this.DOM.scene.querySelectorAll('a.label'));
			this.DOM.shapes = Array.from(this.DOM.scene.querySelectorAll('g.shape'));
			this.DOM.contents = Array.from(document.querySelectorAll('.content > .content__inner'));
			this.DOM.closeCtrl = document.querySelector('.content__close');
			
			this.blobs = [];
			Array.from(this.DOM.scene.querySelectorAll('clipPath > path')).forEach((path, pos) => this.blobs.push(new Blob(path, this.DOM.links[pos], this.DOM.shapes[pos], this.DOM.contents[pos])));
			
			this.initEvents();
		}
		initEvents() {
			const onResizeFn = debounce(() => win = {width: window.innerWidth, height: window.innerHeight}, 20);
			window.addEventListener('resize', ev => onResizeFn());

			const onRevealFn = (ev, pos) => {
				ev.preventDefault();
				
				this.current = pos;
				const currentBlob = this.blobs[this.current];
				if ( currentBlob.isAnimating ) return;
				currentBlob.reveal();

				this.blobs.filter(el => el != currentBlob).forEach(blob => blob.hide());
			};
			this.DOM.links.forEach((link,pos) => {
				link.addEventListener('click', (ev) => onRevealFn(ev,pos));
				link.addEventListener('touchstart', (ev) => onRevealFn(ev,pos));
			});

			const onUnrevealFn = (ev) => {
				ev.preventDefault();

				const currentBlob = this.blobs[this.current];
				if ( currentBlob.isAnimating ) return;
				currentBlob.unreveal();

				this.blobs.filter(el => el != currentBlob).forEach(blob => blob.show());
			};
			this.DOM.closeCtrl.addEventListener('click', onUnrevealFn);
			this.DOM.closeCtrl.addEventListener('touchstart', onUnrevealFn);
		}
	};

	new MorphingBG();
};