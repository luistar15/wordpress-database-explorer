<?php
/**
 * Plugin Name: Database Explorer
 * Plugin URI: https://github.com/luistar15/wordpress-database-explorer
 * Description: View/Export database tables, run sql queries.
 * Version: 1.0.0
 * Requires at least: 4.7
 * Requires PHP: 5.6
 * Author: Luistar Quince
 * Author URI: https://github.com/luistar15
 * License: GPL2
 */

namespace DatabaseExplorer;


if (!defined('ABSPATH')) {
	exit;
}

if (!defined('WP_ADMIN')) {
	return 1;
}


require __DIR__ . '/src/Plugin.php';
require __DIR__ . '/src/Database.php';

$dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', DB_HOST, DB_NAME, DB_CHARSET);

$de_plugin = new Plugin(new Database($dsn, DB_USER, DB_PASSWORD), __FILE__);
$de_plugin->register();
