<?php use function htmlspecialchars as e; ?>

<form class="de-query de-query-builder" action="#" method="POST">
	<div class="de-tc-row">
		<div class="de-tc-part">
			<span>SELECT * FROM</span>
			<select name="table">
				<option value="">&lt;table&gt;</option>
			</select>
		</div>

		<div class="de-tc-part">
			<span>WHERE</span>
			<div class="de-tc-input-group">
				<select name="where_column">
					<option value="">&lt;column&gt;</option>
				</select>
				<select name="where_comparator">
					<?php foreach (['=', '!=', '<', '<=', '>', '>=', 'LIKE', 'NOT LIKE', 'REGEXP', 'NOT REGEXP', 'IS NULL', 'IS NOT NULL'] as $k) { ?>
					<option value="<?=e($k)?>"><?=e($k)?></option>
					<?php } ?>
				</select>
				<input name="where_value" type="text" value="" />
			</div>
		</div>

		<div class="de-tc-part">
			<span>ORDER BY</span>
			<div class="de-tc-input-group">
				<select name="order_column">
					<option value="">&lt;column&gt;</option>
				</select>
				<select name="order_mode">
					<option value="ASC">ASC</option>
					<option value="DESC">DESC</option>
				</select>
			</div>
		</div>

		<div class="de-tc-part">
			<span>LIMIT</span>
			<input name="limit" type="number" value="10" step="10" min="10" max="1000" />
		</div>

		<div class="de-tc-part">
			<span>&nbsp;</span>
			<button name="load" class="button button-primary" type="submit">Load</button>
		</div>
	</div>
</form>
