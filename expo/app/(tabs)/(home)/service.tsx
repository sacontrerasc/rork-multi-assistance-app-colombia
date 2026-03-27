import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Clock,
  Video,
  Phone,
  MapPin,
  CheckCircle,
  Shield,
  ShoppingCart,
  CreditCard,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { services } from '@/mocks/services';
import { categories } from '@/mocks/categories';

const typeIcons: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  virtual: Video,
  'telefónico': Phone,
  presencial: MapPin,
};

const typeLabels: Record<string, string> = {
  virtual: 'Videollamada / Virtual',
  'telefónico': 'Atención Telefónica',
  presencial: 'Atención Presencial',
};

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const service = services.find(s => s.id === id);
  const category = service ? categories.find(c => c.id === service.categoryId) : null;

  if (!service) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Servicio no encontrado</Text>
      </View>
    );
  }

  const TypeIcon = typeIcons[service.serviceType] ?? Phone;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: service.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent']}
            style={[styles.imageOverlay, { paddingTop: insets.top + 8 }]}
          >
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <ArrowLeft color={Colors.white} size={22} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          {category && (
            <View style={[styles.categoryBadge, { backgroundColor: category.color + '15' }]}>
              <Text style={[styles.categoryBadgeText, { color: category.color }]}>
                {category.name}
              </Text>
            </View>
          )}

          <Text style={styles.title}>{service.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <TypeIcon color={Colors.secondary} size={16} />
              <Text style={styles.metaText}>{typeLabels[service.serviceType]}</Text>
            </View>
            {service.isAvailable24_7 && (
              <View style={styles.metaItem}>
                <Clock color={Colors.success} size={16} />
                <Text style={[styles.metaText, { color: Colors.success }]}>Disponible 24/7</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.sectionText}>{service.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cobertura</Text>
            <View style={styles.coverageCard}>
              <Shield color={Colors.primary} size={20} />
              <Text style={styles.coverageText}>{service.coverageDetails}</Text>
            </View>
          </View>

          {service.estimatedTime && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tiempo Estimado</Text>
              <View style={styles.timeCard}>
                <Clock color={Colors.warning} size={20} />
                <Text style={styles.timeText}>{service.estimatedTime}</Text>
              </View>
            </View>
          )}

          <View style={styles.includesSection}>
            <Text style={styles.sectionTitle}>¿Qué incluye?</Text>
            {[
              'Atención profesional certificada',
              'Seguimiento en tiempo real',
              'Soporte post-servicio',
              'Sin costos adicionales dentro de tu plan',
            ].map((item, i) => (
              <View key={i} style={styles.includesItem}>
                <CheckCircle color={Colors.success} size={16} />
                <Text style={styles.includesText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        {service.price ? (
          <View style={styles.bottomPriceRow}>
            <Text style={styles.bottomPrice}>$ {service.price.toLocaleString('es-CO')}</Text>
          </View>
        ) : null}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.cartBtn}
            activeOpacity={0.7}
            onPress={() => console.log('Add to cart:', service.id)}
            testID="add-to-cart-btn"
          >
            <ShoppingCart color={Colors.primary} size={18} />
            <Text style={styles.cartBtnText}>Añadir al Carrito</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buyBtn}
            activeOpacity={0.8}
            onPress={() => router.push(`/request-service?serviceId=${service.id}`)}
            testID="buy-now-btn"
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buyBtnGradient}
            >
              <CreditCard color={Colors.white} size={18} />
              <Text style={styles.buyBtnText}>Comprar Ahora</Text>
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
  imageWrapper: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.secondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  coverageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.lightBlue,
    padding: 16,
    borderRadius: 12,
  },
  coverageText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.lightYellow,
    padding: 16,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  includesSection: {
    marginBottom: 20,
  },
  includesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  includesText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bottomPriceRow: {
    marginBottom: 10,
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.lightGreen,
  },
  cartBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  buyBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  buyBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buyBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
