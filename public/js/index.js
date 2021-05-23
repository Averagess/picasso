onload = async function() {
    const clockElement = document.getElementById("clock");
    setInterval(() => {
        const time = new Date().toLocaleTimeString();
        clockElement.innerHTML = time;
    }, 1000);
    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))}
    const text = document.getElementById("header");
    const final = "Main page is under maintenance.";

    if (performance.getEntriesByType("navigation")[0].type === "reload") {
        text.innerHTML = final;
    }
    else {
        for (let char in final){
            const ms = Math.floor(Math.random() * 50);
            await sleep(ms)
            text.innerHTML += final[char];
    }};
};
    