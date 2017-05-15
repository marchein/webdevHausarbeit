const fs = require("fs");
try {
	let files = fs.readdirSync("data/");
	for(let i = 1; i < files.length; i++) {
		try {
		let data = fs.readFileSync("data/" + files[i]);
		let obj = JSON.parse(data.toString());
		console.log(obj.features[0].properties.name);
		} catch (error) {
			console.error(error);
		}
	}
} catch (error) {
	console.error(error);
}