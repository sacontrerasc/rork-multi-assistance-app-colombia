import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  BellOff,
  ChevronLeft,
  CheckCheck,
  Trash2,
  ClipboardList,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useRequests } from '@/contexts/RequestsContext';

interface AppNotification {
  id: string;
  type: 'service' | 'promo' | 'system' | 'request';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  color: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

function groupNotifications(notifications: AppNotification[]): { title: string; data: AppNotification[] }[] {
  const now = new Date();
  const today: AppNotification[] = [];
  const yesterday: AppNotification[] = [];
  const earlier: AppNotification[] = [];

  notifications.forEach(n => {
    const date = new Date(n.createdAt);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 1) {
      today.push(n);
    } else if (diffDays < 2) {
      yesterday.push(n);
    } else {
      earlier.push(n);
    }
  });

  const groups: { title: string; data: AppNotification[] }[] = [];
  if (today.length > 0) groups.push({ title: 'Hoy', data: today });
  if (yesterday.length > 0) groups.push({ title: 'Ayer', data: yesterday });
  if (earlier.length > 0) groups.push({ title: 'Anteriores', data: earlier });
  return groups;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { activeRequests } = useRequests();

  const requestNotifications: AppNotification[] = activeRequests.map(req => ({
    id: `notif_${req.id}`,
    type: 'request' as const,
    title: req.serviceName,
    message: `Estado: ${req.status === 'en_camino' ? 'En camino' : req.status === 'proveedor_asignado' ? 'Proveedor asignado' : req.status === 'validando' ? 'Validando' : 'Solicitado'}${req.providerName ? ` - ${req.providerName}` : ''}`,
    read: false,
    createdAt: req.updatedAt,
    color: '#3B82F6',
  }));

  const [notifications, setNotifications] = useState<AppNotification[]>(requestNotifications);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setNotifications(requestNotifications);
  }, [activeRequests.length]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const groups = groupNotifications(notifications);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const renderNotification = (notification: AppNotification) => {
    const typeLabel =
      notification.type === 'service' ? 'Servicio' :
      notification.type === 'promo' ? 'Promoción' :
      notification.type === 'request' ? 'Solicitud' : 'Sistema';

    return (
      <Animated.View
        key={notification.id}
        style={[
          styles.notificationCard,
          !notification.read && styles.notificationCardUnread,
          { opacity: fadeAnim },
        ]}
      >
        <TouchableOpacity
          style={styles.notificationTouchable}
          activeOpacity={0.7}
          onPress={() => markAsRead(notification.id)}
          testID={`notification-${notification.id}`}
        >
          <View style={[styles.iconCircle, { backgroundColor: notification.color + '18' }]}>
            <ClipboardList color={notification.color} size={20} />
            {!notification.read && <View style={styles.unreadDot} />}
          </View>
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={styles.typeLabel} numberOfLines={1}>
                {typeLabel}
              </Text>
              <Text style={styles.timeText}>{timeAgo(notification.createdAt)}</Text>
            </View>
            <Text style={[
              styles.notificationTitle,
              !notification.read && styles.notificationTitleUnread,
            ]} numberOfLines={1}>
              {notification.title}
            </Text>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteNotification(notification.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 color={Colors.textMuted} size={14} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft color={Colors.textPrimary} size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Notificaciones</Text>
            {unreadCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {unreadCount > 0 ? (
            <TouchableOpacity
              style={styles.markAllBtn}
              onPress={markAllAsRead}
              activeOpacity={0.7}
            >
              <CheckCheck color={Colors.primary} size={20} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <BellOff color={Colors.textMuted} size={48} />
          </View>
          <Text style={styles.emptyTitle}>Sin notificaciones</Text>
          <Text style={styles.emptyText}>
            Cuando tengas actualizaciones sobre tus servicios, aparecerán aquí.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {unreadCount > 0 && (
            <View style={styles.summaryBar}>
              <Bell color={Colors.primary} size={16} />
              <Text style={styles.summaryText}>
                Tienes <Text style={styles.summaryBold}>{unreadCount}</Text> notificación{unreadCount !== 1 ? 'es' : ''} sin leer
              </Text>
            </View>
          )}

          {groups.map((group) => (
            <View key={group.title} style={styles.group}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              {group.data.map((n) => renderNotification(n))}
            </View>
          ))}

          <View style={{ height: insets.bottom + 30 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  headerBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  markAllBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryBold: {
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  group: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notificationCardUnread: {
    backgroundColor: '#F0FFF7',
    borderColor: Colors.primary + '30',
  },
  notificationTouchable: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative' as const,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  notificationTitleUnread: {
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  notificationMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
});
