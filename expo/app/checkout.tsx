import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import {
  X,
  CreditCard,
  Landmark,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { usePayments } from '@/hooks/usePayments';
import type { PaymentServiceId } from '@/types/payments';

type PaymentService = PaymentServiceId;

type Method = { id: PaymentService; name: string; description: string; icon: React.ComponentType<{ color: string; size: number }> };

const METHODS: Method[] = [
  { id: 1, name: 'Tarjeta de crédito/débito', description: 'Visa, Mastercard, Amex', icon: CreditCard },
  { id: 2, name: 'PSE', description: 'Débito desde tu banco', icon: Landmark },
  { id: 4, name: 'Efectivo', description: 'Baloto, Efecty, corresponsales', icon: Banknote },
];

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{
    amount?: string;
    description?: string;
    itemId?: string;
    itemType?: string;
  }>();

  const amount = useMemo<number>(() => {
    const n = Number(params.amount ?? '0');
    return Number.isFinite(n) ? n : 0;
  }, [params.amount]);

  const description = useMemo<string>(() => {
    return (params.description as string) || 'Compra CLtiene';
  }, [params.description]);

  const [selectedMethod, setSelectedMethod] = useState<PaymentService>(1);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const { startPaymentLink, loading, isConfigured } = usePayments();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace({ pathname: '/(auth)/login', params: { redirect: '/checkout' } });
    }
  }, [isAuthenticated]);

  const handlePay = async () => {
    if (!isConfigured) {
      Alert.alert('Pasarela no configurada', 'Falta configurar las credenciales de Payments.');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Monto inválido', 'El monto a pagar debe ser mayor que cero.');
      return;
    }
    if (!user?.email) {
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para pagar.');
      return;
    }
    try {
      const result = await startPaymentLink({
        amount,
        description,
        service: selectedMethod,
        customerEmail: user.email,
        customerName: user.name,
      });
      if (result.paymentUrl) setPaymentUrl(result.paymentUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo iniciar el pago';
      Alert.alert('Error al crear el pago', msg);
    }
  };

  const formattedAmount = `$ ${amount.toLocaleString('es-CO')} COP`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} testID="checkout-close">
          <X color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pago seguro</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total a pagar</Text>
          <Text style={styles.summaryAmount}>{formattedAmount}</Text>
          <Text style={styles.summaryDesc} numberOfLines={3}>{description}</Text>
          {user?.email ? (
            <View style={styles.userRow}>
              <Text style={styles.userLabel}>Cliente:</Text>
              <Text style={styles.userValue} numberOfLines={1}>{user.name ?? user.email}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Método de pago</Text>
        {METHODS.map(m => {
          const Icon = m.icon;
          const active = selectedMethod === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              style={[styles.methodCard, active && styles.methodCardActive]}
              activeOpacity={0.8}
              onPress={() => setSelectedMethod(m.id)}
              testID={`method-${m.id}`}
            >
              <View style={[styles.methodIcon, active && styles.methodIconActive]}>
                <Icon color={active ? Colors.white : Colors.primary} size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodName}>{m.name}</Text>
                <Text style={styles.methodDesc}>{m.description}</Text>
              </View>
              {active && <CheckCircle2 color={Colors.primary} size={20} />}
            </TouchableOpacity>
          );
        })}

        <View style={styles.secureRow}>
          <ShieldCheck color={Colors.success} size={16} />
          <Text style={styles.secureText}>
            Pago procesado de forma segura por la pasarela Payments.
          </Text>
        </View>

        {paymentUrl && (
          <TouchableOpacity
            style={styles.reopenBtn}
            activeOpacity={0.8}
            onPress={async () => {
              if (Platform.OS === 'web') {
                if (typeof window !== 'undefined') window.open(paymentUrl, '_blank');
              } else {
                await WebBrowser.openBrowserAsync(paymentUrl);
              }
            }}
          >
            <ExternalLink color={Colors.secondary} size={16} />
            <Text style={styles.reopenText}>Volver a abrir el link de pago</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.payBtn}
          activeOpacity={0.85}
          onPress={handlePay}
          disabled={loading}
          testID="pay-btn"
        >
          <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.payBtnGradient}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <CreditCard color={Colors.white} size={18} />
                <Text style={styles.payBtnText}>Pagar {formattedAmount}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.textPrimary },
  scrollContent: { padding: 20, paddingBottom: 40 },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  summaryLabel: { fontSize: 13, color: Colors.textMuted, marginBottom: 6 },
  summaryAmount: { fontSize: 32, fontWeight: '800' as const, color: Colors.primary, marginBottom: 8 },
  summaryDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  userRow: {
    flexDirection: 'row', gap: 6, marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  userLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' as const },
  userValue: { fontSize: 13, color: Colors.textPrimary, fontWeight: '600' as const, flex: 1 },
  sectionTitle: {
    fontSize: 15, fontWeight: '700' as const, color: Colors.textPrimary, marginBottom: 12,
  },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    marginBottom: 10,
  },
  methodCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  methodIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center', justifyContent: 'center',
  },
  methodIconActive: { backgroundColor: Colors.primary },
  methodName: { fontSize: 14, fontWeight: '700' as const, color: Colors.textPrimary },
  methodDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  secureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 14, padding: 12,
    backgroundColor: Colors.lightGreen,
    borderRadius: 12,
  },
  secureText: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  reopenBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 16, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.secondary,
  },
  reopenText: { fontSize: 13, fontWeight: '600' as const, color: Colors.secondary },
  bottomBar: {
    paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  payBtn: { borderRadius: 14, overflow: 'hidden' },
  payBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 14,
  },
  payBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
});
