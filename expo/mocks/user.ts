import { User, Plan, Beneficiary } from '@/types';

export const demoUser: User = {
  id: 'u1',
  name: 'Andrés García',
  email: 'andres.garcia@email.com',
  phone: '+57 310 555 1234',
  documentType: 'CC',
  documentNumber: '1.098.765.432',
  role: 'user',
  planId: 'p1',
  createdAt: '2025-06-15T10:00:00Z',
};

export const demoPlan: Plan = {
  id: 'p1',
  name: 'Plan Familiar Premium',
  description: 'Cobertura completa para toda tu familia con acceso a todos los servicios de asistencia.',
  type: 'familiar',
  price: 89900,
  currency: 'COP',
  benefits: [
    'Telemedicina ilimitada',
    'Médico a domicilio (2/mes)',
    'Ambulancia de emergencia',
    'Grúa vehicular (4/año)',
    'Asistencia hogar (2/mes)',
    'Veterinario (2/mes)',
    'Asesoría legal (2/mes)',
    'Limpieza dental (1/semestre)',
  ],
  maxBeneficiaries: 4,
  isActive: true,
};

export const demoBeneficiaries: Beneficiary[] = [
  { id: 'b1', name: 'Laura García', relationship: 'Esposa', documentNumber: '1.098.765.433' },
  { id: 'b2', name: 'Santiago García', relationship: 'Hijo', documentNumber: '1.098.765.434' },
];
