<?php use function htmlspecialchars as e; ?>

<?php list ($columns, $rows) = $tables; ?>

<div class="de-results-data">
	<table class="wp-list-table widefat striped">
		<thead>
			<tr>
				<?php foreach ($columns as $c) { ?>
				<th><?=e($c)?></th>
				<?php } ?>
			</tr>
		</thead>

		<tbody>
			<?php foreach ($rows as $column) { ?>
			<tr>
				<?php foreach ($column as $i => $v) { ?>
				<td><?=($i ? ($i < 3 ? e($v) : number_format($v)) : sprintf('<a href="%s">%s</a>', $this->buildURL('table-data', ['table' => $v]), e($v)))?></td>
				<?php } ?>
			</tr>
			<?php } ?>
		</tbody>

		<tfoot>
			<tr>
				<?php foreach ($columns as $i => $c) { ?>
				<th><?=($i < 3 ? '' : number_format(array_sum(array_column($rows, $i))))?></th>
				<?php } ?>
			</tr>
		</tfoot>
	</table>
</div>
