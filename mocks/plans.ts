export interface PlanDetail {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  color: string;
  icon: string;
  priceRange: string;
  description: string;
  sections: PlanSection[];
}

export interface PlanSection {
  emoji: string;
  title: string;
  items: string[];
}

export const plans: PlanDetail[] = [
  {
    id: 'premium',
    name: 'Plan Premium',
    shortName: 'CL Premium',
    tagline: 'Máxima cobertura y protección integral',
    color: '#FFB800',
    icon: 'Crown',
    priceRange: '$ 62.910 – $ 671.040',
    description:
      'CL Premium es nuestro plan más completo y avanzado.\nIntegra las coberturas esenciales de CL Cuida, CL Repara, CL Mueve, CL Conecta y CL Mascotas en una sola membresía, ofreciéndote protección integral en salud, hogar, movilidad, bienestar y asistencia veterinaria.\n\nUn plan diseñado para quienes buscan máxima tranquilidad, atención prioritaria y acceso ampliado a servicios y beneficios especiales.\n\nEste plan ofrece atención integral y prioritaria con acceso a todos los servicios incluidos en los demás planes, además de descuentos exclusivos y acceso preferente a especialistas y profesionales aliados.',
    sections: [
      {
        emoji: '🩹',
        title: 'Salud y bienestar',
        items: [
          'Orientación médica telefónica: ilimitada.',
          'Médico a domicilio: hasta 3 eventos combinados con traslado médico terrestre.',
          'Traslado médico terrestre: hasta 3 eventos combinados con médico a domicilio.',
          'Orientación nutricional y psicológica telefónica: ilimitadas.',
          'Videollamada con médico pediatra: ilimitada.',
          'Exámenes de laboratorio: 2 eventos al año.',
          'Consulta con especialistas: ilimitado (únicamente se cubre 1° consulta).',
          'Exámenes básicos de laboratorio, terapias y consultas con especialistas: con descuento preferencial.',
          'Limpieza dental y urgencia dental: 2 eventos al año c/u.',
          'Consulta médica con optómetra.',
          'Terapias físicas – respiratorias: 3 eventos al año.',
        ],
      },
      {
        emoji: '🏠',
        title: 'Hogar',
        items: [
          'Plomería, cerrajería, electricidad, vidriería y handyman: hasta 3 eventos combinados al año.',
          'Reparación y/o mantenimiento de electrodomésticos: hasta 3 eventos al año (individuales).',
          'Vidriería adicional o reemplazo de cristales: incluido dentro de los 3 combinados.',
        ],
      },
      {
        emoji: '🚗',
        title: 'Movilidad y asistencia vial',
        items: [
          'Grúa para carro o moto: hasta 3 eventos combinados junto con cambio de llantas.',
          'Cerrajería vial, reinicio de batería y transporte por avería: hasta 3 eventos combinados al año.',
          'Cambio de llanta, cerrajería y reinicio de batería: hasta 3 eventos combinados al año.',
          'Transporte por avería: hasta 3 eventos al año.',
          'Conductor elegido: hasta 3 eventos al año.',
          'Servicio de orientación legal telefónica.',
          'Mantenimiento de bicicletas: 1 evento anual.',
        ],
      },
      {
        emoji: '🌐',
        title: 'Bienestar y soporte complementario',
        items: [
          'Asesoría financiera para emprendedores: ilimitada.',
          'Asistencia tecnológica telefónica: ilimitada.',
          'Profesor virtual: hasta 3 eventos al año.',
          'Empleada doméstica por incapacidad: hasta 2 eventos al año.',
          'Aseo y limpieza del hogar + asistencia en bienestar financiero: hasta 3 eventos combinados.',
          'Orientación legal telefónica: ilimitada.',
          'Transporte por pérdida de ruta: 1 evento anual.',
        ],
      },
      {
        emoji: '🐾',
        title: 'Mascotas',
        items: [
          'Veterinario en casa o en clínica de la red: ilimitado.',
          'Refuerzo de vacunas: 1 evento anual.',
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
    priceRange: '$ 30.510 – $ 325.440',
    description:
      'Con Plan Mascotas, garantizas la atención y el bienestar de tu mascota con servicios médicos, apoyo profesional y acompañamiento integral.\nEste plan ofrece las asistencias fundamentales para mantener su salud y cuidado día a día.',
    sections: [
      {
        emoji: '🐾',
        title: 'Servicios incluidos',
        items: [
          'Veterinario en casa o en clínica de la red: ilimitado. Atención veterinaria presencial, ya sea en tu hogar o en clínicas aliadas, para chequeos o urgencias básicas.',
          'Asesoría nutricional telefónica: 1 evento al año. Orientación con profesionales en nutrición animal para mantener una dieta saludable y equilibrada.',
          'Videollamada con veterinario: hasta 2 eventos al año. Consulta rápida en línea para resolver síntomas, dudas o emergencias leves sin desplazarte.',
          'Desparasitación: 1 evento anual. Aplicación del tratamiento antiparasitario según el calendario recomendado por el veterinario.',
          'Guardería o paseador canino: 1 evento anual. Servicio de acompañamiento o paseo profesional para tu mascota cuando lo necesites.',
        ],
      },
    ],
  },
  {
    id: 'complementario',
    name: 'Plan Complementario',
    shortName: 'CL Complementario',
    tagline: 'Apoyo legal, financiero y tecnológico',
    color: '#6366F1',
    icon: 'Laptop',
    priceRange: '$ 26.010 – $ 277.440',
    description:
      'Con Plan Complementario, tu vida es más fácil.\nEste plan reúne una amplia variedad de asistencias complementarias que te ayudan a resolver temas financieros, tecnológicos y personales desde la comodidad de tu hogar.\nPerfecto para quienes buscan acompañamiento experto y soporte remoto en su día a día.',
    sections: [
      {
        emoji: '💼',
        title: 'Servicios incluidos',
        items: [
          'Asesoría financiera para emprendedores: ilimitada. Obtén orientación profesional sobre planificación financiera, manejo de presupuestos y desarrollo de negocios.',
          'Declaración de renta: hasta 3 eventos al año. Acompañamiento profesional en el proceso de declaración de impuestos y cumplimiento tributario.',
          'Asistencia tecnológica telefónica: ilimitada. Soporte remoto para la configuración y solución de problemas en computadores, redes o dispositivos electrónicos.',
          'Profesor virtual: hasta 3 eventos al año. Accede a clases personalizadas en línea para reforzar temas académicos o aprender nuevas habilidades.',
          'Aseo y limpieza del hogar: hasta 3 eventos combinados al año junto con Asistencia en bienestar financiero.',
          'Asistencia en bienestar financiero: hasta 3 eventos combinados al año junto con Aseo y limpieza del hogar.',
        ],
      },
    ],
  },
  {
    id: 'hogar',
    name: 'Plan Hogar',
    shortName: 'CL Hogar',
    tagline: 'Tu hogar siempre protegido',
    color: '#0EA5E9',
    icon: 'Home',
    priceRange: '$ 32.310 – $ 344.640',
    description:
      'Con Plan Hogar, tu hogar estará siempre protegido ante cualquier imprevisto.\nEste plan ofrece soluciones rápidas y confiables con profesionales especializados en mantenimiento, reparaciones y asistencias de emergencia.',
    sections: [
      {
        emoji: '🧰',
        title: 'Servicios incluidos',
        items: [
          'Plomería por urgencia: hasta 3 eventos combinados al año junto con todero (Handyman). Atención inmediata en casos de fugas, obstrucciones, daños en grifos o tuberías, incluye materiales básicos para la reparación.',
          'Todero (Handyman): hasta 3 eventos combinados al año junto con plomería por urgencia. Servicio de mantenimiento general, instalación de cortinas, cuadros o pequeños ajustes en el hogar.',
          'Electricidad por urgencia: hasta 3 eventos combinados al año junto con cerrajería por urgencia. Reparación de fallas eléctricas, cortocircuitos o problemas con tomacorrientes e interruptores.',
          'Cerrajería por urgencias: hasta 3 eventos combinados al año junto con electricidad por urgencia. Asistencia para apertura de puertas, cambio de guardas o reparación de cerraduras.',
          'Reparación y mantenimiento de electrodomésticos: hasta 3 eventos al año.',
          'Instalación de duchas: 1 evento.',
          'Instalación de electrodomésticos: 1 evento al año.',
        ],
      },
    ],
  },
  {
    id: 'salud',
    name: 'Plan Salud',
    shortName: 'CL Salud',
    tagline: 'Tu salud y la de tu familia primero',
    color: '#EF4444',
    icon: 'HeartPulse',
    priceRange: '$ 35.100 – $ 374.400',
    description:
      'Con Plan Salud, tu salud y la de tu familia siempre están primero.\nEste plan te ofrece una combinación de asistencias médicas presenciales y telefónicas diseñadas para cuidar tu bienestar físico y emocional durante todo el año.',
    sections: [
      {
        emoji: '🩹',
        title: 'Servicios incluidos',
        items: [
          'Orientación médica telefónica: ilimitada. Recibe atención médica telefónica las 24 horas del día para resolver síntomas leves o recibir indicaciones básicas sin necesidad de desplazarte.',
          'Médico a domicilio: hasta 3 eventos combinados al año. Un profesional médico acudirá a tu hogar en caso de enfermedad o necesidad de atención no urgente.',
          'Traslado médico terrestre: ilimitado. Cobertura en ambulancia para el paciente y acompañante en caso de emergencia o traslado programado según valoración médica.',
          'Orientación nutricional telefónica: ilimitada. Asesoría con especialistas en nutrición para crear o ajustar planes alimenticios personalizados.',
          'Orientación psicológica telefónica: ilimitada. Apoyo emocional y psicológico con profesionales certificados, disponible cuando más lo necesites.',
        ],
      },
    ],
  },
  {
    id: 'movilidad',
    name: 'Plan Movilidad',
    shortName: 'CL Movilidad',
    tagline: 'Respaldo total en la vía',
    color: '#14B8A6',
    icon: 'Car',
    priceRange: '$ 27.990 – $ 298.560',
    description:
      'Con Plan Movilidad, siempre tendrás respaldo en la vía ante cualquier imprevisto con tu vehículo.\nEste plan te ofrece una combinación de asistencias mecánicas, de movilidad y apoyo legal, pensadas para conductores que buscan tranquilidad y acompañamiento permanente.',
    sections: [
      {
        emoji: '🔧',
        title: 'Servicios incluidos',
        items: [
          'Videollamada con técnico mecánico: hasta 5 eventos al año. Recibe orientación técnica inmediata para resolver fallas o dudas mecánicas desde donde te encuentres.',
          'Grúa para carro o moto: hasta 5 eventos al año. Cobertura nacional para remolcar tu vehículo en caso de avería o accidente.',
          'Reinicio de batería, cerrajería vial y cambio de llanta: hasta 3 eventos combinados en total. Puedes distribuir libremente esos tres eventos entre estos servicios según tus necesidades.',
          'Traslado en caso de avería: hasta 3 eventos al año. Para cubrir transporte del conductor y acompañantes si el vehículo queda inmovilizado.',
          'Conductor elegido: hasta 3 eventos al año. Para regresar a casa de manera segura en caso de no poder conducir.',
          'Mantenimiento de bicicletas: 1 evento anual. Para limpieza, ajuste o calibración básica.',
          'Asesoría jurídica en accidentes de tránsito: ilimitada. Orientación legal inmediata en caso de colisiones, comparendos o incidentes viales.',
          'Asesoría legal en impugnación de comparendos: ilimitada. Acompañamiento y guía en procesos administrativos o reclamaciones ante infracciones.',
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
    priceRange: '$ 54.900 – $ 687.816',
    description:
      'El Plan Manada es la membresía integral de CL Tiene que cuida lo más importante de tu vida: tú y tu mascota.\n\nUn solo plan que te acompaña en emergencias, dudas médicas y momentos inesperados, con asistencias para humanos y atención veterinaria para tu perro o gato.\n\nPorque cuando son manada, nadie se queda solo.',
    sections: [
      {
        emoji: '🩺',
        title: 'Asistencias para cuidar tu salud',
        items: [
          'Orientación médica telefónica: ilimitado. Guía médica inmediata para síntomas no urgentes, recomendaciones y primeros pasos.',
          'Médico a domicilio: ilimitado. Atención médica en tu casa, previa autorización del equipo médico.',
          'Traslado médico terrestre: 3 eventos anuales. Traslado en ambulancia o transporte terrestre a una unidad médica.',
          'Orientación nutricional telefónica: ilimitado. Asesoría para hábitos alimenticios y bienestar.',
          'Orientación psicológica telefónica: ilimitado. Acompañamiento emocional y recomendaciones profesionales.',
          'Videollamada con médico pediatra: 5 eventos anuales. Consulta por videollamada para niños y adolescentes, disponible 24/7.',
        ],
      },
      {
        emoji: '🐾',
        title: 'Asistencias para tu perro o gato',
        items: [
          'Orientación veterinaria telefónica: ilimitado. Guía sobre síntomas, acciones preventivas y recomendaciones iniciales.',
          'Consulta veterinaria a domicilio o en clínica de la red: ilimitado. Atención coordinada según criterio veterinario.',
          'Videollamada con veterinario: 5 eventos anuales. Asesoría en tiempo real sin necesidad de desplazamiento.',
          'Asesoría nutricional telefónica para mascotas: ilimitado. Recomendaciones para dieta, control de peso y hábitos saludables.',
          'Funeral de la mascota (bono $250.000): 1 evento por vigencia. Bono para servicios funerarios con proveedores aliados.',
          'Baño medicado para mascota: 1 evento anual. Incluye corte de uñas, limpieza externa de oídos, baño y cepillado.',
          'Refuerzo de vacunas y desparasitación: 1 evento anual. Aplicación en consultorio de la red, con cita previa.',
          'Orientación emocional por duelo o pérdida de la mascota: ilimitado.',
          'Guardería o paseador canino por incapacidad del dueño: 1 evento anual.',
          'Chip de identificación: 1 evento por vigencia. Instalación y registro de microchip para facilitar identificación.',
          'Publicación en redes sociales en caso de pérdida: 2 eventos por año.',
          'Asesoría legal telefónica por daños a terceros: ilimitado.',
        ],
      },
    ],
  },
];
