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
        <g clipPath="url(#clip0_logo)">
          {/* South African flag-inspired background shape */}
          <path
            d="M50 0C22.4 0 0 22.4 0 50C0 77.6 22.4 100 50 100C77.6 100 100 77.6 100 50C100 22.4 77.6 0 50 0Z"
            fill="#111827"
          />
          
          {/* Triangle accent reminiscent of SA flag shape */}
          <path
            d="M0 50L35 15H65L30 50L65 85H35L0 50Z"
            fill={accent}
            fillOpacity="0.7"
          />
          
          {/* Letter S stylized */}
          <path
            d="M39 30C39 30 32 32 32 39C32 46 39 48 39 48C39 48 46 50 46 57C46 64 39 66 39 66C39 66 32 66 30 60"
            stroke={primary}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Dynamic swoosh element */}
          <path
            d="M50 25C50 25 70 35 70 50C70 65 50 75 50 75"
            stroke={secondary}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Dot element */}
          <circle cx="75" cy="50" r="6" fill={primary} />
        </g>
        <defs>
          <clipPath id="clip0_logo">
            <rect width="100" height="100" fill="white" />
          </clipPath>
        </defs>
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
        <g clipPath="url(#clip0_logo_animated)">
          {/* South African flag-inspired background shape */}
          <path
            d="M50 0C22.4 0 0 22.4 0 50C0 77.6 22.4 100 50 100C77.6 100 100 77.6 100 50C100 22.4 77.6 0 50 0Z"
            fill="#111827"
          >
            <animate
              attributeName="opacity"
              values="1;0.9;1"
              dur="4s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Triangle accent reminiscent of SA flag shape */}
          <path
            d="M0 50L35 15H65L30 50L65 85H35L0 50Z"
            fill={accent}
            fillOpacity="0.7"
          >
            <animate
              attributeName="fill-opacity"
              values="0.7;0.5;0.7"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Letter S stylized */}
          <path
            d="M39 30C39 30 32 32 32 39C32 46 39 48 39 48C39 48 46 50 46 57C46 64 39 66 39 66C39 66 32 66 30 60"
            stroke={primary}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <animate
              attributeName="stroke-width"
              values="8;9;8"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Dynamic swoosh element */}
          <path
            d="M50 25C50 25 70 35 70 50C70 65 50 75 50 75"
            stroke={secondary}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <animate
              attributeName="d"
              values="M50 25C50 25 70 35 70 50C70 65 50 75 50 75;M50 25C50 25 72 38 72 50C72 62 50 75 50 75;M50 25C50 25 70 35 70 50C70 65 50 75 50 75"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Dot element */}
          <circle cx="75" cy="50" r="6" fill={primary}>
            <animate
              attributeName="r"
              values="6;7;6"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
        <defs>
          <clipPath id="clip0_logo_animated">
            <rect width="100" height="100" fill="white" />
          </clipPath>
        </defs>
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