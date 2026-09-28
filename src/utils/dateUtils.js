// Indian Standard Time (IST) & Date Utilities for RailPlan

export const formatISTDateTime = (date = new Date()) => {
  const options = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return new Intl.DateTimeFormat('en-IN', options).format(date).replace(',', ' •');
};

export const formatISTTimeOnly = (date = new Date()) => {
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  return new Intl.DateTimeFormat('en-IN', options).format(date);
};

export const calculateDurationMinutes = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  
  if (endMinutes < startMinutes) {
    // Overnight window
    endMinutes += 24 * 60;
  }
  
  return endMinutes - startMinutes;
};

export const formatDurationString = (minutes) => {
  if (!minutes || minutes <= 0) return '0 mins';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs} hrs`;
  return `${mins} mins`;
};
