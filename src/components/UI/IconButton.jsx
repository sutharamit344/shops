import React from "react";
import Button from "./Button";

const IconButton = ({ icon: Icon, onClick, variant = "primary", className = "", ...props }) => {
  // Map IconButton variants to core Button variants
  const variantMap = {
    primary: "primary",
    navy: "dark",
    red: "ghost", // We'll style red separately if needed
    white: "outline",
    ghost: "ghost"
  };

  return (
    <Button
      type="button"
      variant={variantMap[variant] || "primary"}
      onClick={onClick}
      className={`!p-2.5 !rounded-full shadow-md ${variant === 'red' ? '!bg-red-500 !text-white hover:!bg-red-600' : ''} ${className}`}
      {...props}
    >
      <Icon size={18} />
    </Button>
  );
};

export default IconButton;
