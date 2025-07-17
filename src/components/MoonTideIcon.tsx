import React from 'react';
import iconPath from '../assets/MoonTideIcon.svg';

/**
 * Renders the Moon-Tide logo SVG as an <img>.
 * Keeps the same <MoonTideIcon {...props} /> interface.
 */
export default function MoonTideIcon(
  props: React.ImgHTMLAttributes<HTMLImageElement>
): JSX.Element {
  return <img src={iconPath} alt="Moon-Tide logo" {...props} />;
}
