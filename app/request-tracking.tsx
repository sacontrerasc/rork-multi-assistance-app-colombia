import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  CheckCircle2,
  Circle,
  Phone,
  MapPin,
  Clock,
  User,
  RefreshCw,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useRequests } from '@/contexts/RequestsContext';
import { useWip } from '@/contexts/WipContext';
import { RequestStatus } from '@/types';
import { WipServiceDetail } from '@/types/wip';

const STATUS_STEPS: { key: RequestStatus; label: string }[] = [
  { key: 'solicitado', label: 'Solicitud Recibida' },
  { key: 'validando', label: 'Validando Cobertura' },
  { key: 'proveedor_asignado', label: 'Proveedor Asignado' },
  { key: 'en_camino', label: 'En Camino' },
  { key: 'completado', label: 'Servicio Completado' },
];

const STATUS_ORDER: RequestStatus[] = ['solicitado', 'validando', 'proveedor_asignado', 'en_camino', 'completado'];

export default function RequestTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { requests, updateStatus, updateRequest } = useRequests();
  const { fetchServiceById, getWipLocalStatus } = useWip();
  const request = requests.find(r => r.id === id);

  const [wipDetail, setWipDetail] = useState<WipServiceDetail | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadWipStatus = useCallback(async () => {
    if (!request?.wipServiceId) return;
    setRefreshing(true);
    try {
      console.log('[RequestTracking] Fetching Wip service:', request.wipServiceId);
      const detail = await fetchServiceById(request.wipServiceId);
      setWipDetail(detail);

      const localStatus = getWipLocalStatus(detail.status);
      if (localStatus !== request.status) {
        console.log('[RequestTracking] Status changed:', request.status, '->', localStatus);
        void updateRequest(request.id, {
          status: localStatus,
          wipStatus: detail.status,
          providerName: detail.collaborator?.name ?? detail.supplier?.name ?? undefined,
        });
      }
    } catch (error) {
      console.log('[RequestTracking] Error fetching Wip status:', error);
    } finally {
      setRefreshing(false);
    }
  }, [request?.wipServiceId, request?.status, request?.id, fetchServiceById, getWipLocalStatus, updateRequest]);

  useEffect(() => {
    void loadWipStatus();
  }, [loadWipStatus]);

  if (!request) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <X color={Colors.textPrimary} size={22} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Solicitud no encontrada</Text>
        </View>
      </View>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(request.status);
  const isCancelled = request.status === 'cancelado';

  const handleCall = () => {
    if (request.providerPhone) {
      void Linking.openURL(`tel:${request.providerPhone}`);
    }
  };

  const handleCancel = () => {
    void updateStatus(request.id, 'cancelado');
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seguimiento</Text>
        {request.wipServiceId ? (
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => void loadWipStatus()}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color={Colors.primary} size="small" />
            ) : (
              <RefreshCw color={Colors.primary} size={20} />
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{request.serviceName}</Text>
          <View style={[
            styles.statusBadge,
            isCancelled && styles.statusCancelled,
          ]}>
            <Text style={[
              styles.statusBadgeText,
              isCancelled && styles.statusCancelledText,
            ]}>
              {isCancelled ? 'Cancelado' :
               request.status === 'completado' ? 'Completado' : 'En Progreso'}
            </Text>
          </View>
        </View>

        {request.wipServiceId && (
          <View style={styles.wipInfoCard}>
            <Text style={styles.wipInfoLabel}>ID Wip</Text>
            <Text style={styles.wipInfoValue} numberOfLines={1}>
              {request.wipExpedient ?? request.wipServiceId}
            </Text>
            {request.wipStatus && (
              <>
                <Text style={[styles.wipInfoLabel, { marginTop: 8 }]}>Estado Wip</Text>
                <Text style={styles.wipInfoValue}>{request.wipStatus}</Text>
              </>
            )}
          </View>
        )}

        <View style={styles.timeline}>
          {STATUS_STEPS.map((step, i) => {
            const isCompleted = !isCancelled && currentIndex >= i;
            const isCurrent = !isCancelled && currentIndex === i;
            return (
              <View key={step.key} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  {isCompleted ? (
                    <CheckCircle2
                      color={isCurrent ? Colors.primary : Colors.success}
                      size={22}
                    />
                  ) : (
                    <Circle color={Colors.border} size={22} />
                  )}
                  {i < STATUS_STEPS.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      isCompleted && styles.timelineLineActive,
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineLabel,
                    isCompleted && styles.timelineLabelActive,
                    isCurrent && styles.timelineLabelCurrent,
                  ]}>
                    {step.label}
                  </Text>
                  {isCurrent && request.estimatedArrival && (
                    <View style={styles.etaRow}>
                      <Clock color={Colors.warning} size={14} />
                      <Text style={styles.etaText}>
                        Llegada estimada: {request.estimatedArrival}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {(request.providerName || wipDetail?.collaborator?.name || wipDetail?.supplier?.name) && (
          <View style={styles.providerCard}>
            <View style={styles.providerInfo}>
              <View style={styles.providerAvatar}>
                <User color={Colors.white} size={20} />
              </View>
              <View>
                <Text style={styles.providerLabel}>Proveedor Asignado</Text>
                <Text style={styles.providerName}>
                  {request.providerName ?? wipDetail?.collaborator?.name ?? wipDetail?.supplier?.name}
                </Text>
              </View>
            </View>
            {request.providerPhone && (
              <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                <Phone color={Colors.white} size={18} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Detalles de la Solicitud</Text>
          <View style={styles.detailRow}>
            <MapPin color={Colors.textMuted} size={16} />
            <Text style={styles.detailText}>{request.location}</Text>
          </View>
          {request.description ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Descripción:</Text>
              <Text style={styles.detailText}>{request.description}</Text>
            </View>
          ) : null}
          <View style={styles.detailRow}>
            <Clock color={Colors.textMuted} size={16} />
            <Text style={styles.detailText}>{request.schedule}</Text>
          </View>
        </View>

        {wipDetail && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Información Wip</Text>
            {wipDetail.fromWhere?.address ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Origen:</Text>
                <Text style={styles.detailText}>
                  {wipDetail.fromWhere.address}, {wipDetail.fromWhere.city}
                </Text>
              </View>
            ) : null}
            {wipDetail.whereTo?.address ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Destino:</Text>
                <Text style={styles.detailText}>
                  {wipDetail.whereTo.address}, {wipDetail.whereTo.city}
                </Text>
              </View>
            ) : null}
            {wipDetail.provision?.estimated?.time ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tiempo estimado:</Text>
                <Text style={styles.detailText}>{wipDetail.provision.estimated.time}</Text>
              </View>
            ) : null}
            {wipDetail.totalValue > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Valor total:</Text>
                <Text style={styles.detailText}>
                  $ {wipDetail.totalValue.toLocaleString('es-CO')}
                </Text>
              </View>
            )}
          </View>
        )}

        {!isCancelled && request.status !== 'completado' && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
          >
            <Text style={styles.cancelBtnText}>Cancelar Solicitud</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  scrollContent: {
    padding: 20,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusCancelled: {
    backgroundColor: Colors.lightRed,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.success,
  },
  statusCancelledText: {
    color: Colors.danger,
  },
  wipInfoCard: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  wipInfoLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.secondary,
    opacity: 0.7,
  },
  wipInfoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.secondary,
    marginTop: 2,
  },
  timeline: {
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 30,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  timelineLineActive: {
    backgroundColor: Colors.success,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  timelineLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  timelineLabelActive: {
    color: Colors.textPrimary,
  },
  timelineLabelCurrent: {
    fontWeight: '700' as const,
    color: Colors.primary,
    fontSize: 15,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: Colors.lightYellow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  etaText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.warning,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  providerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  callBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.danger,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.danger,
  },
});
