/**
 * demo3.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2017, Codrops
 * http://www.codrops.com
 */
{
	class MorphingBG {
		constructor(el) {
			this.DOM = {};
			this.DOM.el = el;
			this.DOM.paths = Array.from(this.DOM.el.querySelectorAll('path'));
			this.animate();
		}
		animate() {
			this.DOM.paths.forEach((path) => {
				setTimeout(() => {
					anime({
						targets: path,
						duration: anime.random(3000,5000),
						easing: [0.5,0,0.5,1],
						d: path.getAttribute('pathdata:id'),
						loop: true,
						direction: 'alternate'
					});
				}, anime.random(0,1000));
			});
		}
	};

	new MorphingBG(document.querySelector('svg.scene'));
};