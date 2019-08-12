import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { answer } from '../common/libs';
import { geolocation } from "geolocation";
import { battery } from "power";
import * as messaging from "messaging";
import { vibration } from "haptics";
import { display } from "display";

//PLAYER
let standLink;
let jumpLink;
let isJumping = false;
let mario = document.getElementById("mario");
let jumpAnim = document.getElementById("jump_animation");

//BIRTHDAY
let allowBirthday = false;
let isBirthday = false;
let birthMonth = 0;
let birthDate = 0;

//SCENE
let background = document.getElementById("background");
let movable = document.getElementById("movable");

//INFO
let battPer = document.getElementById("battery");
let battIcon = document.getElementById("battery_icon");
let date = document.getElementById("date");

// TIME
let blocks = document.getElementById("blocks");
let hours1 = document.getElementById("hours1");
let hours2 = document.getElementById("hours2");
let mins1 = document.getElementById("mins1");
let mins2 = document.getElementById("mins2");


// ALERT SCREEN
let allowAlert = false;
let alertDelay;
let alert = document.getElementById("alert_screen");
let alertTimer;
let confirm = document.getElementById("confirm");
let phone = document.getElementById("phone");

// sunrise/sunset info
let sunrise;
let sunset;

const MS_PER_MIN = 1000 * 60;

function defaultSunsetSunrise(error) {
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
let months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
let dotw = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// Update the clock every minute
clock.granularity = "minutes";

function setToNight() {
  background.image = "assets/full_night.png";
}

function setToMorning() {
  background.image = "assets/full_day.png";
}

function updateScene() {
  let today = new Date();
  if (today.getTime() >= sunrise.getTime() && today.getTime() < sunset.getTime()) {
    setToMorning();
  } else {
    setToNight();
  }
}

function updateSunsetSunrise(position) {
  let loc = position.coords;
  var times = answer.getTimes(new Date(), loc.latitude, loc.longitude);
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
  }
  else {
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

messaging.peerSocket.onmessage = evt => {
  if (evt.data.key === "toggleAlert" && evt.data.newValue) {
    allowAlert = (evt.data.newValue === "true");
    if (!allowAlert) {
      alert.style.visibility = "hidden";
      phone.image = "assets/no_phone.png";
    }
  } else if (evt.data.key === "waitTime" && evt.data.newValue) {
    alertDelay = Math.round(parseFloat(JSON.parse(evt.data.newValue).name) * MS_PER_MIN);
  } else if (evt.data.key === "toggleBirthday" && evt.data.newValue) {
    allowBirthday = (evt.data.newValue === "true");
    checkBirthday(new Date());
  } else if (evt.data.key === "birthday" && evt.data.newValue) {
    birthMonth = parseInt(JSON.parse(evt.data.newValue).name.slice(5,7), 10)-1;
    birthDate = parseInt(JSON.parse(evt.data.newValue).name.slice(8,10), 10);
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

confirm.onclick = evt => {
  setTimeout(() => {
    phone.image = "assets/yes_phone.png";
    vibration.start("confirmation");
  }, 333);
  setTimeout(() => {
    alert.style.visibility = "hidden";
    phone.image = "assets/no_phone.png";
  }, 1250);
  
}

messaging.peerSocket.onopen = evt => {
  clearTimeout(alertTimer);
}

messaging.peerSocket.onclose = evt => {
  if (!evt.wasClean && allowAlert && alertDelay >= 0) {
    alertTimer = setTimeout(() => {
      alert.style.visibility = "visible";
      vibration.start("nudge-max");
      display.poke();
    }, !evt.wasClean ? alertDelay : 6 * MS_PER_MIN);
  }
}

resetDate();

clock.ontick = (evt) => {
  
  let today = evt.date;
  let hours = today.getHours();
  let mins = today.getMinutes();
  
  if (hours === 0 && mins === 0) {
    resetDate();
  }

  updateBattery();
  updateScene();
  
  date.text = dotw[today.getDay()] + ",  " + months[today.getMonth()] + "  " + today.getDate() + "  " + today.getFullYear();
  
  jump(hours >= 12);
  
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  }
  hours = util.zeroPad(hours);
  mins = util.zeroPad(today.getMinutes());
  
  setTimeout(() => {
    hours1.image = `assets/numbers/${hours[0]}.png`;
    hours2.image = `assets/numbers/${hours[1]}.png`;
    mins1.image = `assets/numbers/${mins[0]}.png`;
    mins2.image = `assets/numbers/${mins[1]}.png`;
  }, 500);
}
