/**
 * Pantalla de prueba para validar la integración real con Payments + Zoho Flow.
 * No genera datos ficticios: usa el correo del usuario autenticado.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, AlertCircle, Beaker } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { usePayments } from '@/hooks/usePayments';
import { PaymentsConfig } from '@/services/payments';
import { ZohoFlowConfig } from '@/services/zoho/zohoFlowService';

export default function PaymentsTestScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { startPaymentLink, loading, result, error, reset, isConfigured } = usePayments();

  const [amount, setAmount] = useState<string>('1000');
  const [description, setDescription] = useState<string>('Pago de prueba CLtiene');

  const handleRun = async () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto mayor que cero.');
      return;
    }
    if (!user?.email) {
      Alert.alert('Sesión requerida', 'Inicia sesión para probar el pago real.');
      return;
    }
    try {
      await startPaymentLink({
        amount: n,
        description,
        customerEmail: user.email,
        customerName: user.name,
        service: 1,
      });
    } catch (e) {
      // error already in state
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Pruebas de Payments</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Beaker color={Colors.primary} size={18} />
            <Text style={styles.cardTitle}>Configuración</Text>
          </View>
          <StatusLine label="Payments API" ok={isConfigured} />
          <StatusLine label="Host" ok={!!PaymentsConfig.host} value={PaymentsConfig.host} />
          <StatusLine label="Terminal ID" ok={!!PaymentsConfig.terminalId} value={String(PaymentsConfig.terminalId)} />
          <StatusLine label="Form ID" ok={!!PaymentsConfig.formId} value={String(PaymentsConfig.formId)} />
          <StatusLine label="Zoho Flow" ok={ZohoFlowConfig.isConfigured()} />
          <StatusLine label="Usuario" ok={!!user?.email} value={user?.email ?? 'No autenticado'} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Parámetros de la prueba</Text>
          <Text style={styles.label}>Monto (COP)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="1000"
            placeholderTextColor={Colors.textMuted}
          />
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Pago de prueba"
            placeholderTextColor={Colors.textMuted}
          />
          <TouchableOpacity
            style={[styles.runBtn, (loading || !isConfigured) && styles.runBtnDisabled]}
            onPress={handleRun}
            disabled={loading || !isConfigured}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.runBtnText}>Crear link de pago real</Text>
            )}
          </TouchableOpacity>
        </View>

        {error && (
          <View style={[styles.card, styles.errorCard]}>
            <View style={styles.row}>
              <AlertCircle color={Colors.danger} size={18} />
              <Text style={[styles.cardTitle, { color: Colors.danger }]}>Error</Text>
            </View>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {result && (
          <View style={[styles.card, styles.okCard]}>
            <View style={styles.row}>
              <CheckCircle2 color={Colors.success} size={18} />
              <Text style={[styles.cardTitle, { color: Colors.success }]}>Pago creado</Text>
            </View>
            <KV label="Order ID" value={result.orderId} />
            <KV label="Monto" value={`${result.amount} ${result.currency}`} />
            <KV label="Estado" value={result.status} />
            <KV label="Transacción" value={String(result.transactionId ?? '—')} />
            <KV label="URL" value={result.paymentUrl ?? '—'} />
            <TouchableOpacity style={styles.linkBtn} onPress={reset}>
              <Text style={styles.linkBtnText}>Nueva prueba</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatusLine({ label, ok, value }: { label: string; ok: boolean; value?: string }) {
  return (
    <View style={styles.statusLine}>
      <View style={[styles.dot, { backgroundColor: ok ? Colors.success : Colors.danger }]} />
      <Text style={styles.statusLabel}>{label}</Text>
      {value ? <Text style={styles.statusValue} numberOfLines={1}>{value}</Text> : null}
    </View>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kv}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={styles.kvValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '700' as const, color: Colors.textPrimary },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
    gap: 10,
  },
  okCard: { borderColor: Colors.success },
  errorCard: { borderColor: Colors.danger },
  cardTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.textPrimary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  runBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
  },
  runBtnDisabled: { opacity: 0.5 },
  runBtnText: { color: Colors.white, fontWeight: '700' as const, fontSize: 15 },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 13, color: Colors.textPrimary, fontWeight: '600' as const, width: 100 },
  statusValue: { flex: 1, fontSize: 12, color: Colors.textMuted },
  errorText: { fontSize: 13, color: Colors.danger },
  kv: { gap: 2 },
  kvLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' as const },
  kvValue: { fontSize: 13, color: Colors.textPrimary },
  linkBtn: { paddingVertical: 10, alignItems: 'center' },
  linkBtnText: { color: Colors.primary, fontWeight: '700' as const, fontSize: 14 },
});
