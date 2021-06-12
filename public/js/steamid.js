/* eslint-disable no-undef */
onload = async function() {
	const clockElement = document.getElementById("clock");
	const inputElement = document.getElementById("input");
	const submitButton = document.getElementById("submitb");
	const inputBox = document.getElementById("inputbox");
	const boxElement = document.getElementById("box");
	const resultBox = document.getElementById("result");
	const animationElements = document.getElementsByClassName("lds-roller");

	setInterval(() => {
		const time = new Date().toLocaleTimeString();
		clockElement.innerHTML = time;
	}, 1000);

	function newSearch() {
		resultBox.innerHTML = null;
		boxElement.style.borderWidth = "0px";
		boxElement.style.backgroundColor = "";
		inputBox.style.display = "flex";
	}

	function submit() {
		if (inputElement.value.toLowerCase().includes("steamcommunity.com/id/") || inputElement.value.toLowerCase().includes("id/") || inputElement.value.toLowerCase().includes("steamcommunity.com/profiles/")) {
			inputBox.style.display = "none";
			animationElements[0].style.display = "block";
			const payload = {
				steamid : inputElement.value,
			};
			fetch("https://4verage.xyz/api/lookup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			})
				.then(res => {
					if (res.status == 404) {
						throw new Error("invalidAccount");
					}
					else if (res.status == 500) {
						throw new Error("internalError");
					}
					else {
						return res.json();
					}
				})
				.then(data => {
					let state;
					let customURL;
					let onlineState;
					if (data.personastate != 0) {
						state = "#56c9dc";
						onlineState = "Online";
					}
					else {
						state = "#706b6e";
						onlineState = "Offline";
					}
					if (data.defaultURL == data.vanityURL) {
						customURL = "None";
					}
					else { customURL = data.vanityURL; }
					animationElements[0].style.display = "none";
					boxElement.style.borderWidth = "2px";
					boxElement.style.backgroundColor = "#13c2ff1c";
					resultBox.innerHTML = `
						<a class="close"></a>
						<div class="profile" style="width: fit-content; height: fit-content; display: flex; margin-top: 25px; margin-left: 25px;">
							<a href="${data.defaultURL}" target="_blank"><img src="${data.avatarfull}" style="border: 3px solid ${state}"></a>
							<ul id="profiledesc">
								<li id="username">${data.personaname}</li>
								<li id="onlinestate" style="color: ${state}">${onlineState}</li>
							</ul>
						</div>
						<div class="items" id="itemsBox">
							<ul>
							<li>SteamID</li>
							<p>${data.steamID}</p>
							<li>SteamID3</li>
							<p>${data.steamID3}</p>
							<li>SteamID64</li>
							<p>${data.steamID64}</p>
							<li>Steam Hex ID</li>
							<p>${data.steamHEXID}</p>
							<li>Default URL</li>
							<p>${data.defaultURL}</p>
							<li>Custom URL</li>
							<p>${customURL}</p>
							</ul>
						</div>
					`;

					document.getElementsByClassName("close")[0].onclick = () => {
						newSearch();
					};
				})
				// Err handling
				.catch(err => {
					animationElements[0].style.display = "none";
					inputBox.style.display = "flex";
					if (err.message == "invalidAccount") {
						this.alert(`That Steam account was not found. ${"\r\n"}Double check your spelling and try again.`);
					}
					else if (err.message == "internalError") {
						this.alert(`Server responded with internal server error. ${"\r\n"}Please try again later.`);
					}
					else {
						this.alert(`Unexpected error occured :( ${"\r\n"}Please try again.`);
					}
				});
		}
		else if (inputElement.value) {
			this.alert(`Your link: "${inputElement.value}" was invalid.${"\r\n"}Try to submit your Steam link in this format:${"\r\n"}https://steamcommunity.com/id/CUSTOMURL/,${"\r\n"}or https://steamcommunity.com/profiles/812701327123773/`);
		}
	}

	inputElement.onkeyup = (event) => {
		if (event.keyCode == 13) {
			event.preventDefault();
			submit();
		}
	};

	submitButton.onclick = () => {
		submit();
	};

};
