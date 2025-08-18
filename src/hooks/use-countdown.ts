"use client"
// Hook for countdown logic
import { useState, useEffect, useMemo } from 'react';

// Types
interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface CountdownData {
    timeLeft: TimeLeft;
    isStarted: boolean;
    isEnded: boolean;
    displayText: string;
}
export const useAuctionCountdown = (
    auctionStartTime: string,
    auctionEndTime: string
): CountdownData => {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const now = currentTime.getTime();
    const start = new Date(auctionStartTime).getTime();
    const end = new Date(auctionEndTime).getTime();

    let targetTime: number;
    let displayText: string;
    let isStarted: boolean;
    let isEnded: boolean;

    if (now < start) {
        // Chưa bắt đầu - đếm ngược đến start
        targetTime = start;
        displayText = "Starts in";
        isStarted = false;
        isEnded = false;
    } else if (now >= start && now < end) {
        // Đang diễn ra - đếm ngược đến end
        targetTime = end;
        displayText = "Ends in";
        isStarted = true;
        isEnded = false;
    } else {
        // Đã kết thúc
        targetTime = end;
        displayText = "Ended";
        isStarted = true;
        isEnded = true;
    }

    // Tính thời gian còn lại
    const difference = Math.max(0, targetTime - now);

    const timeLeft: TimeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };

    return {
        timeLeft,
        isStarted,
        isEnded,
        displayText
    };
};