import "fitbit-sdk-types/types/device/clock";
import "fitbit-sdk-types/types/device/display";
import "fitbit-sdk-types/types/device/document/document";
import "fitbit-sdk-types/types/device/document/elements";
import "fitbit-sdk-types/types/device/document/events";
import "fitbit-sdk-types/types/device/haptics";
import "fitbit-sdk-types/types/device/power";
import "fitbit-sdk-types/types/device/user-settings";
import "fitbit-sdk-types/types/shared/geolocation";
import "fitbit-sdk-types/types/shared/messaging";
import type { addTime, getMoonIllumination, getMoonPosition, getMoonTimes, getPosition, getTimes } from "suncalc";

interface SunCalc {
    addTime: typeof addTime;
    getMoonIllumination: typeof getMoonIllumination;
    getMoonPosition: typeof getMoonPosition;
    getMoonTimes: typeof getMoonTimes;
    getPosition: typeof getPosition;
    getTimes: typeof getTimes;
}
