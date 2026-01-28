import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
<meta name="description" content="Z-One Laptop Store: Tienda especializada en laptops y componentes de PC en Venezuela."></meta>
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);