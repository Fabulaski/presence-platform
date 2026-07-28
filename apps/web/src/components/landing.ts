export function getLandingContent() {
  return {
    hero: {
      headline: 'Scripture where people already are.',
      subheadline: 'La primera infraestructura SaaS que permite incorporar experiencias espirituales contextuales mediante una API y un SDK ligero.',
      cta: 'Explorar Documentación (/docs)'
    },
    features: [
      { title: 'Context Engine', description: 'Evalúa el contexto y discierne el momento óptimo para acompañar al usuario.' },
      { title: 'YouVersion Integration', description: 'Conexión con traducciones bíblicas y planes de lectura.' },
      { title: 'Gloo AI Pipeline', description: '5 agentes de IA especializados en detectar necesidades y redactar reflexiones.' },
      { title: 'Grafo Espiritual', description: 'Registro de crecimiento por capítulos en lugar de chats olvidados.' }
    ]
  };
}
