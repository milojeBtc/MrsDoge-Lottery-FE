import { useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const minuteSeconds = 60;
const hourSeconds = 3600;
const daySeconds = 86400;

const timerProps = {
  isPlaying: true,
  size: 120,
  strokeWidth: 6
};

const renderTime = (dimension: any, time: any) => {
  return (
    <div className="time-wrapper">
      <div className="time">{time}</div>
      <div>{dimension}</div>
    </div>
  );
};

const getTimeSeconds = (time: any) => (minuteSeconds - time) | 0;
const getTimeMinutes = (time: any) => ((time % hourSeconds) / minuteSeconds) | 0;
const getTimeHours = (time: any) => ((time % daySeconds) / hourSeconds) | 0;
// const getTimeDays = (time: any) => (time / daySeconds) | 0;

export default function MyTimer() {
  const [additionalTime, setAdditionalTime] = useState(0);
  let remainingTime = 12 * 3600; 

  return (
    <div className="flex flex-row gap-10 App">
      <CountdownCircleTimer
        {...timerProps}
        colors="#D14081"
        duration={daySeconds}
        initialRemainingTime={(remainingTime + additionalTime * 1000) % daySeconds}
        onComplete={(totalElapsedTime) => ({
          shouldRepeat: (remainingTime + additionalTime * 1000) - totalElapsedTime > hourSeconds
        })}
      >
        {({ elapsedTime, color }) => (
          <span style={{ color }}>
            {renderTime("hours", getTimeHours(daySeconds - elapsedTime))}
          </span>
        )}
      </CountdownCircleTimer>
      <CountdownCircleTimer
        {...timerProps}
        colors="#EF798A"
        duration={hourSeconds}
        initialRemainingTime={(remainingTime + additionalTime * 1000) % hourSeconds}
        onComplete={(totalElapsedTime) => ({
          shouldRepeat: (remainingTime + additionalTime * 1000) - totalElapsedTime > minuteSeconds
        })}
      >
        {({ elapsedTime, color }) => (
          <span style={{ color }}>
            {renderTime("minutes", getTimeMinutes(hourSeconds - elapsedTime))}
          </span>
        )}
      </CountdownCircleTimer>
      <CountdownCircleTimer
        {...timerProps}
        colors="#218380"
        duration={minuteSeconds}
        initialRemainingTime={(remainingTime + additionalTime * 1000) % minuteSeconds}
        onComplete={(totalElapsedTime) => ({
          shouldRepeat: (remainingTime + additionalTime * 1000) - totalElapsedTime > 0
        })}
      >
        {({ elapsedTime, color }) => (
          <span style={{ color }}>
            {renderTime("seconds", getTimeSeconds(elapsedTime))}
          </span>
        )}
      </CountdownCircleTimer>
      <div className="p-2 text-white bg-black" onClick={() => setAdditionalTime(flag => flag + 30 * 1000)}>
          add time
      </div>
    </div>
  );
}
