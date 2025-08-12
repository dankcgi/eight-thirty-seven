const resultElement = document.getElementById("result");

function getTimeUntilNex2037() {
    const now = new Date();
    const next2037 = new Date(now.getFullYear(), 7, 37, 20, 37, 0); 
    if (now > next2037) {
        next2037.setFullYear(next2037.getFullYear() + 1); 
    }
    const diff = next2037 - now;
    const secondsUntil = Math.floor(diff / 1000);
    const minutesUntil = Math.floor(secondsUntil / 60);
    const hoursUntil = Math.floor(minutesUntil / 60);
    return {
        hours: hoursUntil % 24,
        minutes: minutesUntil % 60,
        seconds: secondsUntil % 60
    };
}

function checkTime() {
    const now = new Date();
    if (now.getHours() === 20 && now.getMinutes() === 37) {
        resultElement.textContent = "You bet your sweet bippy it is. Huzzah!";
    } else {
        resultElement.textContent = `Nope, but it will be in ${getTimeUntilNex2037().hours} hours, ${getTimeUntilNex2037().minutes} minutes, and ${getTimeUntilNex2037().seconds} seconds.`;
    }
}

checkTime(); 
setInterval(checkTime, 1000);