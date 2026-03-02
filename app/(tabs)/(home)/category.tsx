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
import { ArrowLeft, Clock, Video, Phone, MapPin, Wifi } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { categories } from '@/mocks/categories';
import { services } from '@/mocks/services';

const typeIconMap: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  virtual: Video,
  'telefónico': Phone,
  presencial: MapPin,
};

const typeLabels: Record<string, string> = {
  virtual: 'Virtual',
  'telefónico': 'Telefónico',
  presencial: 'Presencial',
};

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const category = categories.find(c => c.id === id);
  const categoryServices = services.filter(s => s.categoryId === id);

  if (!category) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Categoría no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{category.name}</Text>
          <Text style={styles.headerSubtitle}>{categoryServices.length} servicios disponibles</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>{category.description}</Text>

        {categoryServices.map((service) => {
          const TypeIcon = typeIconMap[service.serviceType] ?? Wifi;
          return (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              activeOpacity={0.7}
              onPress={() => router.push(`/(tabs)/(home)/service?id=${service.id}`)}
              testID={`service-${service.id}`}
            >
              <Image
                source={{ uri: service.imageUrl }}
                style={styles.serviceImage}
                contentFit="cover"
              />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDesc} numberOfLines={2}>
                  {service.description}
                </Text>
                <View style={styles.serviceMetaRow}>
                  <View style={styles.serviceTag}>
                    <TypeIcon color={Colors.secondary} size={12} />
                    <Text style={styles.serviceTagText}>
                      {typeLabels[service.serviceType]}
                    </Text>
                  </View>
                  {service.isAvailable24_7 && (
                    <View style={[styles.serviceTag, styles.tag24]}>
                      <Clock color={Colors.success} size={12} />
                      <Text style={[styles.serviceTagText, { color: Colors.success }]}>24/7</Text>
                    </View>
                  )}
                  {service.estimatedTime && (
                    <Text style={styles.estimatedTime}>{service.estimatedTime}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceImage: {
    width: '100%',
    height: 140,
  },
  serviceInfo: {
    padding: 16,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  serviceDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tag24: {
    backgroundColor: Colors.lightGreen,
  },
  serviceTagText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.secondary,
  },
  estimatedTime: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 'auto',
  },
});
