import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  TextInput as NativeTextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Crown,
  CheckCircle2,
  PawPrint,
  Laptop,
  Home,
  HeartPulse,
  Car,
  Users,
  DollarSign,
  ChevronDown,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  Heart,
  Search,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { plans } from '@/mocks/plans';
import { useAuth } from '@/contexts/AuthContext';

const COLOMBIAN_CITIES = [
  'Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
  'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué',
  'Pasto', 'Manizales', 'Neiva', 'Villavicencio', 'Armenia',
  'Valledupar', 'Montería', 'Sincelejo', 'Popayán', 'Tunja',
  'Florencia', 'Riohacha', 'Quibdó', 'Yopal', 'Mocoa',
  'Leticia', 'Inírida', 'San José del Guaviare', 'Mitú', 'Puerto Carreño',
  'Arauca', 'San Andrés', 'Providencia', 'Apartadó', 'Barrancabermeja',
  'Bello', 'Buenaventura', 'Cartago', 'Chía', 'Ciénaga',
  'Duitama', 'Envigado', 'Facatativá', 'Fusagasugá', 'Girardot',
  'Girón', 'Itagüí', 'Lorica', 'Magangué', 'Maicao',
  'Malambo', 'Ocaña', 'Palmira', 'Piedecuesta', 'Pitalito',
  'Rionegro', 'Sabaneta', 'Sahagún', 'San Gil', 'Soacha',
  'Sogamoso', 'Soledad', 'Tumaco', 'Tuluá', 'Turbo',
  'Uribia', 'Zipaquirá',
];

type BillingType = 'mensual' | 'anual';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const plan = plans.find(p => p.id === id);
  const { isAuthenticated } = useAuth();

  const [selectedCity, setSelectedCity] = useState<string>('');
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  const [citySearch, setCitySearch] = useState<string>('');
  const [billingType, setBillingType] = useState<BillingType>('mensual');
  const [quantity, setQuantity] = useState<number>(1);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const heartScale = useRef(new Animated.Value(1)).current;

  const iconMap: Record<string, React.ComponentType<{ color: string; size: number }>> = {
    Crown,
    PawPrint,
    Laptop,
    Home,
    HeartPulse,
    Car,
    Users,
  };

  const filteredCities = COLOMBIAN_CITIES.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleFavoriteToggle = useCallback(() => {
    setIsFavorite(prev => !prev);
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  }, [heartScale]);

  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  }, []);

  const getPriceDisplay = useCallback(() => {
    if (!plan?.priceRange) return '';
    const parts = plan.priceRange.replace(/\$/g, '').replace(/\s/g, '').split('–');
    if (parts.length !== 2) return plan.priceRange;
    const low = parseInt(parts[0].replace(/\./g, ''), 10);
    const high = parseInt(parts[1].replace(/\./g, ''), 10);
    if (isNaN(low) || isNaN(high)) return plan.priceRange;
    const price = billingType === 'mensual' ? low : high;
    const total = price * quantity;
    return `$ ${total.toLocaleString('es-CO')}`;
  }, [plan, billingType, quantity]);

  const getPriceUnit = useCallback(() => {
    return billingType === 'mensual' ? '/mes' : '/año';
  }, [billingType]);

  if (!plan) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Plan no encontrado</Text>
      </View>
    );
  }

  const PlanIcon = iconMap[plan.icon] ?? Crown;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[plan.color, plan.color + 'CC']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={Colors.white} size={22} />
          </TouchableOpacity>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <TouchableOpacity
              style={styles.favoriteBtn}
              onPress={handleFavoriteToggle}
              testID="favorite-btn"
            >
              <Heart
                color={Colors.white}
                size={22}
                fill={isFavorite ? Colors.white : 'transparent'}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.iconCircle}>
            <PlanIcon color={Colors.white} size={28} />
          </View>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planTagline}>{plan.tagline}</Text>
          {plan.priceRange ? (
            <View style={styles.priceTag}>
              <DollarSign color={Colors.white} size={14} />
              <Text style={styles.priceText}>{plan.priceRange}</Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.purchaseCard}>
          <TouchableOpacity
            style={styles.citySelector}
            onPress={() => setShowCityModal(true)}
            activeOpacity={0.7}
            testID="city-selector"
          >
            <MapPin color={Colors.primary} size={18} />
            <Text style={[styles.citySelectorText, !selectedCity && styles.citySelectorPlaceholder]}>
              {selectedCity || 'Selecciona tu ciudad'}
            </Text>
            <ChevronDown color={Colors.textMuted} size={18} />
          </TouchableOpacity>

          <View style={styles.billingToggle}>
            <TouchableOpacity
              style={[styles.billingOption, billingType === 'mensual' && styles.billingOptionActive]}
              onPress={() => setBillingType('mensual')}
              activeOpacity={0.7}
            >
              <Text style={[styles.billingOptionText, billingType === 'mensual' && styles.billingOptionTextActive]}>
                Mensual
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.billingOption, billingType === 'anual' && styles.billingOptionActive]}
              onPress={() => setBillingType('anual')}
              activeOpacity={0.7}
            >
              <Text style={[styles.billingOptionText, billingType === 'anual' && styles.billingOptionTextActive]}>
                Anual
              </Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Ahorra</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Cantidad</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityBtn, quantity <= 1 && styles.quantityBtnDisabled]}
                onPress={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                activeOpacity={0.7}
              >
                <Minus color={quantity <= 1 ? Colors.textMuted : Colors.textPrimary} size={16} />
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityValue}>{quantity}</Text>
              </View>
              <TouchableOpacity
                style={[styles.quantityBtn, quantity >= 10 && styles.quantityBtnDisabled]}
                onPress={() => handleQuantityChange(1)}
                disabled={quantity >= 10}
                activeOpacity={0.7}
              >
                <Plus color={quantity >= 10 ? Colors.textMuted : Colors.textPrimary} size={16} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <View style={styles.totalPriceWrap}>
              <Text style={styles.totalPrice}>{getPriceDisplay()}</Text>
              <Text style={styles.totalUnit}>{getPriceUnit()}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.buyNowBtn}
            activeOpacity={0.7}
            testID="buy-now-btn"
            onPress={() => {
              if (isAuthenticated) {
                console.log('Comprar plan:', plan?.id);
              } else {
                router.push({
                  pathname: '/(auth)/login',
                  params: { redirect: `/plan-detail?id=${plan?.id}` }
                });
              }
            }}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.buyNowGradient}
            >
              <Zap color={Colors.white} size={18} />
              <Text style={styles.buyNowText}>
                {isAuthenticated ? 'Comprar ahora' : 'Iniciar sesión para comprar'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addToCartBtn}
            activeOpacity={0.7}
            testID="add-to-cart-btn"
            onPress={() => {
              if (isAuthenticated) {
                console.log('Añadir al carrito:', plan?.id);
              } else {
                router.push({
                  pathname: '/(auth)/login',
                  params: { redirect: `/plan-detail?id=${plan?.id}` }
                });
              }
            }}
          >
            <ShoppingCart color={Colors.primary} size={18} />
            <Text style={styles.addToCartText}>Añadir al carrito</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{plan.description}</Text>
        </View>

        {plan.sections.map((section, sIndex) => (
          <View key={sIndex} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>{section.emoji}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item, iIndex) => (
              <View key={iIndex} style={styles.itemRow}>
                <CheckCircle2 color={Colors.primary} size={16} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={showCityModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Selecciona tu ciudad</Text>

            <View style={styles.searchBar}>
              <Search color={Colors.textMuted} size={18} />
              <View style={styles.searchInputWrap}>
                <NativeTextInput
                  style={styles.searchInput}
                  value={citySearch}
                  onChangeText={setCitySearch}
                  placeholder="Buscar ciudad..."
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              style={styles.cityList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cityItem,
                    item === selectedCity && styles.cityItemActive,
                  ]}
                  onPress={() => {
                    setSelectedCity(item);
                    setShowCityModal(false);
                    setCitySearch('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.cityItemText,
                    item === selectedCity && styles.cityItemTextActive,
                  ]}>
                    {item}
                  </Text>
                  {item === selectedCity && (
                    <CheckCircle2 color={Colors.primary} size={18} />
                  )}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => { setShowCityModal(false); setCitySearch(''); }}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  planTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
    marginTop: -12,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  purchaseCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  citySelectorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  citySelectorPlaceholder: {
    color: Colors.textMuted,
    fontWeight: '400' as const,
  },
  billingToggle: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 4,
  },
  billingOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  billingOptionActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  billingOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  billingOptionTextActive: {
    color: Colors.primary,
  },
  saveBadge: {
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  quantityLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quantityBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityBtnDisabled: {
    opacity: 0.4,
  },
  quantityDisplay: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  totalPriceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  totalUnit: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textMuted,
  },
  buyNowBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  buyNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.lightGreen,
  },
  addToCartText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  descriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionEmoji: {
    fontSize: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 7,
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInputWrap: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    padding: 0,
  },
  cityList: {
    maxHeight: 400,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cityItemActive: {
    backgroundColor: Colors.lightGreen,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: -8,
    borderBottomColor: 'transparent',
  },
  cityItemText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  cityItemTextActive: {
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  modalCloseBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
});
