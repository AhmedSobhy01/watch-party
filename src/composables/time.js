const formatTimeFromSeconds = (timeInSeconds) => {
    const totalSeconds = Math.round(timeInSeconds);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const padTime = (timeUnit) => timeUnit.toString().padStart(2, "0");

    const formattedHours = padTime(hours);
    const formattedMinutes = padTime(minutes);
    const formattedSeconds = padTime(seconds);

    return hours > 0 ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}` : `${formattedMinutes}:${formattedSeconds}`;
};

export { formatTimeFromSeconds };
