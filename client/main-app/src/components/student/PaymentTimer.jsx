import { useEffect, useState } from "react";

export default function PaymentTimer({ createdAt }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const created = new Date(createdAt);
      const expiryTime = new Date(created.getTime() + 30 * 60 * 1000); // 30 minutes
      const now = new Date();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setExpired(true);
        return null;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      return { minutes, seconds };
    };

    const timer = setInterval(() => {
      const time = calculateTimeLeft();
      setTimeLeft(time);
    }, 1000);

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [createdAt]);

  if (expired) {
    return <span className="text-red-500 text-sm font-medium">Expired</span>;
  }

  if (!timeLeft) {
    return null;
  }

  return (
    <span className="text-orange-500 text-sm font-medium">
      Expires in {timeLeft.minutes.toString().padStart(2, "0")}:
      {timeLeft.seconds.toString().padStart(2, "0")}
    </span>
  );
}
