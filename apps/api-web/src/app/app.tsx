// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import '@scalar/api-reference-react/style.css';

import openapi from '@egolia-uit/api/openapi' with { type: 'json' };
import { ApiReferenceReact } from '@scalar/api-reference-react';

export function App() {
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
          persistAuth: true,
          telemetry: false,
        }}
      />
    </div>
  );
}

export default App;
