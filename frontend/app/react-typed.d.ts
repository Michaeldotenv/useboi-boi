declare module 'react-typed' {
    import * as React from 'react';
  
    interface TypedProps {
      strings: string[];
      typeSpeed?: number;
      backSpeed?: number;
      loop?: boolean;
      smartBackspace?: boolean;
      shuffle?: boolean;
      backDelay?: number;
      fadeOut?: boolean;
      fadeOutDelay?: number;
      showCursor?: boolean;
      cursorChar?: string;
      attr?: string;
      bindInputFocusEvents?: boolean;
      contentType?: 'html' | 'text';
      onComplete?: () => void;
      preStringTyped?: (arrayPos: number) => void;
      onStringTyped?: (arrayPos: number) => void;
      onLastStringBackspaced?: () => void;
      onTypingPaused?: (arrayPos: number) => void;
      onTypingResumed?: (arrayPos: number) => void;
      onReset?: () => void;
      onStop?: (arrayPos: number) => void;
      onStart?: (arrayPos: number) => void;
      onDestroy?: () => void;
    }
  
    class Typed extends React.Component<TypedProps> {}
  
    export default Typed;
  }
  