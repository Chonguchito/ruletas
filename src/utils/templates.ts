import { WheelTemplate } from '../types/wheel';

export const PRESET_TEMPLATES: WheelTemplate[] = [
  {
    id: 'nombres_sorteo',
    title: 'Nombres (Ejemplo Sorteo)',
    description: 'Lista clásica de participantes para rifas o asignaciones',
    items: ['Ana', 'Carlos', 'Lucía', 'Mateo', 'Valentina', 'Santiago', 'Sofía', 'Martín'],
  },
  {
    id: 'premios',
    title: 'Premios y Recompensas',
    description: 'Premios comunes para concursos o dinámicas de grupo',
    items: ['Premio Mayor', 'Descuento 20%', 'Café gratis', 'Premio Sorpresa', 'Sigue participando', 'Entrada gratis', 'Stickers'],
  },
  {
    id: 'si_no',
    title: 'Sí / No / Tal vez',
    description: 'Toma de decisiones rápidas para dudas existenciales',
    items: ['¡Sí, definitivamente!', 'No, mejor no', 'Pregunta de nuevo', 'Tal vez luego', 'Totalmente sí', 'Rotundamente no'],
  },
  {
    id: 'que_comemos',
    title: '¿Qué comemos hoy?',
    description: 'Para resolver la eterna duda gastronómica',
    items: ['Pizza', 'Hamburguesas', 'Sushi', 'Tacos', 'Milanesas', 'Pasta', 'Ensalada fresca', 'Empanadas'],
  },
  {
    id: 'numeros_1_10',
    title: 'Números (1 al 10)',
    description: 'Sorteo numérico rápido para turnos o juegos',
    items: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  },
  {
    id: 'verdad_reto',
    title: 'Verdad o Reto',
    description: 'Para juegos con amigos o dinámicas rompehielo',
    items: ['Verdad', 'Reto', 'Pasa el turno', 'Verdad extrema', 'Reto grupal', 'Comodín'],
  },
  {
    id: 'dias_semana',
    title: 'Días de la Semana',
    description: 'Asignar turnos o planificar días',
    items: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  },
];

export const MULTI_WHEEL_PRESETS = [
  {
    id: 'trivia_dinamica',
    name: 'Sorteo Doble: Participante + Reto',
    wheels: [
      {
        title: 'Participante',
        items: ['Martina', 'Nicolás', 'Camila', 'Tomás', 'Julieta', 'Joaquín'],
      },
      {
        title: 'Categoría / Reto',
        items: ['Cultura General', 'Mímica', 'Dibujar en 30s', 'Cantar estribillo', 'Trabalenguas', 'Dato Curioso'],
      },
    ],
  },
  {
    id: 'tres_dimensiones',
    name: 'Sorteo Triple: Quién + Qué hace + Dónde',
    wheels: [
      {
        title: 'Quién',
        items: ['El más joven', 'El organizador', 'El de la derecha', 'Tú mismo', 'Todos a la vez'],
      },
      {
        title: 'Acción',
        items: ['Baila', 'Cuenta un chiste', 'Invita la ronda', 'Hace 5 flexiones', 'Elige la música'],
      },
      {
        title: 'Condición',
        items: ['En 10 segundos', 'Con voz de ardilla', 'En cámara lenta', 'Con los ojos cerrados'],
      },
    ],
  },
];
