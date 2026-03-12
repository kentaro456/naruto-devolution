import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { GameUIProvider } from './context/GameUIContext';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing #root mount node.');
}

createRoot(root).render(
  <GameUIProvider>
    <App />
  </GameUIProvider>,
);
