import { useState, useEffect, useCallback } from 'react';
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
          await AsyncStorage.setItem('assistance_requests', JSON.stringify(sampleRequests));
        }
      } catch (e) {
        console.log('Requests load error:', e);
        setRequests(sampleRequests);
      }
    };
    load();
  }, []);

  const addRequest = useCallback(async (request: AssistanceRequest) => {
    const updated = [request, ...requests];
    setRequests(updated);
    await AsyncStorage.setItem('assistance_requests', JSON.stringify(updated));
  }, [requests]);

  const updateStatus = useCallback(async (id: string, status: AssistanceRequest['status']) => {
    const updated = requests.map(r =>
      r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
    );
    setRequests(updated);
    await AsyncStorage.setItem('assistance_requests', JSON.stringify(updated));
  }, [requests]);

  const activeRequests = requests.filter(
    r => !['completado', 'cancelado'].includes(r.status)
  );
  const completedRequests = requests.filter(
    r => ['completado', 'cancelado'].includes(r.status)
  );

  return { requests, activeRequests, completedRequests, addRequest, updateStatus };
});
