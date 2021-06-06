/* eslint-disable no-inline-comments */
/* eslint-disable no-shadow */
const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const fs = require("fs");
const { extname } = require("path");
const cors = require("cors");
const morgan = require("morgan");
const rfs = require("rotating-file-stream");
const logger = require("./logger");
const rateLimit = require("express-rate-limit");
const path = require("path");
const dotenv = require("dotenv");
const rp = require("request-promise");
const { decToHex } = require("hex2dec");
const { SteamIDConverter } = require("./modules/modules.js");
const PORT = 80;

let files = fs.readdirSync(`${__dirname}/public/img`);
fs.watch("./public/img", {}, () => {
	files = fs.readdirSync(`${__dirname}/public/img`);
});

dotenv.config();

const authorizedKeys = ["CIA-222"];
app.use(fileUpload());
app.use(express.json());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(morgan("combined"));
app.disable("x-powered-by");
const accessLogStream = rfs.createStream("access.log", {
	interval: "1d", // rotate daily
	path: path.join(__dirname, "log"),
});
app.use(morgan("combined", { stream: accessLogStream }));
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

app.get("imgs/:value", (req, res) => {
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

app.get("/steamid", (req, res) => {
	res.sendFile(`${__dirname}/public/html/steamid.html`);
});

app.post("/api/lookup", (req, res) => {
	if (req.body.steamid) {
		if (req.body.steamid.toLowerCase().includes("steamcommunity.com/profiles/")) {
			const originalURL = req.body.steamid;
			const extracted = originalURL.match(/([\d])\w+/g);
			const steamID64 = extracted[0];
			const getPlayerSummariesURL = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAMAPIKEY}&steamids=${steamID64}`;
			rp(getPlayerSummariesURL)
				.then(playerRes => {
					const data = JSON.parse(playerRes);
					const profileData = data.response.players[0];
					const steamIDS = {
						steamID64 : steamID64,
						steamID3 : SteamIDConverter.toSteamID3(steamID64),
						steamID : SteamIDConverter.toSteamID(steamID64),
						steamHEXID: decToHex(steamID64).substring(2).toUpperCase(),
						vanityURL : profileData.profileurl,
						defaultURL : `https://steamcommunity.com/profiles/${steamID64}`,
						personaname : profileData.personaname,
						avatarfull : profileData.avatarfull,
						timecreated : profileData.timecreated,
						personastate : profileData.personastate,
					};
					res.status(200).send(JSON.stringify(steamIDS));
				});
		}
		else {
			const storage = {};
			const originalURL = req.body.steamid;
			const extracted = originalURL.match(/(\w)\w*/g);
			const URL = extracted.pop().replace("/", "");
			const resolveVanityURL = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAMAPIKEY}&vanityurl=${URL}`;
			rp(resolveVanityURL)
				.then(valveRes => {
					const data = JSON.parse(valveRes);
					const steamID64 = data.response.steamid;
					const steamIDS = {
						steamID64 : steamID64,
						steamID3 : SteamIDConverter.toSteamID3(steamID64),
						steamID : SteamIDConverter.toSteamID(steamID64),
						steamHEXID: decToHex(steamID64).substring(2).toUpperCase(),
						vanityURL : originalURL,
						defaultURL : `https://steamcommunity.com/profiles/${steamID64}`,
					};
					storage.steamIDS = steamIDS;
					const getPlayerSummariesURL = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAMAPIKEY}&steamids=${steamID64}`;
					rp(getPlayerSummariesURL)
						.then(playerRes => {
							const data = JSON.parse(playerRes);
							const profileData = data.response.players[0];
							const steamIDS = storage.steamIDS;
							steamIDS.personaname = profileData.personaname;
							steamIDS.avatarfull = profileData.avatarfull;
							steamIDS.timecreated = profileData.timecreated;
							steamIDS.personastate = profileData.personastate;
							res.status(200).send(JSON.stringify(steamIDS));
						});
				});
		}
	}
	else {
		res.status(400);
		res.end();
	}
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
				"url": `http://4verage.xyz/imgs/${id}${extension}`,
			};
			logger.info(`Downloaded file ${req.files.img.name} successfully, named it ${id}${extension}, transaction api key: ${req.headers.apikey}`);
			res.send(JSON.stringify(successObj));
		});
	}
});

app.listen(PORT, () => {
	logger.info(`App listening at .${PORT}`);
});