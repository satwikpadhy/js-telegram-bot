const formatUptime = function(seconds) {
        const intervals = [
            { label: "year", seconds: 365 * 24 * 3600 },
            { label: "month", seconds: 30 * 24 * 3600 },
            { label: "day", seconds: 24 * 3600 },
            { label: "hour", seconds: 3600 },
            { label: "minute", seconds: 60 },
            { label: "second", seconds: 1 }
        ];

        for (const interval of intervals) {
            const value = Math.floor(seconds / interval.seconds);
            if (value >= 1) {
            return value === 1
                ? `${value} ${interval.label}`
                : `${value} ${interval.label}s`;
            }
        }
        return "0 seconds";
    }

export default formatUptime