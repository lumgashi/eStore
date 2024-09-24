export const generateOrderId = (): number => {
  // Get the current timestamp and add random digits
  const timestamp = Date.now().toString(); // Timestamp in milliseconds
  const randomPart = Math.floor(Math.random() * 9_000 + 1_000).toString(); // 4 random digits
  return Number(timestamp + randomPart);
};
