import { createRoot } from 'react-dom/client';
import App from './App';
import { GameUIProvider } from './context/GameUIContext';
import { ensureUIBridge } from './lib/uiBridge';

ensureUIBridge();
createRoot(document.getElementById('root')).render(
  <GameUIProvider>
    <App />
  </GameUIProvider>,
);
