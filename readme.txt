=== Plugin Name ===
Contributors: luistar15
Requires at least: 4.7
Tested up to: 5.7
Requires PHP: 5.6
Stable tag: 1.1.0
Tags: database, browse, explore, sql, query, table, csv, export, download
License: GPLv2
License URI: http://www.gnu.org/licenses/gpl-2.0.html

View/Export database tables, run sql queries.


== Description ==

A simple and basic wordpress database browser and sql runner.

= Feautures =

* Intuitive and basic UI query builder
* Ajax based for fast data retrieval
* Download query results as .csv
* Truncated long texts can be expanded inplace
* SQL syntax highlighting
* Can run multiple sql statments at once
* Clearly marked NULL values

= Quirks =

* Only returns the results of the first sql statment when running multiple statments

= Thanks to =
* [Prism](prismjs.com/), sql syntax highlighter
* `escapeMysqlString()` extracted from [mysqljs](https://github.com/mysqljs/sqlstring/blob/master/lib/SqlString.js)
* Inpired by [Adminer](https://www.adminer.org) and [Database Browser](https://wordpress.org/plugins/database-browser/)


== Installation ==

1. Download and unzip the plugin
2. Upload the entire `database-explorer/` directory to `/wp-content/plugins/`
3. Activate the plugin through the Plugins menu in WordPress
4. Use it: Tools >> Database Explorer


== Changelog ==

= 1.0.0 - 2020-04-09 =
* Initial release

= 1.1.0 - 2021-03-24 =
* Fix results bar display
* Remove syntax highlighting from run-sql tab
* Hide sql and table params from url after tab loading
* Update prismjs
