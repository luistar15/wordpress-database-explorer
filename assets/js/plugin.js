
// -----------------------------------------------------------------------------
// prevent prism auto hightligthing

window.Prism = window.Prism || {};
window.Prism.manual = true;



// -----------------------------------------------------------------------------
// From: https://github.com/mysqljs/sqlstring/blob/master/lib/SqlString.js

var escapeMysqlString = function (val) {

	var CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g;

	var CHARS_ESCAPE_MAP    = {
		'\0'   : '\\0',
		'\b'   : '\\b',
		'\t'   : '\\t',
		'\n'   : '\\n',
		'\r'   : '\\r',
		'\x1a' : '\\Z',
		'"'    : '\\"',
		'\''   : '\\\'',
		'\\'   : '\\\\'
	};

	var chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex = 0;
	var escapedVal = '', match;

	while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
		escapedVal += val.slice(chunkIndex, match.index) + CHARS_ESCAPE_MAP[match[0]];
		chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex;
	}

	if (chunkIndex === 0) {
		return "'" + val + "'";
	}

	if (chunkIndex < val.length) {
		return "'" + escapedVal + val.slice(chunkIndex) + "'";
	}

	return "'" + escapedVal + "'";
};



// -----------------------------------------------------------------------------
// App init

DE_App.initialize();
