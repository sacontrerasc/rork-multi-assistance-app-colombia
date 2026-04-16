import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  MapPin,
  FileText,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Navigation,
  Building2,
  Layers,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { services } from '@/mocks/services';
import { useRequests } from '@/contexts/RequestsContext';
import { useWip } from '@/contexts/WipContext';
import { useAuth } from '@/contexts/AuthContext';
import { AssistanceRequest } from '@/types';
import { WipServiceType } from '@/types/wip';

const STEPS = ['Servicio Wip', 'Ubicación', 'Descripción', 'Horario', 'Confirmar'];

export default function RequestServiceScreen() {
  const { serviceId, emergency } = useLocalSearchParams<{ serviceId: string; emergency?: string }>();
  const insets = useSafeAreaInsets();
  const { addRequest } = useRequests();
  const { user, isAuthenticated } = useAuth();
  const {
    businessUnits,
    isLoadingBusinessUnits,
    createServiceMutation,
  } = useWip();
  const service = services.find(s => s.id === serviceId);

  React.useEffect(() => {
    if (!isAuthenticated) {
      console.log('[RequestService] User not authenticated, redirecting to login');
      router.replace({
        pathname: '/(auth)/login',
        params: { redirect: `/request-service?serviceId=${serviceId ?? ''}${emergency ? '&emergency=true' : ''}` },
      });
    }
  }, [isAuthenticated, serviceId, emergency]);

  const [step, setStep] = useState<number>(0);
  const [selectedBuId, setSelectedBuId] = useState<string>('');
  const [selectedServiceType, setSelectedServiceType] = useState<WipServiceType | null>(null);
  const [location, setLocation] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [schedule, setSchedule] = useState<string>('Lo antes posible');
  const [showBuPicker, setShowBuPicker] = useState<boolean>(false);
  const [showServiceTypePicker, setShowServiceTypePicker] = useState<boolean>(false);

  const isEmergency = emergency === 'true';

  const selectedBu = useMemo(
    () => businessUnits.find(bu => bu.id === selectedBuId),
    [businessUnits, selectedBuId]
  );

  const availableServiceTypes = useMemo(
    () => selectedBu?.serviceTypes ?? [],
    [selectedBu]
  );

  const handleUseGPS = () => {
    setLocation('Bogotá, Colombia - Ubicación actual (GPS)');
    setCity('Bogotá');
  };

  const getScheduledDate = (): string => {
    const now = new Date();
    if (isEmergency || schedule === 'Lo antes posible') {
      return now.toISOString();
    }
    if (schedule === 'Hoy en la mañana') {
      now.setHours(9, 0, 0, 0);
      return now.toISOString();
    }
    if (schedule === 'Hoy en la tarde') {
      now.setHours(14, 0, 0, 0);
      return now.toISOString();
    }
    if (schedule === 'Mañana') {
      now.setDate(now.getDate() + 1);
      now.setHours(9, 0, 0, 0);
      return now.toISOString();
    }
    now.setDate(now.getDate() + 2);
    return now.toISOString();
  };

  const handleSubmit = async () => {
    if (!location.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu ubicación');
      return;
    }

    if (selectedServiceType && selectedBu) {
      console.log('[RequestService] Creating Wip service:', selectedServiceType.name);
      try {
        const result = await createServiceMutation.mutateAsync({
          businessUnitId: selectedBu.id,
          businessUnitName: selectedBu.name,
          serviceType: selectedServiceType,
          userName: user?.name ?? 'Usuario',
          userPhone: user?.phone ?? '',
          finalClientName: user?.name ?? 'Usuario',
          customerDocument: user?.documentNumber?.replace(/\./g, '') ?? '',
          fromAddress: location,
          fromCity: city || 'Bogotá',
          toAddress: location,
          toCity: city || 'Bogotá',
          scheduledDate: getScheduledDate(),
          note: description,
        });

        console.log('[RequestService] Wip service created:', result?.id);

        const newRequest: AssistanceRequest = {
          id: 'r_' + Date.now(),
          userId: user?.id ?? 'u1',
          serviceId: serviceId ?? '',
          serviceName: selectedServiceType.name,
          categoryName: selectedBu.name,
          status: 'solicitado',
          location,
          description,
          schedule: isEmergency ? 'EMERGENCIA - Inmediato' : schedule,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          wipServiceId: result?.id,
          wipExpedient: result?.wipExpedient ?? result?.expedient,
          wipStatus: result?.status ?? 'Pending',
        };
        await addRequest(newRequest);
        setStep(5);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('[RequestService] Wip create error:', message);
        Alert.alert('Error', `No se pudo crear el servicio en Wip: ${message}`);
      }
    } else {
      const newRequest: AssistanceRequest = {
        id: 'r_' + Date.now(),
        userId: user?.id ?? 'u1',
        serviceId: serviceId ?? '',
        serviceName: service?.name ?? 'Servicio',
        categoryName: service ? service.categoryId : '',
        status: 'solicitado',
        location,
        description,
        schedule: isEmergency ? 'EMERGENCIA - Inmediato' : schedule,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addRequest(newRequest);
      setStep(5);
    }
  };

  const canAdvance = () => {
    if (step === 0) return !!selectedBuId && !!selectedServiceType;
    if (step === 1) return location.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) return schedule.trim().length > 0;
    return true;
  };

  const isLoading = createServiceMutation.isPending;

  if (step === 5) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.successContainer}>
          <View style={styles.successIconWrap}>
            <CheckCircle2 color={Colors.success} size={64} />
          </View>
          <Text style={styles.successTitle}>¡Solicitud Enviada!</Text>
          <Text style={styles.successText}>
            Tu solicitud ha sido registrada exitosamente en Wip. Recibirás una notificación cuando un proveedor sea asignado.
          </Text>
          <TouchableOpacity
            style={styles.successBtn}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.successBtnGradient}
            >
              <Text style={styles.successBtnText}>Volver al Inicio</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => {
              router.back();
              setTimeout(() => router.push('/(tabs)/requests'), 300);
            }}
          >
            <Text style={styles.trackBtnText}>Ver Mis Solicitudes</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isEmergency ? '🚨 Emergencia' : 'Solicitar Servicio'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {selectedServiceType?.name ?? service?.name ?? 'Selecciona un servicio'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.stepsBar}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[
              styles.stepDot,
              i <= step && styles.stepDotActive,
              i < step && styles.stepDotDone,
            ]}>
              {i < step ? (
                <CheckCircle2 color={Colors.white} size={14} />
              ) : (
                <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>
                  {i + 1}
                </Text>
              )}
            </View>
            <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>
              {s}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <View style={styles.stepContent}>
            <Building2 color={Colors.primary} size={28} />
            <Text style={styles.stepTitle}>Selecciona el servicio</Text>
            <Text style={styles.stepDesc}>
              Escoge la unidad de negocio y tipo de servicio
            </Text>

            {isLoadingBusinessUnits ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={Colors.primary} size="large" />
                <Text style={styles.loadingText}>Cargando servicios de Wip...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Unidad de Negocio</Text>
                <TouchableOpacity
                  style={styles.pickerBtn}
                  onPress={() => setShowBuPicker(!showBuPicker)}
                  activeOpacity={0.7}
                  testID="bu-picker"
                >
                  <Building2 color={Colors.textMuted} size={18} />
                  <Text style={[
                    styles.pickerBtnText,
                    selectedBu && styles.pickerBtnTextSelected,
                  ]}>
                    {selectedBu?.name ?? 'Seleccionar unidad de negocio'}
                  </Text>
                  <ChevronDown color={Colors.textMuted} size={18} />
                </TouchableOpacity>

                {showBuPicker && (
                  <View style={styles.pickerList}>
                    {businessUnits.map(bu => (
                      <TouchableOpacity
                        key={bu.id}
                        style={[
                          styles.pickerOption,
                          selectedBuId === bu.id && styles.pickerOptionActive,
                        ]}
                        onPress={() => {
                          setSelectedBuId(bu.id);
                          setSelectedServiceType(null);
                          setShowBuPicker(false);
                        }}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          selectedBuId === bu.id && styles.pickerOptionTextActive,
                        ]}>
                          {bu.name}
                        </Text>
                        {selectedBuId === bu.id && (
                          <CheckCircle2 color={Colors.primary} size={18} />
                        )}
                      </TouchableOpacity>
                    ))}
                    {businessUnits.length === 0 && (
                      <Text style={styles.emptyPickerText}>
                        No hay unidades de negocio disponibles
                      </Text>
                    )}
                  </View>
                )}

                {selectedBu && (
                  <>
                    <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Tipo de Servicio</Text>
                    <TouchableOpacity
                      style={styles.pickerBtn}
                      onPress={() => setShowServiceTypePicker(!showServiceTypePicker)}
                      activeOpacity={0.7}
                      testID="service-type-picker"
                    >
                      <Layers color={Colors.textMuted} size={18} />
                      <Text style={[
                        styles.pickerBtnText,
                        selectedServiceType && styles.pickerBtnTextSelected,
                      ]}>
                        {selectedServiceType?.name ?? 'Seleccionar tipo de servicio'}
                      </Text>
                      <ChevronDown color={Colors.textMuted} size={18} />
                    </TouchableOpacity>

                    {showServiceTypePicker && (
                      <View style={styles.pickerList}>
                        {availableServiceTypes.map(st => (
                          <TouchableOpacity
                            key={st.formId}
                            style={[
                              styles.pickerOption,
                              selectedServiceType?.formId === st.formId && styles.pickerOptionActive,
                            ]}
                            onPress={() => {
                              setSelectedServiceType(st);
                              setShowServiceTypePicker(false);
                            }}
                          >
                            <Text style={[
                              styles.pickerOptionText,
                              selectedServiceType?.formId === st.formId && styles.pickerOptionTextActive,
                            ]}>
                              {st.name}
                            </Text>
                            {selectedServiceType?.formId === st.formId && (
                              <CheckCircle2 color={Colors.primary} size={18} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                )}
              </>
            )}
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContent}>
            <MapPin color={Colors.primary} size={28} />
            <Text style={styles.stepTitle}>¿Dónde necesitas el servicio?</Text>
            <Text style={styles.stepDesc}>
              Ingresa tu dirección o usa tu ubicación actual
            </Text>
            <TouchableOpacity
              style={styles.gpsBtn}
              activeOpacity={0.7}
              onPress={handleUseGPS}
            >
              <Navigation color={Colors.secondary} size={18} />
              <Text style={styles.gpsBtnText}>Usar mi ubicación actual</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.textArea}
              placeholder="Ej: Calle 100 #15-20, Bogotá"
              placeholderTextColor={Colors.textMuted}
              value={location}
              onChangeText={setLocation}
              multiline
              testID="request-location"
            />
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Ciudad</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Ej: Bogotá, Medellín"
              placeholderTextColor={Colors.textMuted}
              value={city}
              onChangeText={setCity}
              testID="request-city"
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <FileText color={Colors.primary} size={28} />
            <Text style={styles.stepTitle}>Describe tu situación</Text>
            <Text style={styles.stepDesc}>
              Cuéntanos más detalles para brindarte un mejor servicio
            </Text>
            <TextInput
              style={[styles.textArea, { height: 120 }]}
              placeholder="Describe tu problema o necesidad..."
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              testID="request-description"
            />
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Calendar color={Colors.primary} size={28} />
            <Text style={styles.stepTitle}>¿Cuándo lo necesitas?</Text>
            <Text style={styles.stepDesc}>Selecciona tu preferencia de horario</Text>

            {['Lo antes posible', 'Hoy en la mañana', 'Hoy en la tarde', 'Mañana', 'Agendar para otro día'].map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.scheduleOpt, schedule === opt && styles.scheduleOptActive]}
                onPress={() => setSchedule(opt)}
              >
                <Text style={[
                  styles.scheduleOptText,
                  schedule === opt && styles.scheduleOptTextActive,
                ]}>
                  {opt}
                </Text>
                {schedule === opt && <CheckCircle2 color={Colors.primary} size={18} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepContent}>
            <CheckCircle2 color={Colors.success} size={28} />
            <Text style={styles.stepTitle}>Confirma tu solicitud</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Unidad de Negocio</Text>
                <Text style={styles.summaryValue}>{selectedBu?.name ?? '-'}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tipo de Servicio</Text>
                <Text style={styles.summaryValue}>{selectedServiceType?.name ?? service?.name ?? '-'}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ubicación</Text>
                <Text style={styles.summaryValue} numberOfLines={2}>{location}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ciudad</Text>
                <Text style={styles.summaryValue}>{city || 'No especificada'}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Descripción</Text>
                <Text style={styles.summaryValue}>{description || 'Sin descripción'}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Horario</Text>
                <Text style={styles.summaryValue}>
                  {isEmergency ? 'EMERGENCIA - Inmediato' : schedule}
                </Text>
              </View>
            </View>

            <View style={styles.wipBadge}>
              <Text style={styles.wipBadgeText}>Se enviará a Wip Tool para gestión</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomRow}>
          {step > 0 && (
            <TouchableOpacity
              style={styles.prevBtn}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.prevBtnText}>Anterior</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextBtn, !canAdvance() && styles.nextBtnDisabled, step === 0 && { flex: 1 }]}
            activeOpacity={0.8}
            disabled={!canAdvance() || isLoading}
            onPress={step === 4 ? handleSubmit : () => setStep(step + 1)}
          >
            <LinearGradient
              colors={canAdvance() ? [Colors.primary, Colors.primaryDark] : ['#ccc', '#bbb']}
              style={styles.nextBtnGradient}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.nextBtnText}>
                    {step === 4 ? 'Enviar a Wip' : 'Siguiente'}
                  </Text>
                  {step < 4 && <ChevronRight color={Colors.white} size={18} />}
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stepsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.background,
  },
  stepItem: {
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepDotDone: {
    backgroundColor: Colors.success,
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  stepNumActive: {
    color: Colors.white,
  },
  stepLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: '700' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  stepContent: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  stepDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    alignSelf: 'flex-start' as const,
    marginBottom: 8,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  pickerBtnText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textMuted,
  },
  pickerBtnTextSelected: {
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  pickerList: {
    alignSelf: 'stretch',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerOptionActive: {
    backgroundColor: Colors.primary + '08',
  },
  pickerOptionText: {
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  pickerOptionTextActive: {
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  emptyPickerText: {
    padding: 16,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center' as const,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.lightBlue,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  gpsBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.secondary,
  },
  textArea: {
    alignSelf: 'stretch',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 56,
  },
  scheduleOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  scheduleOptActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  scheduleOptText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  scheduleOptTextActive: {
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  summaryCard: {
    alignSelf: 'stretch',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  summaryRow: {
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  wipBadge: {
    marginTop: 16,
    backgroundColor: Colors.lightBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  wipBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.secondary,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  prevBtn: {
    flex: 0.4,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  prevBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  nextBtn: {
    flex: 0.6,
    borderRadius: 14,
    overflow: 'hidden',
  },
  nextBtnDisabled: {
    opacity: 0.6,
  },
  nextBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
    borderRadius: 14,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successIconWrap: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 32,
  },
  successBtn: {
    alignSelf: 'stretch',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  successBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
  },
  successBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  trackBtn: {
    paddingVertical: 14,
  },
  trackBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.secondary,
  },
});
