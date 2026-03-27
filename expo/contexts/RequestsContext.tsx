import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { AssistanceRequest } from '@/types';
import { sampleRequests } from '@/mocks/requests';

export const [RequestsProvider, useRequests] = createContextHook(() => {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('assistance_requests');
        if (stored) {
          setRequests(JSON.parse(stored));
        } else {
          setRequests(sampleRequests);
          void AsyncStorage.setItem('assistance_requests', JSON.stringify(sampleRequests));
        }
      } catch (e) {
        console.log('[RequestsContext] Load error:', e);
        setRequests(sampleRequests);
      }
    };
    void load();
  }, []);

  const addRequest = useCallback(async (request: AssistanceRequest) => {
    setRequests(prev => {
      const updated = [request, ...prev];
      AsyncStorage.setItem('assistance_requests', JSON.stringify(updated)).catch(e =>
        console.log('[RequestsContext] Save error:', e)
      );
      return updated;
    });
  }, []);

  const updateStatus = useCallback(async (id: string, status: AssistanceRequest['status']) => {
    setRequests(prev => {
      const updated = prev.map(r =>
        r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
      );
      AsyncStorage.setItem('assistance_requests', JSON.stringify(updated)).catch(e =>
        console.log('[RequestsContext] Save error:', e)
      );
      return updated;
    });
  }, []);

  const updateRequest = useCallback(async (id: string, data: Partial<AssistanceRequest>) => {
    setRequests(prev => {
      const updated = prev.map(r =>
        r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
      );
      AsyncStorage.setItem('assistance_requests', JSON.stringify(updated)).catch(e =>
        console.log('[RequestsContext] Save error:', e)
      );
      return updated;
    });
  }, []);

  const activeRequests = requests.filter(
    r => !['completado', 'cancelado'].includes(r.status)
  );
  const completedRequests = requests.filter(
    r => ['completado', 'cancelado'].includes(r.status)
  );

  return useMemo(() => ({
    requests, activeRequests, completedRequests, addRequest, updateStatus, updateRequest,
  }), [requests, activeRequests, completedRequests, addRequest, updateStatus, updateRequest]);
});
