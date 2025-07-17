import React from 'react';
import { ReactComponent as MoonTideSvg } from '../assets/MoonTideIcon.svg';

/**
 * Re-exports the SVG file as a React component.
 * Usage elsewhere stays exactly the same:
 *   <MoonTideIcon width={48} height={48} />
 */
export default function MoonTideIcon(
  props: React.SVGProps<SVGSVGElement>
): JSX.Element {
  return <MoonTideSvg {...props} />;
}
