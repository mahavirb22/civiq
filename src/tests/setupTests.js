import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader" />,
  X: () => <div data-testid="x" />,
  Check: () => <div data-testid="check" />,
  XOctagon: () => <div data-testid="xoctagon" />,
  RefreshCw: () => <div data-testid="refresh" />,
  Play: () => <div data-testid="play" />,
  Pause: () => <div data-testid="pause" />,
  Volume2: () => <div data-testid="volume" />,
  Search: () => <div data-testid="search" />,
  ExternalLink: () => <div data-testid="external" />,
  Calendar: () => <div data-testid="calendar" />,
  MapPin: () => <div data-testid="map" />,
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();
