// convert numbers to string of k,m,g,t, etc
function numToLetter(num, digits = 2) {
	var si = [
		{ value: 1, symbol: "" },
		{ value: 1E3, symbol: "k" },
		{ value: 1E6, symbol: "M" },
		{ value: 1E9, symbol: "G" },
		{ value: 1E12, symbol: "T" },
		{ value: 1E15, symbol: "P" },
		{ value: 1E18, symbol: "E" }
	];
	var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	var i;
	for (i = si.length - 1; i > 0; i--) {
		if (Math.abs(num) >= si[i].value) {
		break;
		}
	}
	return (Math.abs(num) / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

// change status
function changeStatus(id, table) {
	$.ajax({
		url: `/ap/general/status/change`,
		type: 'POST',
		data: { id: id, source_table: table },
		success: function(response){
			console.log(response)
		},
		error: function(xhr, errmsg, err) {
			console.log(err)
		}
	})
}