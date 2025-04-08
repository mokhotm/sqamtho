import React from "react";

// A reusable South African-inspired pattern component
export function SouthAfricanPattern({ className }: { className?: string }) {
  return (
    <div className={`sa-pattern-top ${className || ""}`}></div>
  );
}

// A smaller accent pattern
export function SouthAfricanAccent({ className }: { className?: string }) {
  return (
    <div className={`sa-pattern-accent ${className || ""}`}></div>
  );
}
