import { celebrate } from "./confetti.js";

const EIGHT_THIRTY_SEVEN = { hour: 16, minutes: 43 };

const UNITS = { hour: 'hour', minute: 'minute', second: 'second' };

const MS_PER_SECOND = 1_000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;

const resultElement = document.getElementById('result');
const currentYearElement = document.getElementById('current-year');

let wasNow = false;


const isEightThirtySeven = (date) => 
    date.getHours() === EIGHT_THIRTY_SEVEN.hour && date.getMinutes() === EIGHT_THIRTY_SEVEN.minutes;

const getSecondsUntil = (target, now) =>  Math.floor((target - now) / MS_PER_SECOND);

const getHoursUntil = (totalSeconds) => Math.floor(totalSeconds / SECONDS_PER_HOUR);

const getMinutesUntil = (totalSeconds) => Math.floor(totalSeconds / SECONDS_PER_MINUTE) % MINUTES_PER_HOUR;

function getTimeUntilNext2037() {
    const now = new Date();
    const target = new Date(now);
    target.setHours(EIGHT_THIRTY_SEVEN.hour, EIGHT_THIRTY_SEVEN.minutes, 0, 0);

    if (now >= target) {
        target.setDate(target.getDate() + 1); 
    }

    const secondsUntil = getSecondsUntil(target, now);

    return {
        hours: getHoursUntil(secondsUntil),
        minutes: getMinutesUntil(secondsUntil),
        seconds: secondsUntil % SECONDS_PER_MINUTE
    };
}

const plural = (number, unit) => `${number} ${unit}${number === 1 ? '' : 's'}`;

const writeTimeUntil = () => {
    const timeUntil = getTimeUntilNext2037()
    const hours = plural(timeUntil.hours, UNITS.hour);
    const minutes = plural(timeUntil.minutes, UNITS.minute);
    const seconds = plural(timeUntil.seconds, UNITS.second);

    return `Nope, but it will be in ${hours}, ${minutes}, and ${seconds}.`
}

const checkTime = () => {
    const isNow = isEightThirtySeven(new Date());

    if (isNow) {
        resultElement.dataset.state = 'now';
        resultElement.textContent = "You bet your sweet bippy it is. Huzzah!";

        if (!wasNow) celebrate(resultElement);
    } else {
        delete resultElement.dataset.state;
        resultElement.textContent = writeTimeUntil()
    }

    wasNow = isNow;
}

const tick = () => {
    checkTime();
    setTimeout(tick, MS_PER_SECOND - (Date.now() % MS_PER_SECOND));
}

currentYearElement.textContent = new Date().getFullYear();

tick();
