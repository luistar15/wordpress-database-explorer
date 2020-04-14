<?php use function htmlspecialchars as e; ?>

<div class="de-header">
	<h1><?=$this->name?></h1>

	<ul>
		<?php foreach ($this->tabs as $k => $text) { ?>
		<li class="<?=$this->tab === $k ? 'active' : ''?>">
			<a href="<?=e($this->buildURL($k))?>"><?=$text?></a>
		</li>
		<?php } ?>
	</ul>
</div>

<div class="de-body">
	<?php require "{$this->basedir}/views/{$tpl}"; ?>
</div>
