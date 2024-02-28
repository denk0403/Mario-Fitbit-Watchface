// @ts-chec
import clock from "clock";
import { display } from "display";
import document from "document";
import { geolocation } from "geolocation";
import { vibration } from "haptics";
import * as messaging from "messaging";
import { battery } from "power";
import { preferences } from "user-settings";
import { SunCalc } from "../common/libs";
import { log, zeroPad } from "../common/utils";

//PLAYER
let standLink;
let jumpLink;
let isJumping = false;
const mario = document.getElementById("mario");
const jumpAnim = document.getElementById("jump_animation");

//BIRTHDAY
let allowBirthday = false;
let isBirthday = false;
let birthMonth = 0;
let birthDate = 0;

//SCENE
const background = document.getElementById("background");
const movable = document.getElementById("movable");

//INFO
const battPer = document.getElementById("battery");
const battIcon = document.getElementById("battery_icon");
const date = document.getElementById("date");

// TIME
const blocks = document.getElementById("blocks");
const hours1 = document.getElementById("hours1");
const hours2 = document.getElementById("hours2");
const mins1 = document.getElementById("mins1");
const mins2 = document.getElementById("mins2");

// ALERT SCREEN
let allowAlert = false;
let alertDelay;
const alert = document.getElementById("alert_screen");
let alertTimer;
const confirm = document.getElementById("confirm");
const phone = document.getElementById("phone");

// sunrise/sunset info
let sunrise;
let sunset;

const MS_PER_MIN = 1000 * 60;

function defaultSunsetSunrise() {
    sunrise = new Date();
    sunrise.setHours(6);
    sunrise.setMinutes(0);
    sunrise.setSeconds(0);
    sunset = new Date();
    sunset.setHours(20);
    sunset.setMinutes(0);
    sunset.setSeconds(0);
}

defaultSunsetSunrise(null);

// EXTRA
const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const dotw = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// Update the clock every minute
clock.granularity = "minutes";

function setToNight() {
    background.image = "assets/full_night.png";
}

function setToMorning() {
    background.image = "assets/full_day.png";
}

function updateScene() {
    const today = new Date();
    if (today.getTime() >= sunrise.getTime() && today.getTime() < sunset.getTime()) {
        setToMorning();
    } else {
        setToNight();
    }
}

function updateSunsetSunrise(position) {
    const loc = position.coords;
    const times = SunCalc.getTimes(new Date(), loc.latitude, loc.longitude);
    // log(times);
    sunrise = times.sunrise;
    sunset = times.sunset;
    updateScene();
}

function resetMario() {
    if (isJumping) {
        mario.image = jumpLink;
    } else {
        mario.image = standLink;
    }
}

function setToBirthday() {
    jumpLink = "assets/birthday_jumping_mario.png";
    standLink = "assets/birthday_standing_mario.png";
    resetMario();
    if (!isBirthday) {
        display.poke();
        vibration.start("ring");
    }
    isBirthday = true;
}

function setToRegular() {
    jumpLink = "assets/jumping_mario.png";
    standLink = "assets/standing_mario.png";
    resetMario();
    isBirthday = false;
}

function checkBirthday(date) {
    if (date.getMonth() == birthMonth && date.getDate() == birthDate && allowBirthday) {
        setToBirthday();
    } else {
        setToRegular();
    }
}

function resetDate() {
    checkBirthday(new Date());
    geolocation.getCurrentPosition(updateSunsetSunrise, defaultSunsetSunrise);
}

function jump(updatePM) {
    mario.image = jumpLink;
    isJumping = true;
    setTimeout(() => {
        if (updatePM) {
            blocks.image = "assets/pm-blocks.png";
        } else {
            blocks.image = "assets/am-blocks.png";
        }
    }, 250);
    jumpAnim.animate("enable");
    movable.animate("enable");
    setTimeout(() => {
        mario.image = standLink;
        isJumping = false;
    }, 1000);
}

function updateBattery() {
    battPer.text = Math.round(battery.chargeLevel) + "%";
    if (battery.chargeLevel > 75) {
        battIcon.image = "assets/100battery.png";
    } else if (battery.chargeLevel > 50) {
        battIcon.image = "assets/75battery.png";
    } else if (battery.chargeLevel > 25) {
        battIcon.image = "assets/50battery.png";
    } else {
        battIcon.image = "assets/25battery.png";
    }
}

messaging.peerSocket.onmessage = (evt) => {
    if (evt.data.key === "toggleAlert" && evt.data.newValue) {
        allowAlert = evt.data.newValue === "true";
        if (!allowAlert) {
            alert.style.visibility = "hidden";
            phone.image = "assets/no_phone.png";
        }
    } else if (evt.data.key === "waitTime" && evt.data.newValue) {
        alertDelay = Math.round(parseFloat(JSON.parse(evt.data.newValue).name) * MS_PER_MIN);
    } else if (evt.data.key === "toggleBirthday" && evt.data.newValue) {
        allowBirthday = evt.data.newValue === "true";
        checkBirthday(new Date());
    } else if (evt.data.key === "birthday" && evt.data.newValue) {
        birthMonth = parseInt(JSON.parse(evt.data.newValue).name.slice(5, 7), 10) - 1;
        birthDate = parseInt(JSON.parse(evt.data.newValue).name.slice(8, 10), 10);
        checkBirthday(new Date());
    } else {
        allowAlert = false;
        alertDelay = undefined;
        allowBirthday = false;
        birthMonth = 0;
        birthDate = 0;
        checkBirthday(new Date());
    }
};

confirm.onclick = () => {
    setTimeout(() => {
        phone.image = "assets/yes_phone.png";
        vibration.start("confirmation");
    }, 333);
    setTimeout(() => {
        alert.style.visibility = "hidden";
        phone.image = "assets/no_phone.png";
    }, 1250);
};

messaging.peerSocket.onopen = () => {
    clearTimeout(alertTimer);
};

messaging.peerSocket.onclose = (evt) => {
    if (!evt.wasClean && allowAlert && alertDelay >= 0) {
        alertTimer = setTimeout(
            () => {
                alert.style.visibility = "visible";
                vibration.start("nudge-max");
                display.poke();
            },
            !evt.wasClean ? alertDelay : 6 * MS_PER_MIN,
        );
    }
};

resetDate();

clock.ontick = (evt) => {
    const today = evt.date;
    let hours = today.getHours();
    let mins = today.getMinutes();

    if (hours === 0 && mins === 0) {
        resetDate();
    }

    updateBattery();
    updateScene();

    `test ${123}`

    const curDOTW = dotw[today.getDay()];
    const curMonth = months[today.getMonth()];
    const curDate = today.getDate();
    const curYear = today.getFullYear();

    date.text = `${curDOTW},  ${curMonth}  ${curDate}  ${curYear}`;

    jump(hours >= 12);

    if (preferences.clockDisplay === "12h") {
        // 12h format
        hours = hours % 12 || 12;
    }
    hours = zeroPad(hours);
    mins = zeroPad(mins);

    setTimeout(() => {
        hours1.image = `assets/numbers/${hours[0]}.png`;
        hours2.image = `assets/numbers/${hours[1]}.png`;
        mins1.image = `assets/numbers/${mins[0]}.png`;
        mins2.image = `assets/numbers/${mins[1]}.png`;
    }, 500);
};
