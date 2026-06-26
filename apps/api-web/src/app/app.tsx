// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import openapi from '@egolia-uit/api/openapi' with { type: 'json' };
import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';

export function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log('API URL:', apiUrl);
  return (
    <div>
      <ApiReferenceReact
        configuration={{
          sources: [
            {
              content: openapi,
              default: true,
              title: 'Egolia API',
            },
          ],
          servers: apiUrl ? [{ url: apiUrl, name: 'API Server' }] : undefined,
          showOperationId: true,
          persistAuth: true,
          telemetry: false,
        }}
      />
    </div>
  );
}

export default App;
