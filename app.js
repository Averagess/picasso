const express = require("express");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const app = express();
const fs = require("fs");
const { extname } = require("path");
const favicon = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rfs = require("rotating-file-stream");
const logger = require("./logger");
const path = require("path");
const PORT = 80;

let files = fs.readdirSync(`${__dirname}/public/img`);
fs.watch("./public/img", {}, () => {
	files = fs.readdirSync(`${__dirname}/public/img`);
});

const authorizedKeys = ["CIA-222"];
app.use(fileUpload());
// app.use(helmet());
app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(morgan("combined"));
app.disable("x-powered-by");
const accessLogStream = rfs.createStream('access.log', {
	interval: '1d', // rotate daily
	path: path.join(__dirname, 'log')
});
app.use(morgan('combined', { stream: accessLogStream }));
files.sort(function(a, b) {
	// ASC  -> a.length - b.length
	// DESC -> b.length - a.length
	return parseInt(b.match((/^[0-9]+/g))) - parseInt(a.match((/^[0-9]+/g)));
});

let id;

if (files.length != 0) {
	const match = files[0].match(/^[0-9]+/g);
	id = parseInt(match);
	console.log(files);
}
else {
	id = -1;
}

app.get("/:value", (req, res) => {
	if (files.includes(req.params.value)) {
		return res.sendFile(`${__dirname}/public/img/${req.params.value}`);
	}
	else {
		return res.status(404).sendFile(`${__dirname}/public/html/404.html`);
	}
});

app.get("/", (req, res) => {
	res.sendFile(`${__dirname}/public/html/index.html`);
});

app.post("/upload", (req, res) => {
	if (authorizedKeys.includes(req.headers.apikey)) {
		id++;
		const img = req.files.img;
		const extension = extname(req.files.img.name);
		const path = `${__dirname}/public/img/${id}${extension}`;
		img.mv(path, err => {
			if (err) return res.status(500).send("Error, File not uploaded");
			const successObj = {
				"status": 200,
				"url": `http://4verage.xyz/${id}${extension}`,
			};
			logger.info(`Downloaded file ${req.files.img.name} successfully, named it ${id}${extension}, transaction api key: ${req.headers.apikey}`);
			res.send(JSON.stringify(successObj));
		});
	}
});

app.listen(PORT, () => {
	logger.info(`App listening at .${PORT}`);
});