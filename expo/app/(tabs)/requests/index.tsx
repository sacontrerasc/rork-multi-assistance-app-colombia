import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ClipboardList,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Search,
  AlertCircle,
  LogIn,
  Lock,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useRequests } from '@/contexts/RequestsContext';
import { useAuth } from '@/contexts/AuthContext';
import { RequestStatus } from '@/types';

const statusConfig: Record<RequestStatus, { label: string; color: string; icon: React.ComponentType<{ color: string; size: number }> }> = {
  solicitado: { label: 'Solicitado', color: Colors.secondary, icon: Clock },
  validando: { label: 'Validando', color: Colors.warning, icon: Search },
  proveedor_asignado: { label: 'Proveedor Asignado', color: Colors.primary, icon: AlertCircle },
  en_camino: { label: 'En Camino', color: '#8B5CF6', icon: Truck },
  completado: { label: 'Completado', color: Colors.success, icon: CheckCircle2 },
  cancelado: { label: 'Cancelado', color: Colors.danger, icon: XCircle },
};

type TabKey = 'active' | 'completed';

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { activeRequests, completedRequests } = useRequests();
  const [tab, setTab] = useState<TabKey>('active');

  const displayRequests = tab === 'active' ? activeRequests : completedRequests;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.headerTitle}>Mis Solicitudes</Text>
          <Text style={styles.headerSubtitle}>Gestiona tus servicios</Text>
        </View>

        <View style={styles.guestContent}>
          <View style={styles.guestIconContainer}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.guestIconGradient}
            >
              <Lock color={Colors.white} size={40} />
            </LinearGradient>
          </View>

          <Text style={styles.guestTitle}>Acceso Restringido</Text>
          <Text style={styles.guestText}>
            Para ver y gestionar tus solicitudes de servicio, necesitas iniciar sesión en tu cuenta.
          </Text>

          <View style={styles.guestFeatures}>
            <View style={styles.guestFeature}>
              <Clock color={Colors.primary} size={18} />
              <Text style={styles.guestFeatureText}>Seguimiento en tiempo real</Text>
            </View>
            <View style={styles.guestFeature}>
              <CheckCircle2 color={Colors.primary} size={18} />
              <Text style={styles.guestFeatureText}>Historial de servicios</Text>
            </View>
            <View style={styles.guestFeature}>
              <AlertCircle color={Colors.primary} size={18} />
              <Text style={styles.guestFeatureText}>Notificaciones de estado</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.loginBtnGradient}
            >
              <LogIn color={Colors.white} size={20} />
              <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.7}
          >
            <Text style={styles.registerBtnText}>Crear Cuenta Nueva</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Mis Solicitudes</Text>
        <Text style={styles.headerSubtitle}>
          {activeRequests.length} activa{activeRequests.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'active' && styles.tabBtnActive]}
          onPress={() => setTab('active')}
        >
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>
            Activas ({activeRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'completed' && styles.tabBtnActive]}
          onPress={() => setTab('completed')}
        >
          <Text style={[styles.tabText, tab === 'completed' && styles.tabTextActive]}>
            Historial ({completedRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {displayRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <ClipboardList color={Colors.textMuted} size={48} />
            <Text style={styles.emptyTitle}>
              {tab === 'active' ? 'Sin solicitudes activas' : 'Sin historial'}
            </Text>
            <Text style={styles.emptyText}>
              {tab === 'active'
                ? 'Cuando solicites un servicio, aparecerá aquí'
                : 'Tu historial de solicitudes aparecerá aquí'}
            </Text>
          </View>
        ) : (
          displayRequests.map(req => {
            const config = statusConfig[req.status];
            const StatusIcon = config.icon;
            return (
              <TouchableOpacity
                key={req.id}
                style={styles.requestCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/request-tracking?id=${req.id}`)}
              >
                <View style={styles.requestTop}>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestService}>{req.serviceName}</Text>
                    <Text style={styles.requestDate}>{formatDate(req.createdAt)}</Text>
                  </View>
                  <View style={[styles.statusChip, { backgroundColor: config.color + '15' }]}>
                    <StatusIcon color={config.color} size={12} />
                    <Text style={[styles.statusChipText, { color: config.color }]}>
                      {config.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestBottom}>
                  <Text style={styles.requestLocation} numberOfLines={1}>
                    📍 {req.location}
                  </Text>
                  <ChevronRight color={Colors.textMuted} size={16} />
                </View>

                {req.providerName && (
                  <View style={styles.providerRow}>
                    <View style={styles.providerDot} />
                    <Text style={styles.providerText}>{req.providerName}</Text>
                    {req.estimatedArrival && (
                      <Text style={styles.etaChip}>⏱ {req.estimatedArrival}</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: Colors.white,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  scrollContent: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  requestCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requestTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
    marginRight: 12,
  },
  requestService: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  requestBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  providerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  providerText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  etaChip: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.warning,
    backgroundColor: Colors.lightYellow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  guestContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestIconContainer: {
    marginBottom: 24,
  },
  guestIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  guestText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  guestFeatures: {
    width: '100%',
    gap: 14,
    marginBottom: 32,
  },
  guestFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guestFeatureText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  loginBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loginBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  registerBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  registerBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
});
