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

function getCurrentTime() {
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return `${hours}:${minutes} ${ampm}`;
}

export { formatTimeFromSeconds, getCurrentTime };
