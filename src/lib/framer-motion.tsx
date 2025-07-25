import React from 'react';

// Simple stubs for framer-motion components used in the project

const createComponent = (Tag: keyof JSX.IntrinsicElements) =>
  React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>((props, ref) =>
    React.createElement(Tag, { ref, ...props }, props.children)
  );

export const motion = {
  div: createComponent('div'),
};

export const AnimatePresence: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => (
  <>{children}</>
);

