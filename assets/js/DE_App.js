
var DE_App = {

	dom: {
		element: null
	},


	initialize: function () {

		this.build(this.dom);
		this.setup(this.dom);

		this.form.loadFromUrl(this.getUrlParameters());
	},


	build: function (dom) {

		dom.element = $('.de-app');
		dom.loading = $E('div', {'class': 'de-loading'});

		switch (dom.element.getAttribute('data-tab')) {
			case 'table-data': this.form = DE_QueryBuilder; break;
			case 'run-sql'   : this.form = DE_QuerySQL;     break;
		}

		this.results = DE_Results;

		this.form.initialize();
		this.results.initialize();
	},


	setup: function () {

		this.form.$addEvent('submit', this.runQuery.bind(this));

		this.results.$addEvent('submit', this.runQuery.bind(this));
		this.results.$addEvent('export', this.exportResults.bind(this));
	},


	runQuery: function (query) {
		var data = [
			'action=de_run_query',
			'tracking=' + encodeURIComponent(DE_JS_DATA.tracking),
			'query=' + encodeURIComponent(JSON.stringify(query)),
		];

		var xhr = new XMLHttpRequest();

		xhr.open('POST', DE_JS_DATA.endpoint.query);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				var success  = xhr.status === 200;
				var data      = xhr.responseText;
				var data_type = xhr.getResponseHeader('Content-Type');

				if (data_type && /application\/json/i.test(data_type)) {
					data = JSON.parse(data);
				}

				this.results[success ? 'displayResults' : 'displayError'](query, data);

				this.loading(false);
			}
		}.bind(this);

		this.loading(true);

		xhr.send(data.join('&'));
	},


	exportResults: function (sql) {

		var form = $E('form', {action: DE_JS_DATA.endpoint.export, method: 'POST'});

		form.$adopt(
			$E('input', {type: 'hidden', name: 'action',   value: 'de_export_query_results'}),
			$E('input', {type: 'hidden', name: 'tracking', value: DE_JS_DATA.tracking}),
			$E('input', {type: 'hidden', name: 'query',    value: JSON.stringify(sql)}),
		);

		document.body.$adopt(form);

		window.setTimeout(function () { form.$dispose(); }, 2000);

		form.submit();
	},


	loading: function (show) {

		if (show) {
			this.dom.loading.$inject($('#wpbody'));
		} else {
			this.dom.loading.$dispose();
		}
	},


	getUrlParameters: function () {
		var parameters = {};

		window.location.search.substr(1).split('&').map(function (part) {
			var parts = part.match(/^([^=]+)+(=(.*))?$/);
			var k = parts[1];
			var v = parts[3] || '';

			if (parts) {
				parameters[k] = decodeURIComponent(v.replace(/\+/g, '%20'));
			}
		});

		return parameters;
	}

};


var DE_Query = {

	parse: function (query) {

		var sql = query.sql, k;

		for (k in query.binds) {
			sql = sql.replace(k, escapeMysqlString(query.binds[k]));
		}

		return sql;
	},


	updateLimit: function (query, page) {

		var offset = (page - 1) * query.limit;

		query.page = page;
		query.sql = query.sql.replace(/( LIMIT \d+)( OFFSET \d+)?$/, '$1 OFFSET ' + offset);
	}

};
