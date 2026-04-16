import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Shield,
  Users,
  Clock,
  ChevronRight,
  LogOut,
  Phone,
  Mail,
  FileText,
  Star,
  HelpCircle,
  Settings,
  CreditCard,
  LogIn,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { demoPlan, demoBeneficiaries } from '@/mocks/user';
import { useRequests } from '@/contexts/RequestsContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, isAuthenticated } = useAuth();
  const { requests } = useRequests();

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <User color={Colors.white} size={28} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Mi Perfil</Text>
              <Text style={styles.profileEmail}>Inicia sesión para acceder</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={guestStyles.content}>
          <View style={guestStyles.card}>
            <View style={guestStyles.iconWrap}>
              <LogIn color={Colors.primary} size={40} />
            </View>
            <Text style={guestStyles.title}>Inicia sesión</Text>
            <Text style={guestStyles.description}>
              Para adquirir planes, solicitar servicios y gestionar tus compras necesitas una cuenta.
            </Text>
            <TouchableOpacity
              style={guestStyles.loginBtn}
              activeOpacity={0.8}
              onPress={() => router.push('/(auth)/login')}
              testID="profile-login-btn"
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={guestStyles.loginBtnGradient}
              >
                <Text style={guestStyles.loginBtnText}>Iniciar Sesión</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={guestStyles.registerBtn}
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={guestStyles.registerBtnText}>Crear una cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const completedCount = requests.filter(r => r.status === 'completado').length;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0) ?? 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? 'Usuario'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{requests.length}</Text>
            <Text style={styles.statLabel}>Solicitudes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completados</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{demoBeneficiaries.length}</Text>
            <Text style={styles.statLabel}>Beneficiarios</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={styles.planIconWrap}>
              <Shield color={Colors.primary} size={22} />
            </View>
            <View style={styles.planHeaderInfo}>
              <Text style={styles.planName}>{demoPlan.name}</Text>
              <Text style={styles.planType}>
                {demoPlan.type === 'familiar' ? 'Plan Familiar' : demoPlan.type}
              </Text>
            </View>
            <View style={styles.planActive}>
              <Text style={styles.planActiveText}>Activo</Text>
            </View>
          </View>

          <Text style={styles.planPrice}>
            ${demoPlan.price.toLocaleString('es-CO')} <Text style={styles.planCurrency}>COP/mes</Text>
          </Text>

          <View style={styles.benefitsGrid}>
            {demoPlan.benefits.slice(0, 4).map((benefit, i) => (
              <View key={i} style={styles.benefitItem}>
                <View style={styles.benefitDot} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>Ver todos los beneficios</Text>
            <ChevronRight color={Colors.secondary} size={16} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Beneficiarios</Text>
        {demoBeneficiaries.map(b => (
          <View key={b.id} style={styles.beneficiaryCard}>
            <View style={styles.beneficiaryAvatar}>
              <Users color={Colors.primary} size={16} />
            </View>
            <View style={styles.beneficiaryInfo}>
              <Text style={styles.beneficiaryName}>{b.name}</Text>
              <Text style={styles.beneficiaryRel}>{b.relationship}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Información Personal</Text>
        <View style={styles.infoCard}>
          <ProfileInfoRow icon={User} label="Nombre" value={user?.name ?? ''} />
          <View style={styles.infoDivider} />
          <ProfileInfoRow icon={Mail} label="Correo" value={user?.email ?? ''} />
          <View style={styles.infoDivider} />
          <ProfileInfoRow icon={Phone} label="Teléfono" value={user?.phone ?? ''} />
          <View style={styles.infoDivider} />
          <ProfileInfoRow icon={FileText} label="Documento" value={`${user?.documentType ?? 'CC'} ${user?.documentNumber ?? ''}`} />
        </View>

        <Text style={styles.sectionTitle}>Ajustes</Text>
        <View style={styles.menuCard}>
          <MenuItem icon={CreditCard} label="Método de Pago" />
          <View style={styles.infoDivider} />
          <MenuItem icon={Clock} label="Historial de Servicios" />
          <View style={styles.infoDivider} />
          <MenuItem icon={Star} label="Calificar Servicios" />
          <View style={styles.infoDivider} />
          <MenuItem icon={HelpCircle} label="Centro de Ayuda" />
          <View style={styles.infoDivider} />
          <MenuItem icon={Settings} label="Configuración" />
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
          testID="logout-btn"
        >
          <LogOut color={Colors.danger} size={18} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>CL Asistencia v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function ProfileInfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ color: string; size: number }>;
  label: string;
  value: string;
}) {
  return (
    <View style={infoStyles.row}>
      <Icon color={Colors.textMuted} size={16} />
      <View style={infoStyles.content}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

function MenuItem({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ color: string; size: number }>;
  label: string;
}) {
  return (
    <TouchableOpacity style={menuStyles.item} activeOpacity={0.6}>
      <Icon color={Colors.textSecondary} size={18} />
      <Text style={menuStyles.label}>{label}</Text>
      <ChevronRight color={Colors.textMuted} size={16} />
    </TouchableOpacity>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  value: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
    marginTop: 2,
  },
});

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
  },
});

const guestStyles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 28,
  },
  loginBtn: {
    alignSelf: 'stretch',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loginBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  registerBtn: {
    paddingVertical: 12,
  },
  registerBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.secondary,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  profileEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingVertical: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planHeaderInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  planType: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  planActive: {
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  planActiveText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.success,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.primary,
    marginBottom: 14,
  },
  planCurrency: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  benefitsGrid: {
    gap: 8,
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  benefitText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.secondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  beneficiaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  beneficiaryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  beneficiaryInfo: {
    flex: 1,
  },
  beneficiaryName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  beneficiaryRel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.danger,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.danger,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
  },
});
