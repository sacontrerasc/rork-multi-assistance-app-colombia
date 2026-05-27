export interface PlanSection {
  emoji: string;
  title: string;
  items: string[];
}

export interface PlanTier {
  id: string;
  name: string;
  priceSemestral: number;
  priceAnual: number;
  sections: PlanSection[];
}

export interface PlanDetail {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  color: string;
  icon: string;
  description: string;
  tiers: PlanTier[];
}

/**
 * CL TIENE — Catálogo oficial de planes.
 * Precios y coberturas validados contra documento oficial.
 * NO modificar sin autorización del área de Producto.
 */
export const plans: PlanDetail[] = [
  {
    id: 'premium',
    name: 'Plan Premium Estándar',
    shortName: 'CL Premium',
    tagline: 'Máxima cobertura y protección integral',
    color: '#FFB800',
    icon: 'Crown',
    description:
      'CL Premium es nuestro plan más completo y avanzado. Integra las coberturas esenciales en salud, hogar, movilidad, bienestar y asistencia veterinaria en una sola membresía.\n\nUn plan diseñado para quienes buscan máxima tranquilidad, atención prioritaria y acceso ampliado a servicios y beneficios especiales.',
    tiers: [
      {
        id: 'estandar',
        name: 'Estándar',
        priceSemestral: 890900,
        priceAnual: 1446900,
        sections: [
          {
            emoji: '🩺',
            title: 'Salud',
            items: [
              'Traslado Médico Programado: ilimitado.',
              'Médico a Domicilio: ilimitado.',
              'Guía Médica Telefónica: ilimitado.',
              'Orientación Médica: ilimitado.',
              'Orientación Emocional: ilimitado.',
              'Orientación Nutricional: ilimitado.',
              'Terapias físicas y respiratorias: 3 eventos, máximo $150.000.',
              'Urgencia dental: 2 eventos, máximo $250.000.',
              'Limpieza dental: 2 eventos, máximo $100.000.',
              'Optometría: 1 evento anual.',
              'Consulta especialista: 1 evento anual.',
              'Ambulancia: 1 evento anual.',
              'Laboratorios: 2 eventos anuales.',
              'Pediatría telefónica: 3 eventos anuales.',
            ],
          },
          {
            emoji: '🏠',
            title: 'Hogar',
            items: [
              'Servicios hogar: 3 eventos, máximo $150.000.',
              'Electrodomésticos: 2 eventos, máximo $200.000.',
              'Asistencia PC remota: ilimitado.',
              'Empleada doméstica: 2 eventos, máximo $100.000.',
            ],
          },
          {
            emoji: '🐾',
            title: 'Mascotas',
            items: [
              'Veterinario a domicilio: ilimitado.',
              'Orientación veterinaria: ilimitado.',
            ],
          },
          {
            emoji: '🚗',
            title: 'Movilidad',
            items: [
              'Grúa carro: 3 eventos, máximo $100.000.',
              'Transporte ruta escolar: 1 evento, máximo $60.000.',
            ],
          },
          {
            emoji: '💼',
            title: 'Asesoría',
            items: [
              'Profesor telefónico: ilimitado.',
              'Tributaria telefónica: ilimitado.',
              'Legal telefónica: ilimitado.',
              'Jardinería telefónica: ilimitado.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mueve',
    name: 'CL Mueve',
    shortName: 'CL Mueve',
    tagline: 'Respaldo total en la vía',
    color: '#14B8A6',
    icon: 'Car',
    description:
      'Con CL Mueve, siempre tendrás respaldo en la vía ante cualquier imprevisto con tu vehículo. Asistencias mecánicas, de movilidad y apoyo legal en un solo plan.',
    tiers: [
      {
        id: 'basico',
        name: 'Básico',
        priceSemestral: 248900,
        priceAnual: 473900,
        sections: [
          {
            emoji: '🔧',
            title: 'Servicios incluidos',
            items: [
              'Telemecánico (videollamada con técnico): ilimitado.',
              'Reinicio de batería: 3 eventos.',
              'Cerrajería vial: 3 eventos.',
              'Cambio de llanta: 3 eventos.',
              'Conductor elegido: 2 eventos.',
              'Mantenimiento de bicicletas: 2 eventos.',
              'Asesoría jurídica de tránsito: ilimitada.',
              'Asesoría legal impugnación de comparendos: ilimitada.',
            ],
          },
        ],
      },
      {
        id: 'estandar',
        name: 'Estándar',
        priceSemestral: 282900,
        priceAnual: 537900,
        sections: [
          {
            emoji: '🔧',
            title: 'Servicios incluidos',
            items: [
              'Telemecánico (videollamada con técnico): ilimitado.',
              'Grúa para carro o moto: 5 eventos.',
              'Traslado por avería: 3 eventos.',
              'Reinicio de batería: 5 eventos.',
              'Cerrajería vial: 5 eventos.',
              'Cambio de llanta: 5 eventos.',
              'Conductor elegido: 3 eventos.',
              'Mantenimiento de bicicletas: 2 eventos.',
              'Asesoría jurídica de tránsito: ilimitada.',
              'Asesoría legal impugnación de comparendos: ilimitada.',
            ],
          },
        ],
      },
      {
        id: 'plus',
        name: 'Plus',
        priceSemestral: 338900,
        priceAnual: 645900,
        sections: [
          {
            emoji: '🔧',
            title: 'Servicios incluidos',
            items: [
              'Telemecánico (videollamada con técnico): ilimitado.',
              'Grúa para carro o moto: 5 eventos.',
              'Traslado por avería: 5 eventos.',
              'Reinicio de batería: 5 eventos.',
              'Cerrajería vial: 5 eventos.',
              'Cambio de llanta: 5 eventos.',
              'Conductor elegido: 3 eventos.',
              'Mantenimiento de bicicletas: 5 eventos.',
              'Asesoría jurídica de tránsito: ilimitada.',
              'Asesoría legal impugnación de comparendos: ilimitada.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'manada',
    name: 'Plan Manada',
    shortName: 'CL Manada',
    tagline: 'Cuidado integral para ti y tu mascota',
    color: '#A855F7',
    icon: 'Users',
    description:
      'El Plan Manada es la membresía integral de CL Tiene que cuida lo más importante de tu vida: tú y tu mascota. Asistencias para humanos y atención veterinaria en un solo plan.',
    tiers: [
      {
        id: 'basico',
        name: 'Básico',
        priceSemestral: 399900,
        priceAnual: 764900,
        sections: [
          {
            emoji: '🩺',
            title: 'Para ti',
            items: [
              'Orientación médica telefónica.',
              'Orientación psicológica telefónica.',
              'Orientación nutricional telefónica.',
            ],
          },
          {
            emoji: '🐾',
            title: 'Para tu mascota',
            items: [
              'Orientación veterinaria telefónica.',
              'Videollamada con veterinario.',
              'Desparasitación.',
            ],
          },
        ],
      },
      {
        id: 'estandar',
        name: 'Estándar',
        priceSemestral: 533900,
        priceAnual: 1019900,
        sections: [
          {
            emoji: '🩺',
            title: 'Para ti',
            items: [
              'Orientación médica telefónica.',
              'Orientación psicológica telefónica.',
              'Orientación nutricional telefónica.',
              'Médico a domicilio.',
            ],
          },
          {
            emoji: '🐾',
            title: 'Para tu mascota',
            items: [
              'Orientación veterinaria telefónica.',
              'Videollamada con veterinario.',
              'Desparasitación.',
              'Baño medicado.',
              'Guardería o paseador.',
            ],
          },
        ],
      },
      {
        id: 'plus',
        name: 'Plus',
        priceSemestral: 965900,
        priceAnual: 1846900,
        sections: [
          {
            emoji: '🩺',
            title: 'Para ti',
            items: [
              'Orientación médica telefónica.',
              'Orientación psicológica telefónica.',
              'Orientación nutricional telefónica.',
              'Médico a domicilio.',
            ],
          },
          {
            emoji: '🐾',
            title: 'Para tu mascota',
            items: [
              'Orientación veterinaria telefónica.',
              'Videollamada con veterinario.',
              'Desparasitación.',
              'Baño medicado.',
              'Guardería o paseador.',
              'Auxilio por fallecimiento de la mascota.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mascotas',
    name: 'Plan Mascotas',
    shortName: 'CL Mascotas',
    tagline: 'Bienestar integral para tu mascota',
    color: '#F97316',
    icon: 'PawPrint',
    description:
      'Con Plan Mascotas, garantizas la atención y el bienestar de tu mascota con servicios médicos, apoyo profesional y acompañamiento integral.',
    tiers: [
      {
        id: 'basico',
        name: 'Básico',
        priceSemestral: 248900,
        priceAnual: 473900,
        sections: [
          {
            emoji: '🐾',
            title: 'Servicios incluidos',
            items: [
              'Orientación veterinaria telefónica.',
              'Videollamada con veterinario.',
              'Desparasitación.',
            ],
          },
        ],
      },
      {
        id: 'estandar',
        name: 'Estándar',
        priceSemestral: 322900,
        priceAnual: 616900,
        sections: [
          {
            emoji: '🐾',
            title: 'Servicios incluidos',
            items: [
              'Orientación veterinaria telefónica.',
              'Videollamada con veterinario.',
              'Desparasitación.',
              'Aplicación de vacunas.',
              'Guardería o paseador.',
            ],
          },
        ],
      },
      {
        id: 'plus',
        name: 'Plus',
        priceSemestral: 586900,
        priceAnual: 1120900,
        sections: [
          {
            emoji: '🐾',
            title: 'Servicios incluidos',
            items: [
              'Orientación veterinaria telefónica.',
              'Videollamada con veterinario.',
              'Veterinario a domicilio.',
              'Desparasitación.',
              'Aplicación de vacunas.',
              'Guardería o paseador.',
              'Auxilio por fallecimiento de la mascota.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cuida',
    name: 'CL Cuida',
    shortName: 'CL Cuida',
    tagline: 'Tu salud y la de tu familia primero',
    color: '#EF4444',
    icon: 'HeartPulse',
    description:
      'Con CL Cuida tu salud y la de tu familia siempre están primero. Asistencias médicas presenciales y telefónicas diseñadas para cuidar tu bienestar físico y emocional.',
    tiers: [
      {
        id: 'basico',
        name: 'Básico',
        priceSemestral: 248900,
        priceAnual: 473900,
        sections: [
          {
            emoji: '🩺',
            title: 'Servicios incluidos',
            items: [
              'Orientación médica telefónica.',
              'Orientación psicológica telefónica.',
              'Orientación nutricional telefónica.',
              'Pediatría telefónica.',
            ],
          },
        ],
      },
      {
        id: 'estandar',
        name: 'Estándar',
        priceSemestral: 351900,
        priceAnual: 672900,
        sections: [
          {
            emoji: '🩺',
            title: 'Servicios incluidos',
            items: [
              'Orientación médica telefónica.',
              'Orientación psicológica telefónica.',
              'Orientación nutricional telefónica.',
              'Pediatría telefónica.',
              'Médico a domicilio.',
            ],
          },
        ],
      },
      {
        id: 'plus',
        name: 'Plus',
        priceSemestral: 586900,
        priceAnual: 1120900,
        sections: [
          {
            emoji: '🩺',
            title: 'Servicios incluidos',
            items: [
              'Orientación médica telefónica.',
              'Orientación psicológica telefónica.',
              'Orientación nutricional telefónica.',
              'Pediatría telefónica.',
              'Médico a domicilio.',
              'Ambulancia.',
            ],
          },
        ],
      },
    ],
  },
];

/** Helpers de precios */
export function getPlanStartingPriceSemestral(plan: PlanDetail): number {
  return Math.min(...plan.tiers.map((t) => t.priceSemestral));
}

export function formatCOP(value: number): string {
  return '$ ' + value.toLocaleString('es-CO');
}
