import React from 'react';

export default function MoonTideIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <g>
        <circle cx="12" cy="12" r="10" fill="#23395d" />
        <path
          d="M16.8 15.5c-1.2.7-2.6 1.1-4.1 1.1-3.6 0-6.6-2.2-6.6-5 0-1.5 1.1-2.8 2.7-3.6"
          fill="#f4d35e"
        />
        <path
          d="M8.6 8.4a5.5 5.5 0 0 1 9 3.6c0 2.8-3 5-6.6 5-1.5 0-2.9-.4-4.1-1.1"
          fill="#fff"
        />
        <circle cx="15" cy="12" r="1" fill="#23395d" />
      </g>
    </svg>
  );
}
