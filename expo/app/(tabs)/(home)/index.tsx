import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Shield,
  Bell,
  Heart,
  Home,
  Car,
  PawPrint,
  Scale,
  Sparkles,
  Building2,
  Phone,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Clock,
  Zap,
  Crown,
  Laptop,
  HeartPulse,
  Users,
  Star,
  User,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { categories } from '@/constants/categories';
import { plans } from '@/constants/plans';
import { services, suggestedServiceIds } from '@/constants/services';
import { useAuth } from '@/contexts/AuthContext';
import { useRequests } from '@/contexts/RequestsContext';
import { Service } from '@/types';

const { width } = Dimensions.get('window');
const SUGGESTION_CARD_WIDTH = width * 0.38;

function getRandomSuggestions(count: number): Service[] {
  const pool = services.filter(s => suggestedServiceIds.includes(s.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function formatPrice(price: number): string {
  return '$ ' + price.toLocaleString('es-CO');
}

const BANNER_IMAGES = [
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=300&fit=crop',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=300&fit=crop',
];

const BANNER_TITLES = [
  'Salud y Bienestar para tu familia',
  'Asistencia médica 24/7',
  'Protección total para tu hogar',
];

const iconMap: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  Heart,
  Home,
  Car,
  PawPrint,
  Scale,
  Sparkles,
  Building2,
  Crown,
  Laptop,
  HeartPulse,
  Users,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { activeRequests } = useRequests();
  const sosAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [bannerIndex, setBannerIndex] = useState<number>(0);
  const bannerOpacity = useRef(new Animated.Value(1)).current;
  const plansScrollRef = useRef<ScrollView>(null);
  const [plansScrollX, setPlansScrollX] = useState<number>(0);
  const suggestionsScrollRef = useRef<ScrollView>(null);
  const [suggestionsScrollX, setSuggestionsScrollX] = useState<number>(0);
  const [suggestions] = useState<Service[]>(() => getRandomSuggestions(5));



  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(bannerOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setBannerIndex(prev => (prev + 1) % BANNER_IMAGES.length);
        Animated.timing(bannerOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [bannerOpacity]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(sosAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(sosAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [fadeAnim, sosAnim]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/(tabs)/(home)/category?id=${categoryId}`);
  };

  const handleSOS = () => {
    if (!isAuthenticated) {
      router.push({ pathname: '/(auth)/login', params: { redirect: '/request-service?serviceId=s4&emergency=true' } });
      return;
    }
    router.push('/request-service?serviceId=s4&emergency=true');
  };



  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {isAuthenticated ? (user?.name?.charAt(0) ?? 'U') : 'CL'}
              </Text>
            </View>
            <View>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.userName}>{isAuthenticated ? (user?.name ?? 'Usuario') : 'Bienvenido'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => router.push('/notifications')}
              activeOpacity={0.7}
              testID="notifications-button"
            >
              <Bell color={Colors.white} size={22} />
              {activeRequests.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{activeRequests.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            {!isAuthenticated && (
              <TouchableOpacity
                style={styles.userBtn}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.7}
                testID="login-button"
              >
                <User color={Colors.white} size={22} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isAuthenticated ? (
          <TouchableOpacity
            style={styles.planCard}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.planCardLeft}>
              <Shield color={Colors.secondary} size={20} />
              <View>
                <Text style={styles.planLabel}>Tu Plan Activo</Text>
                <Text style={styles.planName}>Plan Familiar Premium</Text>
              </View>
            </View>
            <ChevronRight color="rgba(255,255,255,0.6)" size={18} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.planCard}
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/login')}
          >
            <View style={styles.planCardLeft}>
              <Shield color={Colors.secondary} size={20} />
              <View>
                <Text style={styles.planLabel}>Inicia sesión</Text>
                <Text style={styles.planName}>Para adquirir un plan</Text>
              </View>
            </View>
            <ChevronRight color="rgba(255,255,255,0.6)" size={18} />
          </TouchableOpacity>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bannerContainer}>
          <Animated.View style={[styles.bannerImageWrap, { opacity: bannerOpacity }]}>
            <Image
              source={{ uri: BANNER_IMAGES[bannerIndex] }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.55)']}
              style={styles.bannerOverlay}
            />
            <Text style={styles.bannerTitle}>{BANNER_TITLES[bannerIndex]}</Text>
          </Animated.View>
          <View style={styles.bannerDots}>
            {BANNER_IMAGES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.bannerDot,
                  i === bannerIndex && styles.bannerDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {activeRequests.length > 0 && (
          <Animated.View style={[styles.activeSection, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Clock color={Colors.warning} size={18} />
              <Text style={styles.sectionTitle}>Solicitudes Activas</Text>
            </View>
            {activeRequests.slice(0, 2).map(req => (
              <TouchableOpacity
                key={req.id}
                style={styles.activeCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/request-tracking?id=${req.id}`)}
              >
                <View style={styles.activeCardDot} />
                <View style={styles.activeCardInfo}>
                  <Text style={styles.activeCardService}>{req.serviceName}</Text>
                  <Text style={styles.activeCardStatus}>
                    {req.status === 'en_camino' ? 'En camino' :
                     req.status === 'proveedor_asignado' ? 'Proveedor asignado' :
                     req.status === 'validando' ? 'Validando' : 'Solicitado'}
                  </Text>
                </View>
                <ChevronRight color={Colors.textMuted} size={16} />
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} activeOpacity={0.7} onPress={handleSOS}>
            <View style={[styles.quickIcon, { backgroundColor: Colors.lightRed }]}>
              <AlertTriangle color={Colors.danger} size={20} />
            </View>
            <Text style={styles.quickLabel}>Emergencia</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} activeOpacity={0.7}>
            <View style={[styles.quickIcon, { backgroundColor: Colors.lightBlue }]}>
              <Phone color={Colors.secondary} size={20} />
            </View>
            <Text style={styles.quickLabel}>Llamar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} activeOpacity={0.7}>
            <View style={[styles.quickIcon, { backgroundColor: Colors.lightGreen }]}>
              <Zap color={Colors.success} size={20} />
            </View>
            <Text style={styles.quickLabel}>Rápido</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.plansSection}>
          <View style={styles.plansSectionHeader}>
            <View>
              <Text style={styles.plansSectionTitle}>Nuestros Planes</Text>
              <Text style={styles.plansSectionSubtitle}>Conoce nuestras coberturas</Text>
            </View>
            <View style={styles.plansArrows}>
              <TouchableOpacity
                style={[styles.plansArrowBtn, plansScrollX <= 0 && styles.plansArrowBtnDisabled]}
                activeOpacity={0.7}
                onPress={() => plansScrollRef.current?.scrollTo({ x: Math.max(0, plansScrollX - 200), animated: true })}
              >
                <ChevronLeft color={plansScrollX <= 0 ? Colors.textMuted : Colors.primary} size={18} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.plansArrowBtn}
                activeOpacity={0.7}
                onPress={() => plansScrollRef.current?.scrollTo({ x: plansScrollX + 200, animated: true })}
              >
                <ChevronRight color={Colors.primary} size={18} />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            ref={plansScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.plansScroll}
            onScroll={(e) => setPlansScrollX(e.nativeEvent.contentOffset.x)}
            scrollEventThrottle={16}
          >
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={styles.planCardItem}
                activeOpacity={0.75}
                onPress={() => router.push(`/(tabs)/(home)/plan-detail?id=${plan.id}`)}
                testID={`plan-${plan.id}`}
              >
                <LinearGradient
                  colors={[plan.color, plan.color + 'BB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.planCardGradient}
                >
                  <View style={styles.planCardIconWrap}>
                    {(() => {
                      const PlanIcon = iconMap[plan.icon] ?? Crown;
                      return <PlanIcon color={Colors.white} size={22} />;
                    })()}
                  </View>
                  <Text style={styles.planCardName}>{plan.shortName}</Text>
                  <Text style={styles.planCardTagline} numberOfLines={2}>{plan.tagline}</Text>
                  <View style={styles.planCardArrow}>
                    <Text style={styles.planCardArrowText}>Ver detalles</Text>
                    <ChevronRight color="rgba(255,255,255,0.9)" size={14} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Servicios de Asistencia</Text>
          <Text style={styles.categoriesSubtitle}>Selecciona una categoría</Text>

          <View style={styles.categoriesGrid}>
            {categories.map((cat, index) => {
              const IconComponent = iconMap[cat.icon] ?? Heart;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryCard}
                  activeOpacity={0.7}
                  onPress={() => handleCategoryPress(cat.id)}
                  testID={`category-${cat.id}`}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                    <IconComponent color={cat.color} size={26} />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={2}>{cat.name}</Text>
                  <Text style={styles.categoryCount}>{cat.servicesCount} servicios</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.suggestionsSection}>
          <View style={styles.suggestionsSectionHeader}>
            <View style={styles.suggestionsTitleRow}>
              <Star color={Colors.warning} size={20} />
              <View>
                <Text style={styles.suggestionsSectionTitle}>Sugerencias</Text>
                <Text style={styles.suggestionsSectionSubtitle}>Servicios recomendados para ti</Text>
              </View>
            </View>
            <View style={styles.suggestionsArrows}>
              <TouchableOpacity
                style={[styles.suggestionsArrowBtn, suggestionsScrollX <= 0 && styles.suggestionsArrowBtnDisabled]}
                activeOpacity={0.7}
                onPress={() => suggestionsScrollRef.current?.scrollTo({ x: Math.max(0, suggestionsScrollX - 200), animated: true })}
              >
                <ChevronLeft color={suggestionsScrollX <= 0 ? Colors.textMuted : Colors.primary} size={18} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionsArrowBtn}
                activeOpacity={0.7}
                onPress={() => suggestionsScrollRef.current?.scrollTo({ x: suggestionsScrollX + 200, animated: true })}
              >
                <ChevronRight color={Colors.primary} size={18} />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            ref={suggestionsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}
            onScroll={(e) => setSuggestionsScrollX(e.nativeEvent.contentOffset.x)}
            scrollEventThrottle={16}
          >
            {suggestions.map((svc) => (
              <TouchableOpacity
                key={svc.id}
                style={styles.suggestionCard}
                activeOpacity={0.75}
                onPress={() => router.push(`/(tabs)/(home)/service?id=${svc.id}`)}
                testID={`suggestion-${svc.id}`}
              >
                <Image
                  source={{ uri: svc.imageUrl }}
                  style={styles.suggestionImage}
                  resizeMode="cover"
                />
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionName} numberOfLines={2}>{svc.name}</Text>
                  {svc.price ? (
                    <Text style={styles.suggestionPrice}>{formatPrice(svc.price)}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.infoCard}>
          <LinearGradient
            colors={[Colors.primary + '15', Colors.primaryDark + '08']}
            style={styles.infoCardGradient}
          >
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>¿Necesitas ayuda?</Text>
              <Text style={styles.infoCardText}>
                Línea de atención 24/7{'\n'}
                <Text style={styles.infoCardPhone}>01 800 123 4567</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.infoCardBtn}>
              <Phone color={Colors.white} size={18} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Animated.View
        style={[
          styles.sosButton,
          {
            bottom: Platform.OS === 'web' ? 80 : insets.bottom + 80,
            transform: [{ scale: sosAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleSOS}
          activeOpacity={0.8}
          testID="sos-button"
        >
          <LinearGradient
            colors={[Colors.danger, '#DC2626']}
            style={styles.sosGradient}
          >
            <Text style={styles.sosText}>SOS</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  greeting: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.danger,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  planCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  planName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
    marginTop: -8,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  bannerContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bannerImageWrap: {
    width: '100%',
    height: 150,
    position: 'relative' as const,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bannerTitle: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 16,
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  bannerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  bannerDotActive: {
    width: 20,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  activeSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeCardDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
    marginRight: 12,
  },
  activeCardInfo: {
    flex: 1,
  },
  activeCardService: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  activeCardStatus: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  plansSection: {
    marginBottom: 24,
  },
  plansSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  plansSectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  plansSectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  plansArrows: {
    flexDirection: 'row',
    gap: 8,
  },
  plansArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plansArrowBtnDisabled: {
    opacity: 0.5,
  },
  plansScroll: {
    paddingRight: 4,
    gap: 12,
  },
  planCardItem: {
    width: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  planCardGradient: {
    padding: 16,
    borderRadius: 16,
    height: 160,
    justifyContent: 'space-between',
  },
  planCardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCardName: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.white,
    marginTop: 8,
  },
  planCardTagline: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 15,
  },
  planCardArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  planCardArrowText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.9)',
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  categoriesSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  suggestionsSection: {
    marginBottom: 24,
  },
  suggestionsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  suggestionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  suggestionsArrows: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestionsArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsArrowBtnDisabled: {
    opacity: 0.5,
  },
  suggestionsSectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  suggestionsSectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  suggestionsScroll: {
    gap: 12,
    paddingRight: 4,
  },
  suggestionCard: {
    width: SUGGESTION_CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionImage: {
    width: '100%',
    height: 100,
  },
  suggestionContent: {
    padding: 10,
  },
  suggestionName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 17,
  },
  suggestionPrice: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  infoCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  infoCardPhone: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  infoCardBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButton: {
    position: 'absolute',
    right: 20,
    zIndex: 100,
  },
  sosGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  sosText: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: Colors.white,
    letterSpacing: 1,
  },
});
