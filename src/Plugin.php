<?php

namespace DatabaseExplorer;


use Exception;


class Plugin {

	private $name        = 'Database Explorer';
	private $version     = '0.1.0';
	private $slug        = 'database-explorer';
	private $parent_menu = 'tools.php';

	private $tab  = null;
	private $tabs = [
		'tables'     => 'Tables',
		'table-data' => 'Table data',
		'run-sql'    => 'Run SQL',
	];


	private $caller;
	private $basedir;
	private $basename;
	private $url;

	private $db;


	public function __construct ($db, $caller ) {

		$this->db = $db;

		$this->caller   = $caller;
		$this->basedir  = dirname($caller);
		$this->basename = plugin_basename($caller);
		$this->url      = admin_url($this->parent_menu) . '?page=' . $this->slug;

		$this->identifyTab();
	}


	private function identifyTab () {

		$tab = isset($_GET['tab']) ? $_GET['tab'] : 'tables';

		if (isset($this->tabs[$tab])) {
			$this->tab = $tab;
		}
	}


	public function register () {

		add_action('admin_menu', function () {
			add_submenu_page(
				$this->parent_menu,
				$this->name,
				$this->name,
				'administrator',
				$this->slug,
				[$this, 'loadPage']
			);
		});

		add_action("plugin_action_links_{$this->basename}", function ($links) {
			return array_merge($links, [
				sprintf('<a href="%s">Explore</a>', esc_url($this->url)),
			]);
		});

		add_action('admin_enqueue_scripts', [$this, 'addAssets']);

		add_action('wp_ajax_de_run_query', [$this, 'runQuery']);
		add_action('admin_post_de_export_query_results', [$this, 'exportQueryResults']);
	}


	// -------------------------------------------------------------------------


	private function validateRequest () {

		parse_str(file_get_contents('php://input'), $__POST);

		$is_post  = $_SERVER['REQUEST_METHOD'] === 'POST';

		$nonce = isset($__POST['tracking']) ? $__POST['tracking'] : '';
		$query = isset($__POST['query']) ? $__POST['query'] : '';

		$nonce_ok = wp_verify_nonce($nonce, "{$this->slug}-query");
		$query    = json_decode($query, true);

		if (!$is_post || !$nonce_ok || !$query || !isset($query['sql'], $query['binds'])) {
			wp_send_json(['error' => 'Invalid parameters'], 400);
		}

		return $query;
	}


	public function runQuery () {

		$query = $this->validateRequest();

		$sql   = $query['sql'];
		$count = isset($query['sql_count']) ? $query['sql_count'] : null;

		$binds = $query['binds'];

		try {
			$results = $this->db->runQuery($sql, $binds);

			if ($count) {
				$results['total'] = intval($this->db->getCell($count, $binds));
			}

			wp_send_json($results, 200);

		} catch (Exception $e) {
			wp_send_json(['error' => $e->getMessage()], 500);
		}
	}


	public function exportQueryResults () {

		$query = $this->validateRequest();

		try {
			$this->db->exportQueryResults($query['sql'], $query['binds']);

		} catch (Exception $e) {
			wp_die($e->getMessage(), '', 500);
		}
	}


	// -------------------------------------------------------------------------

	public function loadPage () {

		$data = [];

		switch ($this->tab) {
			case 'tables':
				$data['tables'] = $this->db->getTablesSummary();
				$data['tpl'] = 'tables.php';
				break;

			case 'table-data':
				$data['tpl'] = 'app.php';
				$data['tpl_query'] = 'query-builder.php';
				break;

			case 'run-sql':
				$data['tpl'] = 'app.php';
				$data['tpl_query'] = 'query-sql.php';
				break;

			default: return;
		}

		$this->renderPage($data);
	}


	private function renderPage ($data = []) {

		extract($data);

		require "{$this->basedir}/views/layout.php";
	}


	public function addAssets ($hook) {

		if ($hook !== "tools_page_{$this->slug}") {
			return;
		}

		$js_data = $this->tab === 'tables' ? null : [
			'endpoint' => [
				'query'  => admin_url('admin-ajax.php'),
				'export' => admin_url('admin-post.php'),
			],

			'tracking' => wp_create_nonce("{$this->slug}-query"),
		];


		// --------------

		wp_enqueue_style('de-style', plugins_url('/assets/css/styles.css', $this->caller), [], $this->version);
		wp_enqueue_script('de-dom-utils', plugins_url('/assets/js/dom-utils.js', $this->caller), [], $this->version, true);

		if ($this->tab === 'table-data') {
			$js_data['tables'] = $this->db->getTablesWithColumns();
		}

		if ($js_data) {
			wp_enqueue_style('prism', plugins_url('/assets/prism/prism.css', $this->caller));
			wp_enqueue_script('prism', plugins_url('/assets/prism/prism.js', $this->caller), [], $this->version, true);
			wp_enqueue_script('de-plugin-4', plugins_url('/assets/js/DE_QueryBuilder.js', $this->caller), [], $this->version, true);
			wp_enqueue_script('de-plugin-3', plugins_url('/assets/js/DE_QuerySQL.js', $this->caller), [], $this->version, true);
			wp_enqueue_script('de-plugin-2', plugins_url('/assets/js/DE_Results.js', $this->caller), [], $this->version, true);
			wp_enqueue_script('de-plugin-1', plugins_url('/assets/js/DE_App.js', $this->caller), [], $this->version, true);
			wp_enqueue_script('de-plugin-0', plugins_url('/assets/js/plugin.js', $this->caller), [], $this->version, true);
			wp_localize_script('de-plugin-0', 'DE_JS_DATA', $js_data);
		}
	}


	private function buildURL ($tab = '', $args = []) {

		$url = $this->url;

		if ($tab) {
			$url .= "&tab={$tab}";
		}

		if (count($args)) {
			$url .= '&' . http_build_query($args);
		}

		return $url;
	}

}
