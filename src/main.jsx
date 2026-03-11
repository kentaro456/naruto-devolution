import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { GameUIProvider } from './context/GameUIContext';
import { ensureUIBridge } from './lib/uiBridge';

ensureUIBridge();
createRoot(document.getElementById('root')).render(
  <GameUIProvider>
    <App />
  </GameUIProvider>,
);
