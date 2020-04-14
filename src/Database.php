<?php

namespace DatabaseExplorer;

use Exception;
use PDO;


class Database extends PDO {

	private $connection_parameters;

	private $is_connected = false;


	public function __construct (
		$dsn,
		$username = '',
		$passwd = '',
		$options = []
	) {

		$options[PDO::ATTR_ERRMODE] = PDO::ERRMODE_EXCEPTION;

		$this->connection_parameters = [$dsn, $username, $passwd, $options];
	}


	// -------------------------------------------------------------------------


	public function runQuery ($sql, $bindings) {

		$sth = $this->execute($sql, $bindings);

		$column_count = $sth->columnCount();
		$row_count    = $sth->rowCount();

		$rows    = [];
		$columns = [];

		if ($column_count) {
			$rows    = $sth->fetchAll(PDO::FETCH_NUM);
			$columns = self::getStatementColumns($sth);
		}

		$sth->closeCursor();

		return [
			'rows'          => $rows,
			'columns'       => $columns,
			'affected_rows' => intval($row_count),
		];
	}


	public function exportQueryResults ($sql, $bindings) {

		$sth = $this->execute($sql, $bindings);

		$columns = self::getStatementColumns($sth);

		header('Content-Type: application/csv');
		header('Content-Disposition: attachment; filename=query-results.csv');
		header('Cache-Control: must-revalidate, post-check=0, pre-check=0');

		$fh = fopen('php://output', 'w');

		ob_clean();

		fputcsv($fh, $columns);

		while ($row = $sth->fetch(PDO::FETCH_NUM)) {
			fputcsv($fh, $row);
		}

		$sth->closeCursor();

		ob_flush();

		fclose($fh);
	}


	public function getTablesWithColumns () {

		$sql = '
		SELECT   `TABLE_NAME`, `COLUMN_NAME`
		FROM     `information_schema`.`COLUMNS`
		WHERE    `TABLE_SCHEMA` = ?
		ORDER BY `TABLE_NAME` ASC, `ORDINAL_POSITION` ASC
		';

		$tables = [];

		$rows = $this->streamRows($sql, [DB_NAME], PDO::FETCH_NUM);

		foreach ($rows as list ($k, $col)) {
			if (isset($tables[$k])) {
				$tables[$k][] = $col;
			} else {
				$tables[$k] = [$col];
			}
		}

		return $tables;
	}


	public function getTablesSummary () {

		$sql = '
		SELECT
			`TABLE_NAME`      AS `Table`,
			`ENGINE`          AS `Engine`,
			`TABLE_COLLATION` AS `Collation`,
			`DATA_LENGTH`     AS `Data Length`,
			`INDEX_LENGTH`    AS `Index Length`,
			`AUTO_INCREMENT`  AS `Auto Increment`,
			`TABLE_ROWS`      AS `Rows`
		FROM
			`information_schema`.`TABLES`
		WHERE
			`TABLE_SCHEMA` = ?
		ORDER BY
			`TABLE_NAME` ASC
		';

		$sth = $this->execute($sql, [DB_NAME]);

		$columns = self::getStatementColumns($sth);
		$rows    = $sth->fetchAll(PDO::FETCH_NUM);

		$sth->closeCursor();

		return [$columns, $rows];
	}


	// -------------------------------------------------------------------------


	private function connect () {
		if (!$this->is_connected) {
			parent::__construct(...$this->connection_parameters);
			$this->is_connected = true;
		}
	}


	public function execute ($sql, $bindings = []) {

		$this->connect();

		$sth = $this->prepare($sql);

		self::bindValues($sth, $bindings);

		$sth->execute();

		return $sth;
	}


	public function streamRows (
		$sql,
		$bindings = [],
		$fetch_type = PDO::FETCH_ASSOC
	) {

		$sth = $this->execute($sql, $bindings);

		while ($row = $sth->fetch($fetch_type)) {
			yield $row;
		}

		$sth->closeCursor();
	}


	public function getCell (
		$sql,
		$bindings = [],
		$column_number = 0
	) {

		$sth = $this->execute($sql, $bindings);
		$val = $sth->fetchColumn($column_number);
		$sth->closeCursor();

		if ($val === false) {
			throw new Exception('PDOStatement::fetchColumn() has failed');
		}

		return $val;
	}


	// -------------------------------------------------------------------------


	public static function getStatementColumns ($sth) {

		$columns = [];

		$count = $sth->columnCount();

		for ($i = 0; $i < $count; $i++) {
			$column = $sth->getColumnMeta($i);
			$columns[] = $column['name'];
		}

		return $columns;
	}


	private static function bindValues ($sth, $bindings = []) {

		$question_mark_position = 0;

		foreach ($bindings as $k => $v) {
			$parameter = is_int($k) ? ++$question_mark_position : $k;

			$value = $v;
			$data_type = null;

			if (is_array($v)) {
				$value = $v[0];
				$data_type = isset($v[1]) ? $v[1] : null;
			}

			if (is_null($data_type)) {
				$data_type = self::inferDataType(gettype($value));
			}

			$sth->bindValue($parameter, $value, $data_type);
		}
	}


	private static function inferDataType ($type) {

		switch ($type) {
			case 'string'  : return PDO:: PARAM_STR;
			case 'integer' : return PDO:: PARAM_INT;
			case 'boolean' : return PDO:: PARAM_BOOL;
			case 'double'  : return PDO:: PARAM_STR;
			case 'NULL'    : return PDO:: PARAM_NULL;

			default:
				throw new Exception("Invalid PDO data type: {$type}");
		}
	}

}
