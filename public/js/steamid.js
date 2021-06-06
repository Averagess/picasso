/* eslint-disable no-undef */
onload = async function() {
	const clockElement = document.getElementById("clock");
	const inputElement = document.getElementById("input");
	const boxElement = document.getElementById("box");
	const animationElements = document.getElementsByClassName("lds-roller");
	setInterval(() => {
		const time = new Date().toLocaleTimeString();
		clockElement.innerHTML = time;
	}, 1000);

	inputElement.onkeyup = (event) => {
		if (event.keyCode == 13) {
			event.preventDefault();
			console.log(inputElement.value);
			if (inputElement.value.toLowerCase().includes("steamcommunity.com/id/") || inputElement.value.toLowerCase().includes("id/") || inputElement.value.toLowerCase().includes("steamcommunity.com/profiles/")) {
				inputElement.style.display = "none";
				animationElements[0].style.display = "block";
				const payload = {
					steamid : inputElement.value,
				};
				fetch("http://localhost:80/api/lookup", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				})
					.then(res => res.json())
					.then(data => {
						let state;
						// PLAYING #90ba3c

						// ONLINE #56c9dc

						// OFFLINE #706b6e
						const onlineStates = [1, 2, 3, 4, 5, 6];
						if (onlineStates.includes(data.personastate)) {
							state = "#56c9dc";
						}
						else {
							state = "#706b6e";
						}
						console.log(data);
						console.log(typeof data);
						animationElements[0].style.display = "none";
						boxElement.style.borderWidth = "2px";
						boxElement.style.backgroundColor = "#13c2ff1c";
						boxElement.innerHTML = `
                            <div class="profile" style="width: 110px; height: 110px;">
                                <h1 style="padding-left: 25px; margin-right: 0px; width: fit-content;"><a href="${data.defaultURL}" target="_blank"><img src="${data.avatarfull}" style="border: 5px solid ${state}"></a>${data.personaname}</h1>
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
                                <p>${data.vanityURL}</p>
                                </ul>
                            </div>
                        `;
					});
			}
			else {
				console.log("Invalid link");
			}
		}
	};
};
