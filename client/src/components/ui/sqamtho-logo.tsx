import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  primary?: string;
  secondary?: string;
  accent?: string;
  textColor?: string;
}

export function SqamthoLogo({
  className = "",
  size = 40,
  showText = true,
  primary = "#FF7722",
  secondary = "#00AAEE",
  accent = "#FFEB3B",
  textColor = "currentColor",
}: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        {/* Beautiful background gradient circle */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={secondary} stopOpacity="0.8" />
          </linearGradient>
          
          {/* Shine effect */}
          <radialGradient id="shineGradient" cx="30%" cy="30%" r="60%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Main circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="50" 
          fill="url(#bgGradient)" 
        />
        
        {/* Shine overlay */}
        <circle 
          cx="50" 
          cy="50" 
          r="48" 
          fill="url(#shineGradient)" 
        />
        
        {/* South African inspired patterns - beadwork inspired symbols */}
        <path 
          d="M50 15 
            A35 35 0 0 1 85 50 
            A35 35 0 0 1 50 85 
            A35 35 0 0 1 15 50 
            A35 35 0 0 1 50 15 Z"
          stroke={accent}
          strokeWidth="2"
          strokeDasharray="1,3"
          fill="none"
        />
        
        {/* Elegant S for Sqamtho */}
        <path
          d="M40 30 
            C40 30 30 35 30 45
            C30 55 45 55 45 55
            C45 55 60 55 60 65
            C60 75 50 80 50 80
            C50 80 40 80 35 70"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Decorative accent dots inspired by African beadwork */}
        <circle cx="25" cy="40" r="3" fill={accent} />
        <circle cx="25" cy="60" r="3" fill={accent} />
        <circle cx="75" cy="40" r="3" fill={accent} />
        <circle cx="75" cy="60" r="3" fill={accent} />
        
        {/* Central decorative element inspired by traditional patterns */}
        <path
          d="M50 42
            L54 50
            L50 58
            L46 50
            Z"
          fill="white"
        />
      </svg>
      
      {showText && (
        <span 
          className="font-bold font-poppins text-xl tracking-wide"
          style={{ color: textColor }}
        >
          Sqamtho
        </span>
      )}
    </div>
  );
}

export function SqamthoLogoAnimated({
  className = "",
  size = 40,
  showText = true,
  primary = "#FF7722",
  secondary = "#00AAEE",
  accent = "#FFEB3B",
  textColor = "currentColor",
}: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        <defs>
          <linearGradient id="bgGradientAnim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primary} stopOpacity="0.8">
              <animate
                attributeName="stop-opacity"
                values="0.8;0.9;0.8"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor={secondary} stopOpacity="0.8">
              <animate
                attributeName="stop-opacity"
                values="0.8;0.9;0.8"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
          
          {/* Animated shine effect */}
          <radialGradient id="shineGradientAnim" cx="30%" cy="30%" r="60%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="white" stopOpacity="0.6">
              <animate
                attributeName="stop-opacity"
                values="0.6;0.8;0.6"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Main circle with animation */}
        <circle 
          cx="50" 
          cy="50" 
          r="50" 
          fill="url(#bgGradientAnim)"
        />
        
        {/* Shine overlay with animation */}
        <circle 
          cx="50" 
          cy="50" 
          r="48" 
          fill="url(#shineGradientAnim)"
        >
          <animate
            attributeName="r"
            values="48;46;48"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* South African inspired patterns - beadwork inspired symbols */}
        <path 
          d="M50 15 
            A35 35 0 0 1 85 50 
            A35 35 0 0 1 50 85 
            A35 35 0 0 1 15 50 
            A35 35 0 0 1 50 15 Z"
          stroke={accent}
          strokeWidth="2"
          strokeDasharray="1,3"
          fill="none"
        >
          <animate
            attributeName="stroke-dasharray"
            values="1,3;1,4;1,3"
            dur="6s"
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="20s"
            repeatCount="indefinite"
          />
        </path>
        
        {/* Elegant S for Sqamtho with subtle animation */}
        <path
          d="M40 30 
            C40 30 30 35 30 45
            C30 55 45 55 45 55
            C45 55 60 55 60 65
            C60 75 50 80 50 80
            C50 80 40 80 35 70"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <animate
            attributeName="stroke-width"
            values="6;7;6"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
        
        {/* Decorative accent dots inspired by African beadwork */}
        <circle cx="25" cy="40" r="3" fill={accent}>
          <animate
            attributeName="r"
            values="3;4;3"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="25" cy="60" r="3" fill={accent}>
          <animate
            attributeName="r"
            values="3;3.5;3"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="75" cy="40" r="3" fill={accent}>
          <animate
            attributeName="r"
            values="3;3.5;3"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="75" cy="60" r="3" fill={accent}>
          <animate
            attributeName="r"
            values="3;4;3"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Central decorative element inspired by traditional patterns */}
        <path
          d="M50 42
            L54 50
            L50 58
            L46 50
            Z"
          fill="white"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="-360 50 50"
            dur="15s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      
      {showText && (
        <span 
          className="font-bold font-poppins text-xl tracking-wide relative"
          style={{ color: textColor }}
        >
          Sqamtho
          <span 
            className="absolute bottom-0 left-0 w-0 h-0.5 animate-expand-width"
            style={{ 
              background: `linear-gradient(to right, ${primary}, ${secondary})` 
            }}
          ></span>
        </span>
      )}
    </div>
  );
}

// Add this to your index.css instead of using inline styles
// The animation is now defined in CSS in the index.css file

export const SqamthoLogoWithStyle = (props: LogoProps) => (
  <SqamthoLogoAnimated {...props} />
);