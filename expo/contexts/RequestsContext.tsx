import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { AssistanceRequest } from '@/types';

export const [RequestsProvider, useRequests] = createContextHook(() => {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const STORAGE_VERSION = 'v2_prod';
        const currentVersion = await AsyncStorage.getItem('assistance_requests_version');
        if (currentVersion !== STORAGE_VERSION) {
          await AsyncStorage.removeItem('assistance_requests');
          await AsyncStorage.setItem('assistance_requests_version', STORAGE_VERSION);
          setRequests([]);
          return;
        }
        const stored = await AsyncStorage.getItem('assistance_requests');
        if (stored) {
          setRequests(JSON.parse(stored));
        }
      } catch (_e) {
        // Load error
      }
    };
    void load();
  }, []);

  const addRequest = useCallback(async (request: AssistanceRequest) => {
    setRequests(prev => {
      const updated = [request, ...prev];
      AsyncStorage.setItem('assistance_requests', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const updateStatus = useCallback(async (id: string, status: AssistanceRequest['status']) => {
    setRequests(prev => {
      const updated = prev.map(r =>
        r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
      );
      AsyncStorage.setItem('assistance_requests', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const updateRequest = useCallback(async (id: string, data: Partial<AssistanceRequest>) => {
    setRequests(prev => {
      const updated = prev.map(r =>
        r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
      );
      AsyncStorage.setItem('assistance_requests', JSON.stringify(updated)).catch(() => {});
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
