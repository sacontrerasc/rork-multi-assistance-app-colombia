export interface Notification {
  id: string;
  type: 'service' | 'promo' | 'system' | 'request';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  icon: string;
  color: string;
}

export const sampleNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'request',
    title: 'Grúa en camino',
    message: 'Carlos Rodríguez está en camino. Llegada estimada: 15 minutos.',
    read: false,
    createdAt: '2026-03-02T14:20:00Z',
    icon: 'Car',
    color: '#3B82F6',
  },
  {
    id: 'n2',
    type: 'request',
    title: 'Proveedor asignado',
    message: 'Juan Pérez ha sido asignado para tu solicitud de plomería.',
    read: false,
    createdAt: '2026-03-02T12:30:00Z',
    icon: 'Home',
    color: '#F59E0B',
  },
  {
    id: 'n3',
    type: 'promo',
    title: '20% de descuento en Plan Premium',
    message: 'Aprovecha esta oferta exclusiva. Válida hasta el 15 de marzo.',
    read: false,
    createdAt: '2026-03-01T09:00:00Z',
    icon: 'Crown',
    color: '#19C37D',
  },
  {
    id: 'n4',
    type: 'system',
    title: 'Bienvenido a CL Tiene',
    message: 'Tu cuenta ha sido activada exitosamente. Explora nuestros planes y servicios.',
    read: true,
    createdAt: '2026-02-28T10:00:00Z',
    icon: 'Shield',
    color: '#0F8F5C',
  },
  {
    id: 'n5',
    type: 'service',
    title: 'Consulta completada',
    message: 'Tu consulta de telemedicina con la Dra. María López ha finalizado.',
    read: true,
    createdAt: '2026-02-28T10:45:00Z',
    icon: 'Heart',
    color: '#EF4444',
  },
  {
    id: 'n6',
    type: 'promo',
    title: 'Nuevo servicio: Mantenimiento de bicicletas',
    message: 'Ahora puedes solicitar mantenimiento de bicicletas desde la app.',
    read: true,
    createdAt: '2026-02-27T15:00:00Z',
    icon: 'Sparkles',
    color: '#8B5CF6',
  },
  {
    id: 'n7',
    type: 'system',
    title: 'Actualización de tu plan',
    message: 'Tu Plan Familiar Premium se renovó automáticamente para este mes.',
    read: true,
    createdAt: '2026-02-25T08:00:00Z',
    icon: 'Shield',
    color: '#0F8F5C',
  },
  {
    id: 'n8',
    type: 'request',
    title: 'Califica tu experiencia',
    message: 'Cuéntanos cómo fue tu experiencia con el servicio de telemedicina.',
    read: true,
    createdAt: '2026-02-28T11:00:00Z',
    icon: 'Star',
    color: '#F59E0B',
  },
];
