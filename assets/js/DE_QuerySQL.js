
var DE_QuerySQL = {

	events: [],

	dom: {
		element : null,
		inputs  : {},
		buttons : {},
		sections: {}
	},

	query: null,

	initial_values: null,


	initialize: function () {

		this.build(this.dom);
		this.setup(this.dom);

		this.reset();
	},


	build: function (dom) {

		dom.element = $('.de-query-sql')

		dom.element.$$('textarea').forEach(function (el) {
			dom.inputs[el.name] = el;
		});

		dom.element.$$('button').forEach(function (el) {
			dom.buttons[el.name] = el;
		});

		dom.sections.pre  = dom.element.$('pre.textarea');
		dom.sections.code = dom.element.$('pre.textarea code');

		this.initial_values = this.getData();
	},


	setup: function (dom) {

		dom.inputs.sql.$addEvent('change', this.updateElements.bind(this));
		dom.inputs.sql.$addEvent('input', this.highlightSQL.bind(this));

		dom.element.$addEvent('submit', this.submit.bind(this));
	},


	reset: function () {

		this.dom.buttons.load.disabled = true;

		this.setData(this.initial_values);
	},


	submit: function (event) {
		if (event) {
			event.preventDefault();
		}

		var query = this.getQuery();

		if (query) {
			this.$fireEvent('submit', query);
		}
	},


	getData: function () {

		var data = {}, inputs = this.dom.inputs, k;

		for (k in inputs) {
			data[k] = inputs[k].value;
		}

		return data;
	},


	setData: function (data) {

		var inputs = this.dom.inputs, k;

		for (k in data) {
			if (k in inputs) {
				inputs[k].value = data[k];
			}

			if (k == 'sql') {
				this.highlightSQL();
			}
		}
	},


	updateElements: function () {

		var data = this.getData();

		this.dom.buttons.load.disabled = !data.sql;
	},


	highlightSQL: function () {
		var input    = this.dom.inputs.sql;
		var sections = this.dom.sections;

		input.setAttribute('rows', Math.max(input.value.split(/\n/).length, 2));

		sections.code.innerHTML = Prism.highlight(input.value, Prism.languages.sql, 'sql');
		sections.pre.style.width = input.offsetWidth + 'px';
		sections.pre.style.height = input.offsetHeight + 'px';
	},


	// -------------------------------------------------------------------------


	getQuery: function () {

		var data = this.getData();
		var sql = data.sql.trim();

		if (!data.sql) {
			return false;
		}

		return {
			sql       : sql,
			binds     : [],
			pagination: false
		}
	},


	// -------------------------------------------------------------------------


	loadFromUrl: function (data) {
		this.setData(data);
		this.updateElements();
	}

};


Object.assign(DE_QuerySQL, $EventManager);
