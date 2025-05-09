"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PaymentButtonProps {
  email: string;
  password: string;
  className?: string;
}

export const PaymentButton = ({
  email,
  password,
  className,
}: PaymentButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!email || !password) {
      console.error("Email and password are required");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/payment/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initialize payment");
      }

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      className={className}
      disabled={isLoading || !email || !password}
      type="button"
    >
      {isLoading ? "Processing..." : "Proceed to payment"}
    </Button>
  );
};