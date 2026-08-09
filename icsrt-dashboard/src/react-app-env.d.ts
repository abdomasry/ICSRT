/// <reference types="react-scripts" />

import React from 'react';

declare module 'react-icons' {
  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
    className?: string;
    style?: React.CSSProperties;
  }
  export type IconType = (props: IconBaseProps) => JSX.Element;
}

declare module 'react-icons/lib/cjs/iconBase' {
  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
    className?: string;
    style?: React.CSSProperties;
  }
}

declare module 'react-icons/lib' {
  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
    className?: string;
    style?: React.CSSProperties;
  }
}
