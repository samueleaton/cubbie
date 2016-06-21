export default function generateUUID() {
  let timestamp = Date.now();
  if (typeof window === 'object' && window.performance && typeof window.performance.now === 'function')
    timestamp += performance.now();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const randChar = (timestamp + Math.random() * 16) % 16 | 0;
    timestamp = Math.floor(timestamp / 16);
    return (char === 'x' ? randChar : (randChar & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}
