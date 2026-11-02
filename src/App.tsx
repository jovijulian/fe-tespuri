import { Toaster } from 'react-hot-toast';
import { EntitiesPage } from './pages/Entities';

export function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            fontSize: '12px',
            borderRadius: '6px',
            padding: '8px 12px',
          },
        }}
      />
      <EntitiesPage />
    </>
  );
}

export default App;
