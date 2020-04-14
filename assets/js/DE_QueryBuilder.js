
var DE_QueryBuilder = {

	events: [],

	dom: {
		element : null,
		inputs  : {},
		buttons : {}
	},

	query: null,

	initial_values: null,


	initialize: function () {

		this.build(this.dom);
		this.setup(this.dom);

		this.reset();

		this.fillComboWithTables();
	},


	build: function (dom) {

		dom.element = $('.de-query-builder')

		dom.element.$$('input,select').forEach(function (el) {
			dom.inputs[el.name] = el;
		});

		dom.element.$$('button').forEach(function (el) {
			dom.buttons[el.name] = el;
		});

		this.initial_values = this.getData();
	},


	setup: function (dom) {

		var inputs = dom.inputs, k;

		for (k in inputs) {
			inputs[k].$addEvent('change', this.updateElements.bind(this));
		}

		inputs.table.$addEvent('change', this.onPickTable.bind(this));

		dom.element.$addEvent('submit', this.submit.bind(this));
	},


	reset: function () {

		var inputs = this.dom.inputs;
		var data = Object.assign({}, this.initial_values);

		inputs.where_comparator.$dispose();
		inputs.where_value.$dispose();
		inputs.order_mode.$dispose();

		this.emptyCombo('where_column');
		this.emptyCombo('order_column');

		this.dom.buttons.load.disabled = true;

		delete data.table;

		this.setData(data);
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


	emptyCombo: function (k) {

		this.dom.inputs[k].$empty().$adopt(
			$E('option', {value: ''}).$text('<column>')
		);
	},


	getData: function () {

		var data = {}, inputs = this.dom.inputs, k;

		for (k in inputs) {
			data[k] = inputs[k].value;
		}

		data.limit = parseInt(data.limit) || 10;

		return data;
	},


	setData: function (data) {

		var inputs = this.dom.inputs, k;

		for (k in data) {
			if (k in inputs) {
				inputs[k].value = data[k];
			}
		}
	},


	onPickTable: function () {

		var table = this.dom.inputs.table.value;

		if (table) {
			this.fillComboWithColumns(table);
		}
	},


	fillComboWithTables: function () {

		var combo = this.dom.inputs.table, k;

		for (k in DE_JS_DATA.tables) {
			combo.$adopt(
				$E('option', {value: k}).$text(k)
			)
		}
	},


	fillComboWithColumns: function (table) {

		var inputs = this.dom.inputs;

		['where_column', 'order_column'].forEach(function (k) {
			this.emptyCombo(k);

			DE_JS_DATA.tables[table].forEach(function (c) {
				inputs[k].$adopt(
					$E('option', {value: c}).$text(c)
				);
			});
		}, this);
	},


	updateElements: function () {

		var data    = this.getData();
		var dom     = this.dom;
		var buttons = dom.buttons;
		var inputs  = dom.inputs, input, k;
		var visible;

		var map = {
			where_comparator: {
				depends_on: 'where_column',
				after: 'where_column'
			},
			where_value: {
				depends_on: 'where_column',
				after: 'where_comparator'
			},
			order_mode: {
				depends_on: 'order_column',
				after: 'order_column'
			},
		};

		var test = function (k) {
			if (!data.table || !data[map[k].depends_on]) {
				return false;
			}

			if (k === 'where_value' && /NULL/.test(data.where_comparator)) {
				return false;
			}

			return true;
		};

		for (k in map) {
			input   = inputs[k];
			visible = test(k);

			if (!map[k].after) {
				input[visible ? '$removeClass' : '$addClass']('hidden');
			} else if (!visible) {
				input.$dispose();
			} else if (!input.parentNode) {
				input.$inject(inputs[map[k].after], 'after');
			}
		}

		buttons.load.disabled = !data.table;
	},


	// -------------------------------------------------------------------------


	getQuery: function () {

		var data = this.getData(), k;

		if (!data.table) {
			return false;
		}

		// ------------

		var SELECT, WHERE, ORDER_BY, LIMIT;
		var binds = {};

		// ------------

		SELECT = 'SELECT * FROM `{table}`';

		if (data.where_column) {
			WHERE ='WHERE `{where_column}` {where_comparator}';

			if (!/NULL/.test(data.where_comparator)) {
				WHERE += ' :where_value';
				binds[':where_value'] = data.where_value;
			}
		}

		if (data.order_column) {
			ORDER_BY = 'ORDER BY `{order_column}` {order_mode}';
		}

		LIMIT = 'LIMIT {limit}';

		// ------------

		for (k in data) {
			if (/table/.test(k)) {
				SELECT = SELECT.replace('{' + k + '}', data[k]);

			} else if (/where/.test(k) && WHERE) {
				WHERE = WHERE.replace('{' + k + '}', data[k]);

			} else if (/order/.test(k) && ORDER_BY) {
				ORDER_BY = ORDER_BY.replace('{' + k + '}', data[k]);

			} else if (/limit/.test(k)) {
				LIMIT = LIMIT.replace('{' + k + '}', data[k]);
			}
		}

		// ------------

		var build = function (parts) {
			return parts.filter(function (v) { return !!v; }).join(' ');
		};

		var sql_page  = build([SELECT, WHERE, ORDER_BY, LIMIT]);
		var sql_all   = build([SELECT, WHERE, ORDER_BY]);
		var sql_count = build([SELECT.replace('*', 'COUNT(1)'), WHERE]);

		// ------------

		return {
			sql       : sql_page,
			sql_count : sql_count,
			sql_all   : sql_all,
			binds     : binds,
			limit     : data.limit,
			page      : 1,
			pagination: true
		}
	},


	// -------------------------------------------------------------------------


	loadFromUrl: function (data) {
		this.setData(data);

		if (data.table) {
			this.onPickTable();
			this.submit();
		}
	}

};


Object.assign(DE_QueryBuilder, $EventManager);
