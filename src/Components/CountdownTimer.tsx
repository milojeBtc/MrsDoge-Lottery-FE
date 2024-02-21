import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';

interface TimerProps {
  targetDate: Date;
  additionalDate: number;
  setEnd: Dispatch<SetStateAction<boolean>>
}

const CountdownTimer: React.FC<TimerProps> = ({ targetDate, additionalDate, setEnd }) => {
  // const [additionalTime, setAdditionalTime] = useState(additionalDate);
  const calculateTimeLeft = () => {
    const currentTime = new Date().getTime();
    const timeDifference = targetDate.getTime() - currentTime + additionalDate;

    let timeLeft = {};

    // console.log('timeDifference ==> ', timeDifference)

    if (timeDifference > 0) {
      timeLeft = {
        days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((timeDifference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((timeDifference / 1000 / 60) % 60),
        seconds: Math.floor((timeDifference / 1000) % 60),
      };

    } else{
      // console.log("Time is up!!");
      setEnd(true);
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft]:any = useState(calculateTimeLeft());
  

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents:any = [];

  Object.keys(timeLeft).forEach((interval, index) => {
    if (!timeLeft[interval]) {
      return;
    }

    timerComponents.push(
      <span key={index}>
        {timeLeft[interval]} {interval}{' '}
      </span>
    );
  });

  return (
    <div>
      <div className='text-white text-[24px]'>
        {timerComponents.length ? timerComponents : <span>Time's up!</span>}
      </div>
    </div>
  );
};

export default CountdownTimer;
