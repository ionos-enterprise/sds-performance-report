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

	getFiles() {
		return new Promise((resolve, reject) => {
			$.getJSON('data/files.json', function(data) {
				resolve(data);
			})
		});
	}

	// Get the JSON data from the static file on the server
	getData(name) {
		return new Promise((resolve, reject) => {
			$.getJSON(`data/${name}`, function(data) {
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

	static checkDictionary(key) {
		if (window.dictionary[key]) {
			return window.dictionary[key];
		}
		return key;
	}

	updateMeasurment({file, title, details, preSelected, dictionary}) {
		this.getData(file).then(data => {
			const optionsHTML = this.getOptionsHTML(data);
			const tagsHTML = this.getTagsHTML(data);
		
			$('.options').html(optionsHTML);
			$('.tags').html(tagsHTML);
			$('.viewport').html('');

			window.details = details;
			window.preSelects = preSelected;
			window.dictionary = dictionary;

			this.unBindEvents()
			this.bindEvents();
			$(".box-details").slideUp();
		});
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
		$('.btn-inc-viewport').click(e => {
			if (this.viewportSize < 5) {
				this.viewportSize += 0.2;
				$('.viewport').css('transform', `scale(${this.viewportSize})`);
				$('.zoom-result').html(`${Math.round(this.viewportSize * 100)}%`);
			}			
		});

		// Decrease the size of Viewport
		$('.btn-dec-viewport').click(e => {
			if (this.viewportSize > 0.3) {
				this.viewportSize -= 0.2;
				$('.viewport').css('transform', `scale(${this.viewportSize})`);
				$('.zoom-result').html(`${Math.round(this.viewportSize * 100)}%`);
			}
		});
		
		// Print the Viewport if there is at least one chart
		$('.btn-print').click(e => {
			if ($(".viewport").html().trim()) {
				window.print();
			}
		});

		$('.measurements').change(e => {
			this.updateMeasurment(JSON.parse($('.measurements').val()));
		})

		$('.btn-sidebar').click(e => {
			if ($("aside").css('display').trim() === 'none') {
				$("aside").slideDown();
				$('.btn-sidebar').html('Hide Sidebar');
			} else {
				$("aside").slideUp();
				$('.btn-sidebar').html('Show Sidebar');
			}
		});

		$('.btn-details').click(e => {
			if ($(".box-details").css('display').trim() === 'none') {
				$('.box-details').html(window.details);
				$(".box-details").slideDown();
				$('.btn-details').html('Hide Details');
			} else {
				$(".box-details").slideUp();
				$('.btn-details').html('Show Details');
			}
		});
		
		window.preSelects.forEach(e => {
			this.preSelectFilters($('aside'), e); //['40 CPUs Intel(R) Xeon(R) Silver 4114', 'Dual Path', 'Multiple Disks']
		});
	}

	preSelectFilters (parent, arr) {
		if (!arr.length) return;
		if (arr.length === 1) {
			console.log($(parent).find(`label:contains('${arr[0]}')`).find('> input'))
			$(parent).find(`label:contains('${arr[0]}')`).find('> input').click();
		} else {
			return this.preSelectFilters($(parent).find(`label:contains('${arr.shift()}')`).parents('li')[0], arr)
		}
	}

	unBindEvents() {
		$('input[type="checkbox"]').unbind();
		$('.btn-inc-viewport').unbind();
		$('.btn-dec-viewport').unbind();
		$('.btn-print').unbind();
		$('.measurements').unbind();
		$('.btn-sidebar').unbind();
		$('.btn-details').unbind();
	}

	// Bootstrapper function
	static start() {
		const app = new App();
		app.getFiles().then(data => {
			const {files = []} = data;
			$('.measurements').html(files.map(e => Templates.measurment(e)).join(''));
			app.updateMeasurment(files[0]);
		})
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

	static optionsCheckbox(mergingHTML, title, innerElementsHTML, element = {}) {
		return `${mergingHTML}
				<ul>
					<li>
						<label>
							<input type="checkbox" data='{"type": "option", "value": ${JSON.stringify(element)}}'/>${title}
						</label>
						${innerElementsHTML}
					</li>
				</ul>`;
	}

	static viewport(elements) {
		return elements.map(e => {
			return `<div class="elements">
						<div class="title">
							${e.pathArray.map(x => `<p>${App.checkDictionary(x)}</p>`).join('')}
						</div>
						${e.value.map(e => `
							<img src="data/images/${e.url}" alt="..." />
						`).join('')}
					</div>`;
		}).join('')
	}

	static measurment(element) {
		return `<option value='${JSON.stringify(element)}'>${element.title}</option>`;
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
