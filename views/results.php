<?php use function htmlspecialchars as e; ?>

<div class="de-results" action="#">
	<pre class="de-results-sql"><code></code> <a href="#" data-target="<?=e($this->buildURL('run-sql', ['sql' => '']))?>">Edit</a></pre>

	<div class="de-results-data">
		<table class="wp-list-table widefat striped"></table>
	</div>

	<div class="de-tc-row de-results-ctrls">
		<div class="de-tc-item">
			<div class="de-tc-group de-results-limit">
				<span class="de-label">Display</span>
				<select name="rows_limit">
					<option value="0">all rows</option>
					<option value="5">5 rows</option>
					<option value="10">10 rows</option>
					<option value="20">20 rows</option>
					<option value="50">50 rows</option>
					<option value="100">100 rows</option>
					<option value="500">500 rows</option>
					<option value="0">all rows</option>
				</select>
			</div>
			<div class="de-tc-group">
				<span class="de-label">Text length:</span>
				<input name="text_length" type="number" value="80" step="10" min="10" max="200" />
			</div>
		</div>

		<div class="de-tc-item de-pagination">
			<button name="prev" class="button" type="button">Previous</button>
			<input name="page" type="number" value="1" />
			<button name="next" class="button" type="button">Next</button>
			<span class="de-label" data-name="pages" data-value="1"></span>
		</div>

		<div class="de-tc-item de-results-total">
			<span class="de-label" data-name="total" data-value="0"></span>
			<button name="export" class="button" type="button">Export as CSV</button>
		</div>
	</div>
</div>
