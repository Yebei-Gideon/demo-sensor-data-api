import { useState, useMemo } from 'react';
import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

function App() {
  const [env, setEnv] = useState<'prod' | 'staging'>('prod');

  // Determine the active API URL
  const apiUrl = useMemo(() => {
    return env === 'prod'
      ? import.meta.env.VITE_PRODUCTION_API_URL
      : import.meta.env.VITE_STAGING_API_URL;
  }, [env]);

  // Real-time polling with SWR
  const { data, error } = useSWR(`${apiUrl}/get-sensor-data`, fetcher, {
    refreshInterval: 3000 // Polls every 3 seconds
  });

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="mr-2">Switch Environment:</label>
        <select
          className="p-2 border rounded"
          value={env}
          onChange={(e) => setEnv(e.target.value as 'prod' | 'staging')}
        >
          <option value="prod">Production</option>
          <option value="staging">Staging</option>
        </select>
      </div>

      <h1>Sensor Data: {env.toUpperCase()}</h1>
      {error ? <p>Error loading data</p> : !data ? <p>Loading...</p> : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

export default App;
