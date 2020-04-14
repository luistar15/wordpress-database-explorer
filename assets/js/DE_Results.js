
var DE_Results = {

	events: [],

	dom: {
		element : null,
		inputs  : {},
		labels  : {},
		buttons : {},
		sections: {}
	},

	query  : null,
	results: null,

	initial_values: null,


	initialize: function () {

		this.build(this.dom);
		this.setup(this.dom);

		this.reset();
	},


	build: function (dom) {

		dom.element = $('.de-results')

		dom.element.$$('input,select').forEach(function (el) {
			dom.inputs[el.name] = el;
		});

		dom.element.$$('.de-label[data-name]').forEach(function (el) {
			dom.labels[el.getAttribute('data-name')] = el;
		});

		dom.element.$$('button').forEach(function (el) {
			dom.buttons[el.name] = el;
		});

		dom.sections.sql        = $('.de-results-sql');
		dom.sections.table      = $('.de-results-data table');
		dom.sections.ctrls      = $('.de-results-ctrls');

		dom.sections.limit      = $('.de-results-limit');
		dom.sections.pagination = $('.de-pagination');
		dom.sections.total      = $('.de-results-total');

		this.initial_values = this.getData();
	},


	setup: function (dom) {

		var inputs  = dom.inputs;
		var buttons = dom.buttons;

		inputs.rows_limit.$addEvent('input', this.displayData.bind(this));
		inputs.text_length.$addEvent('input', this.displayData.bind(this));

		inputs.page.$addEvent('keyup', this.onChangePage.bind(this));

		buttons.export.$addEvent('click', this.export.bind(this));

		buttons.prev.$addEvent('click', this.walkPage.bind(this, -1));
		buttons.next.$addEvent('click', this.walkPage.bind(this, 1));
	},


	submit: function () {

		this.$fireEvent('submit', this.query);
	},


	export: function () {

		this.$fireEvent('export', {
			sql  : this.query.sql_all || this.query.sql,
			binds: this.query.binds
		});
	},


	onChangePage: function (event) {

		if (event.which !== 13) {
			return;
		}

		var data = this.getData();

		this.loadPage(data.page);
	},


	walkPage: function (step) {

		var data = this.getData();

		this.loadPage(data.page + step);
	},


	loadPage: function (page) {

		var data  = this.getData();
		var query = this.query;

		page = Math.min(Math.max(page, 1), query.pages);

		if (page !== data.page) {
			this.setData({page: page});
		}

		if (page !== query.page && page <= query.pages) {
			DE_Query.updateLimit(query, page);
			this.submit();
		}
	},


	reset: function () {

		this.query   = null;
		this.results = null;

		this.dom.element.$addClass('hidden');
		this.dom.sections.sql.$addClass('hidden');
		this.dom.sections.ctrls.$addClass('hidden');

		var initial_values = Object.assign({}, this.initial_values);

		delete initial_values.text_length;

		this.setData(initial_values);
	},


	emptyCombo: function (k) {

		this.dom.inputs[k].$empty().$adopt(
			$E('option', {value: ''}).$text('<column>')
		);
	},


	getData: function () {

		var data   = {}, k;
		var inputs = this.dom.inputs;
		var labels = this.dom.labels;

		for (k in inputs) {
			data[k] = inputs[k].value;
		}

		for (k in labels) {
			data[k] = labels[k].getAttribute('data-value');
		}

		data.rows_limit  = parseInt(data.rows_limit)    || 0;
		data.text_length = parseInt(data.text_length)   || 80;
		data.page        = parseInt(data.page)          || 0;
		data.pages       = parseInt(data.pages)         || 1;

		return data;
	},


	setData: function (data) {

		var inputs = this.dom.inputs;
		var labels = this.dom.labels;
		var k;

		for (k in data) {
			if (k in inputs) {
				inputs[k].value = data[k];

			} else if (k in labels) {
				labels[k].setAttribute('data-value', data[k]);
			}

			switch (k) {
				case 'total':
					labels[k].$empty().$text('Total ' + data[k] + ' rows');
					break;

				case 'pages':
					labels[k].$empty().$text('of ' + data[k]);
					break;
			}
		}
	},


	displayError: function (query, results) {

		var msg = results.error || results;

		this.reset();

		this.dom.sections.table.$empty().$adopt(
			$E('tbody').$adopt(
				$E('tr').$adopt(
					$E('td', {'class': 'notice notice-error'}).$text(msg)
				)
			)
		);

		this.dom.element.$removeClass('hidden');
	},


	displayResults: function (query, results) {

		this.reset();

		this.query   = query;
		this.results = results;

		this.displaySQL(query);
		this.displayData();

		this.updateTotals(results);

		this.updatePagination(query, results);

		this.dom.element.$removeClass('hidden');
	},


	displaySQL: function (query) {

		var refer = this.dom.sections.sql;
		var code  = refer.$('code');
		var link  = refer.$('a');
		var sql   = DE_Query.parse(query);

		code.$empty().$html(Prism.highlight(sql, Prism.languages.sql, 'sql'));

		link.setAttribute('href', link.getAttribute('data-target') + encodeURIComponent(sql));

		refer[query.pagination ? '$removeClass' : '$addClass']('hidden');
	},


	displayData: function () {

		var data = this.getData(), msg;

		var results = this.results;

		var table = this.dom.sections.table.$empty();
		var tbody = $E('tbody');
		var tr    = $E('tr');

		var total = results.total || results.affected_rows;

		table.$adopt(
			$E('thead').$adopt(tr),
			tbody
		);

		if (!total) {
			msg  = 'Successfully executed. ';
			msg += results.affected_rows + ' affected rows.';

			if (results.columns.length > 0) {
				msg = '0 rows found.';
			}

			tr.$adopt($E('td', {'class': 'notice notice-success'}).$text(msg));

			return;
		}

		results.columns.forEach(function (col) {
			tr.$adopt($E('th').$text(col));
		});

		results.rows.forEach(function (row, i) {
			if (data.rows_limit && i >= data.rows_limit) {
				return;
			}

			tr = $E('tr').$inject(tbody);

			row.forEach(function (val) {
				if (val === null) {
					tr.$adopt($E('td').$adopt(
						$E('em').$text('NULL')
					));

				} else if (val.length > data.text_length) {
					var more = $E('em', {title: 'Display ' + val.length + ' characters'}).$text('…');

					more.$addEvent('click', function () {
						this.parentNode.$empty().$text(val);
					});

					tr.$adopt($E('td').$adopt(
						$T(val.substring(0, data.text_length)),
						more
					));

				} else {
					tr.$adopt($E('td').$text(val));
				}
			});
		});
	},


	updateTotals: function (results) {

		var total = results.total || results.affected_rows;

		this.setData({total: total});

		this.dom.sections.ctrls[total ? '$removeClass' : '$addClass']('hidden');
	},


	updatePagination: function (query, results) {

		var total = results.total || 0;
		var pages = query.limit ? Math.ceil(total / query.limit) : 0;

		var buttons  = this.dom.buttons;
		var sections = this.dom.sections;

		sections.limit[query.pagination ? '$addClass' : '$removeClass']('hidden');

		if (!query.pagination || pages <= 1) {
			sections.pagination.$addClass('hidden');
			return;
		}

		query.pages = pages;

		this.setData({
			page : query.page,
			pages: pages
		});

		buttons.prev.disabled = query.page <= 1;
		buttons.next.disabled = query.page >= pages;

		sections.pagination.$removeClass('hidden');
	}

};

Object.assign(DE_Results, $EventManager);
