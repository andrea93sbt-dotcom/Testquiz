export {};

declare global {
  interface Window {
    __controlsTest?: {
      getX: () => number;
      getY: () => number;
      getSpeed: () => number;
      getYaw: () => number;
      setKeys: (codes: string[]) => void;
    };
  }
}
