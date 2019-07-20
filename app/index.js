import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { answer } from '../common/libs';
import { geolocation } from "geolocation";
import { battery } from "power";

//PLAYER
let standLink;
let jumpLink;
let playerStand = document.getElementById("standing_mario");
let playerJump = document.getElementById("jumping_mario");
let jumpAnim = document.getElementById("jump_animation");

//SCENE
let background = document.getElementById("background");
let overlay = document.getElementById("overlay");
let movable = document.getElementById("movable");

//INFO
let battPer = document.getElementById("battery");
let battIcon = document.getElementById("battery_icon");
let date = document.getElementById("date");

// TIME
let hours1 = document.getElementById("hours1");
let hours2 = document.getElementById("hours2");
let mins1 = document.getElementById("mins1");
let mins2 = document.getElementById("mins2");
let amPM = document.getElementById("am-pm");

// sunrise/sunset info
let sunrise;
let sunset;

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
  background.image = "assets/night_background.png";
  overlay.image = "assets/night_overlay.png";
}

function setToMorning() {
  background.image = "assets/day_background.png";
  overlay.image = "assets/day_overlay.png";
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

function setToBirthday() {
  standLink = "assets/birthday_standing_mario.png";
  jumpLink = "assets/birthday_jumping_mario.png";
  playerStand.height = 138;
  playerStand.y = 142;
  playerJump.height = 138;
  playerJump.y = 142;
}

function setToRegular() {
  standLink = "assets/standing_mario.png";
  jumpLink = "assets/jumping_mario.png";
  playerStand.height = 100;
  playerStand.y = 180;
  playerJump.height = 100;
  playerJump.y = 180;
}

function resetDate() {
  let date = new Date();
  if (date.getMonth() === 3 && date.getDate() === 3) {
    setToBirthday();
  }
  else {
    setToRegular();
  }
  geolocation.getCurrentPosition(updateSunsetSunrise, defaultSunsetSunrise);
}

function jump(updatePM) {
  setTimeout(() => {
    if (updatePM) {
      amPM.image = "assets/pm-block.png";
    } else {
      amPM.image = "assets/am-block.png";
    }
  }, 500);
  playerStand.image = "";
  playerJump.image = jumpLink;
  jumpAnim.animate("enable");
  movable.animate("enable");
  setTimeout(() => {
    playerJump.image = "";
    playerStand.image = standLink;
  }, 1000);
}

function updateBattery() {
  battPer.text = Math.floor(battery.chargeLevel) + "%";
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

resetDate();

clock.ontick = (evt) => {
  
  let today = evt.date;
  let hours = today.getHours();
  let mins = today.getMinutes();
  
  if (hours === 0 && mins === 0) {
    resetDate();
  }
  
  updateBattery();
  
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
    updateScene();
  }, 500);
}
