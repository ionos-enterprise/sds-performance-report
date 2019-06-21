class App {
	constructor () {
		this.elements = [];
		this.viewportSize = 1;
	}

	// Get the HTML of all options
	getOptionsHTML(parentObject = {}, previousHTML = '') {
		const childs = Util.hasChildern(parentObject);
		if (childs.length) {
			return childs.reduce((mergingHTML, element) => {
				const innerElementsHTML = this.getOptionsHTML(parentObject[element], previousHTML);
				return Templates.optionsCheckbox(mergingHTML, element, innerElementsHTML, parentObject[element]);
			}, previousHTML);
		}
		return '';
	}
	
	// Get the unique Tags from the JSON file 
	getTags(parentObject = {}) {
		const childs = Util.hasChildern(parentObject);
		if (childs.length) {
			return childs.reduce((total, element) => {
				total.push(this.getTags(parentObject[element]));
				return total;
			}, []);
		}
		return parentObject.map(element => element.tags);
	}
	
	// Generate the HTML for unique tags 
	getTagsHTML(parentObject = {}) {
		const tags = Util.uniqueArray(Util.flatArray(this.getTags(parentObject)));
		return tags.map(element => {
			return Templates.optionsTag(element);
		}).join('');
	}

	// Get the JSON data from the static file on the server
	getData() {
		return new Promise((resolve, reject) => {
			$.getJSON('/data/images.json', function(data) {
				resolve(data);
			})
		});
	}

	updateElements() {
		// Get all the selected checkboxes
		let allSelectedChecks = $('input:checked').toArray();
		allSelectedChecks = allSelectedChecks.map(e => {
			let data = JSON.parse($(e).attr('data'));
			data.pathArray = $(e).parents('li').toArray().map(e => $(e).find('> label').text().trim()).reverse();
			return data;
		});

		// Get the options from all the selected checkboxes
		let elements = allSelectedChecks.filter(e => e.type === 'option' && Array.isArray(e.value))

		// Get the tags from all the selected checkboxes
		let tags = allSelectedChecks.filter(e => e.type === 'tag')
		tags = tags.map(e => e.value);
		if (!tags.length) return;
		// Filter the elements based on the selected tags
		this.elements = elements.map(x => ({value: x.value.filter(y => tags.indexOf(y.tags[0]) !== -1), pathArray: x.pathArray}))

		// Render all the selected elements and tags
		this.renderElements();
	}

	renderElements() {
		const HTML = Templates.viewport(this.elements);
		$('.viewport').html(HTML);
	}

	bindEvents() {
		// Event Listener for all the checkboxes
		$('input[type="checkbox"]').click(e => {
			// Explore the currently selected checkbox 
			const {type, value} = JSON.parse($(e.target).attr('data'));

			// Select the child checkboxes
			if (!Array.isArray(value)) {
				$($(e.target).parents('li')[0]).find('input').prop('checked', $(e.target).prop('checked'));
			}
			
			// Select the parent checkboxes
			if ($(e.target).prop('checked')) {
				$(e.target).parents('li').each(function(i, e) { 
					$(e).find('> label > input').prop('checked', true)
				});
			}

			// Update the elements based on the current checkbox selection
			this.updateElements();
		});

		// Increase the size of Viewport
		$('.inc-viewport').click(e => {
			this.viewportSize += 0.2;
			$('.viewport').css('transform', `scale(${this.viewportSize})`);
		});

		// Decrease the size of Viewport
		$('.dec-viewport').click(e => {
			this.viewportSize -= 0.2;
			$('.viewport').css('transform', `scale(${this.viewportSize})`);
		});
	}

	unBindEvents() {

	}

	// Bootstrapper function
	static start() {
		const app = new App();
		app.getData().then(data => {
			const optionsHTML = app.getOptionsHTML(data);
			const tagsHTML = app.getTagsHTML(data);
		
			$('.options').html(optionsHTML);
			$('.tags').html(tagsHTML);

			app.bindEvents();
		});
	}
}


class Templates {
	static optionsTag(element = '') {
		return `<li>
					<label>
						<input type="checkbox" data='{"type": "tag", "value": "${element}"}' checked/>${element}
					</label>
				</li>`;
	}

	static optionsCheckbox(mergingHTML, element, innerElementsHTML, keys = []) {
		return `${mergingHTML}
				<ul>
					<li>
						<label>
							<input type="checkbox" data='{"type": "option", "value": ${JSON.stringify(keys)}}'/>${element}
						</label>
						${innerElementsHTML}
					</li>
				</ul>`;
	}

	static viewport(elements) {
		return elements.map(e => {
			return `<div class="elements">
						<div class="title">
							${e.pathArray.map(x => `<p>${x}</p>`).join('')}
						</div>
						${e.value.map(e => `
							<img src="/data/images/${e.url}" alt="..." />
						`).join('')}
					</div>`;
		}).join('')
	}
}



class Util {
	// Flatten the inner arrays 
	static flatArray(array) {
		return array.reduce((acc, val) => Array.isArray(val) ? acc.concat(Util.flatArray(val)) : acc.concat(val), []);
	}
	
	// Flatten the single inner level and remove the duplicate elements from the array
	static uniqueArray(array) {
		return [...new Set([].concat(...array))];
	}

	// Check if the object has the inner objects
	static hasChildern(parentObject) {
		if (!Array.isArray(parentObject) && typeof parentObject === 'object') {
			return Object.keys(parentObject);
		}
		return false;
	}
	
	// Get the Inner object based on the path array
	static getInnerElement(parentObject, elementArr) {
		return elementArr.reduce((accessObj, element) =>
			(accessObj && accessObj[element] !== 'undefined') ? accessObj[element] : undefined, parentObject);
	}
}

$(document).ready(function() {
	App.start();
});