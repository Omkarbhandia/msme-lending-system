import { useState, useEffect, useRef } from 'react';
import { getApplication } from '../api/client';

/**
 * Custom hook that polls the application status endpoint until status is DONE or FAILED.
 * Cleans up the interval automatically.
 *
 * @param {string|null} applicationId
 * @param {number} intervalMs - polling interval in milliseconds (default: 2000)
 * @returns {{ status, loading, error }}
 */
const usePolling = (applicationId, intervalMs = 2000) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!applicationId) return;

    setLoading(true);
    setError(null);

    const poll = async () => {
      try {
        const response = await getApplication(applicationId);
        const appStatus = response.data.status;
        setStatus(appStatus);

        if (appStatus === 'DONE' || appStatus === 'FAILED') {
          clearInterval(intervalRef.current);
          setLoading(false);
        }
      } catch (err) {
        clearInterval(intervalRef.current);
        setError(err.message);
        setLoading(false);
      }
    };

    poll(); // immediate first call
    intervalRef.current = setInterval(poll, intervalMs);

    return () => clearInterval(intervalRef.current);
  }, [applicationId, intervalMs]);

  return { status, loading, error };
};

export default usePolling;
