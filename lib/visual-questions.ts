export interface VisualCell {
  type: 'number' | 'shape' | 'pattern' | 'arrow' | 'card' | 'grid' | 'empty'
  content?: string | number
  fillColor?: string
  strokeColor?: string
  backgroundColor?: string
  rotation?: number
  nested?: boolean
  innerShape?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  count?: number
}

export interface VisualQuestion {
  id: number
  type: 'sequence' | 'pattern' | 'logic'
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  matrix: VisualCell[][]
  options: VisualCell[]
  correctAnswer: number
}

export const visualQuestions: VisualQuestion[] = [
  // PREGUNTA 1 - FÁCIL: Secuencia numérica +10
  {
    id: 1,
    type: 'sequence',
    difficulty: 'easy',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'number', content: 2, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 12, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 22, backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'number', content: 32, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 42, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 52, backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'number', content: 62, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 72, backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'number', content: 32 },
      { type: 'number', content: 83 },
      { type: 'number', content: 82 },
      { type: 'number', content: 70 },
      { type: 'number', content: 52 },
      { type: 'number', content: 92 }
    ],
    correctAnswer: 2 // 82
  },

  // PREGUNTA 2 - FÁCIL: Rotación de área rellena en cuadrado
  {
    id: 2,
    type: 'pattern',
    difficulty: 'easy',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'pattern', content: 'top-left-triangle', backgroundColor: '#F0F9F9' },
        { type: 'pattern', content: 'top-right-half', backgroundColor: '#FFFFFF' },
        { type: 'pattern', content: 'bottom-right-diagonal', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'pattern', content: 'bottom-left-triangle', backgroundColor: '#FFFFFF' },
        { type: 'pattern', content: 'bottom-half', backgroundColor: '#F0F9F9' },
        { type: 'pattern', content: 'right-triangle', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'pattern', content: 'top-half', backgroundColor: '#F0F9F9' },
        { type: 'pattern', content: 'full-square', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'pattern', content: 'full-square' },
      { type: 'pattern', content: 'right-half' },
      { type: 'pattern', content: 'bottom-right-diagonal' },
      { type: 'pattern', content: 'center-square' },
      { type: 'pattern', content: 'left-half' },
      { type: 'pattern', content: 'full-square-red' }
    ],
    correctAnswer: 1 // right-half
  },

  // PREGUNTA 3 - FÁCIL: Formas básicas con relleno/borde
  {
    id: 3,
    type: 'pattern',
    difficulty: 'easy',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'shape', content: 'square', strokeColor: '#0F172A', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'square', fillColor: '#0F172A', strokeColor: '#6366F1', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'square', strokeColor: '#0F172A', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'shape', content: 'circle', strokeColor: '#0F172A', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'circle', fillColor: '#0F172A', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'circle', strokeColor: '#0F172A', nested: true, innerShape: 'circle', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'shape', content: 'square', strokeColor: '#0F172A', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'square', fillColor: '#0F172A', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'shape', content: 'square', strokeColor: '#0F172A' },
      { type: 'shape', content: 'square', fillColor: '#6366F1' },
      { type: 'shape', content: 'square', strokeColor: '#6366F1' },
      { type: 'shape', content: 'square', fillColor: '#0F172A', strokeColor: '#6366F1' },
      { type: 'shape', content: 'circle', strokeColor: '#0F172A' },
      { type: 'shape', content: 'triangle', fillColor: '#6366F1' }
    ],
    correctAnswer: 0 // square con solo borde
  },

  // PREGUNTA 4 - FÁCIL: Palos de cartas - patrón de alternancia
  {
    id: 4,
    type: 'pattern',
    difficulty: 'easy',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'card', content: 'diamond', fillColor: '#6366F1', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'heart', fillColor: '#6366F1', backgroundColor: '#FFFFFF' },
        { type: 'card', content: 'club', fillColor: '#6366F1', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'card', content: 'diamond', strokeColor: '#0F172A', backgroundColor: '#FFFFFF' },
        { type: 'card', content: 'heart', strokeColor: '#0F172A', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'club', strokeColor: '#0F172A', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'card', content: 'diamond', fillColor: '#6366F1', backgroundColor: '#F0F9F9' },
        { type: 'empty', backgroundColor: '#FFFFFF' },
        { type: 'card', content: 'club', fillColor: '#6366F1', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'card', content: 'heart', strokeColor: '#0F172A' },
      { type: 'card', content: 'diamond', fillColor: '#6366F1' },
      { type: 'card', content: 'club', fillColor: '#6366F1' },
      { type: 'card', content: 'heart', fillColor: '#6366F1' },
      { type: 'card', content: 'club', strokeColor: '#0F172A' },
      { type: 'card', content: 'heart', fillColor: '#0F172A' }
    ],
    correctAnswer: 3 // heart relleno verde
  },

  // PREGUNTA 5 - MEDIA: Grid con posiciones en secuencia
  {
    id: 5,
    type: 'pattern',
    difficulty: 'medium',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'grid', content: 'top-left', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'top-center', backgroundColor: '#FFFFFF' },
        { type: 'grid', content: 'top-right', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'grid', content: 'center-left', backgroundColor: '#FFFFFF' },
        { type: 'grid', content: 'center', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'center-right', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'grid', content: 'bottom-left', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'bottom-center', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'grid', content: 'center' },
      { type: 'grid', content: 'bottom-right' },
      { type: 'grid', content: 'center-right' },
      { type: 'grid', content: 'top-center' },
      { type: 'grid', content: 'center-left' },
      { type: 'grid', content: 'cross' }
    ],
    correctAnswer: 1 // bottom-right
  },

  // PREGUNTA 6 - MEDIA: Formas anidadas - triángulos con círculos y hexágonos
  {
    id: 6,
    type: 'pattern',
    difficulty: 'medium',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'shape', content: 'triangle', fillColor: '#0F172A', nested: true, innerShape: 'triangle', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'triangle', fillColor: '#0F172A', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'triangle', strokeColor: '#0F172A', nested: true, innerShape: 'triangle', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'shape', content: 'circle', fillColor: '#0F172A', nested: true, innerShape: 'circle', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'circle', fillColor: '#0F172A', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'circle', strokeColor: '#0F172A', nested: true, innerShape: 'circle', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'shape', content: 'hexagon', fillColor: '#0F172A', nested: true, innerShape: 'hexagon', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'hexagon', fillColor: '#0F172A', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'shape', content: 'hexagon', strokeColor: '#0F172A', nested: true, innerShape: 'hexagon' },
      { type: 'shape', content: 'hexagon', fillColor: '#6366F1' },
      { type: 'shape', content: 'circle', strokeColor: '#0F172A' },
      { type: 'shape', content: 'hexagon', fillColor: '#0F172A', nested: true },
      { type: 'shape', content: 'triangle', fillColor: '#0F172A' },
      { type: 'shape', content: 'hexagon', fillColor: '#6366F1', nested: true }
    ],
    correctAnswer: 0 // hexágono con borde y hexágono interior
  },

  // PREGUNTA 7 - MEDIA: Flechas direccionales simples
  {
    id: 7,
    type: 'pattern',
    difficulty: 'medium',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'arrow', direction: 'left', count: 1, backgroundColor: '#F0F9F9' },
        { type: 'arrow', direction: 'down', count: 1, backgroundColor: '#FFFFFF' },
        { type: 'arrow', direction: 'right', count: 1, backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'arrow', direction: 'down', count: 2, backgroundColor: '#FFFFFF' },
        { type: 'arrow', direction: 'right', count: 2, backgroundColor: '#F0F9F9' },
        { type: 'arrow', direction: 'left', count: 2, backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'arrow', direction: 'right', count: 3, backgroundColor: '#F0F9F9' },
        { type: 'arrow', direction: 'left', count: 3, backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'arrow', direction: 'up', count: 1 },
      { type: 'arrow', direction: 'up', count: 3 },
      { type: 'arrow', direction: 'left', count: 3 },
      { type: 'arrow', direction: 'down', count: 3 },
      { type: 'arrow', direction: 'right', count: 3 },
      { type: 'arrow', direction: 'down', count: 2 }
    ],
    correctAnswer: 3 // 3 flechas abajo
  },

  // PREGUNTA 8 - MEDIA: Círculos con múltiples triángulos alternando
  {
    id: 8,
    type: 'pattern',
    difficulty: 'medium',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'shape', content: 'circle', fillColor: '#0F172A', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'triangle', fillColor: '#6366F1', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'circle', strokeColor: '#0F172A', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'shape', content: 'triangle', strokeColor: '#0F172A', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'circle', fillColor: '#6366F1', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'triangle', fillColor: '#0F172A', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'shape', content: 'circle', strokeColor: '#6366F1', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'triangle', fillColor: '#6366F1', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'shape', content: 'circle', fillColor: '#6366F1' },
      { type: 'shape', content: 'triangle', strokeColor: '#0F172A' },
      { type: 'shape', content: 'circle', strokeColor: '#0F172A' },
      { type: 'shape', content: 'triangle', fillColor: '#6366F1' },
      { type: 'shape', content: 'circle', fillColor: '#0F172A' },
      { type: 'shape', content: 'square', fillColor: '#6366F1' }
    ],
    correctAnswer: 2 // círculo con borde azul oscuro
  },

  // PREGUNTA 9 - MEDIA: Secuencia numérica con multiplicación
  {
    id: 9,
    type: 'sequence',
    difficulty: 'medium',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'number', content: 3, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 6, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 12, backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'number', content: 24, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 48, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 96, backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'number', content: 192, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 384, backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'number', content: 576 },
      { type: 'number', content: 678 },
      { type: 'number', content: 768 },
      { type: 'number', content: 486 },
      { type: 'number', content: 864 },
      { type: 'number', content: 512 }
    ],
    correctAnswer: 2 // 768 (x2)
  },

  // PREGUNTA 10 - MEDIA: Cuadrados con diferentes rellenos en diagonal
  {
    id: 10,
    type: 'pattern',
    difficulty: 'medium',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'shape', content: 'square', fillColor: '#0F172A', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'square', strokeColor: '#0F172A', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'square', fillColor: '#6366F1', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'shape', content: 'square', strokeColor: '#6366F1', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'square', fillColor: '#0F172A', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'square', strokeColor: '#0F172A', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'shape', content: 'square', fillColor: '#6366F1', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'square', strokeColor: '#6366F1', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'shape', content: 'square', fillColor: '#6366F1' },
      { type: 'shape', content: 'square', strokeColor: '#0F172A' },
      { type: 'shape', content: 'square', fillColor: '#0F172A' },
      { type: 'shape', content: 'square', strokeColor: '#6366F1' },
      { type: 'shape', content: 'circle', fillColor: '#0F172A' },
      { type: 'shape', content: 'triangle', fillColor: '#6366F1' }
    ],
    correctAnswer: 2 // cuadrado relleno azul oscuro
  },

  // PREGUNTA 11 - DIFÍCIL: Formas combinadas con rotación
  {
    id: 11,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'shape', content: 'circle', fillColor: '#0F172A', nested: true, innerShape: 'triangle', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'square', fillColor: '#6366F1', nested: true, innerShape: 'circle', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'triangle', fillColor: '#0F172A', nested: true, innerShape: 'square', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'shape', content: 'square', strokeColor: '#0F172A', nested: true, innerShape: 'triangle', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'triangle', strokeColor: '#6366F1', nested: true, innerShape: 'circle', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'circle', strokeColor: '#0F172A', nested: true, innerShape: 'square', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'shape', content: 'triangle', fillColor: '#6366F1', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'circle', fillColor: '#0F172A', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'shape', content: 'square', fillColor: '#6366F1' },
      { type: 'shape', content: 'triangle', strokeColor: '#0F172A' },
      { type: 'shape', content: 'square', fillColor: '#0F172A' },
      { type: 'shape', content: 'circle', fillColor: '#6366F1' },
      { type: 'shape', content: 'hexagon', fillColor: '#0F172A' },
      { type: 'shape', content: 'square', strokeColor: '#6366F1' }
    ],
    correctAnswer: 0 // cuadrado relleno verde
  },

  // PREGUNTA 12 - DIFÍCIL: Patrón de alternancia complejo con cartas
  {
    id: 12,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'card', content: 'heart', fillColor: '#6366F1', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'diamond', strokeColor: '#0F172A', backgroundColor: '#FFFFFF' },
        { type: 'card', content: 'club', fillColor: '#6366F1', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'card', content: 'diamond', fillColor: '#0F172A', backgroundColor: '#FFFFFF' },
        { type: 'card', content: 'club', strokeColor: '#6366F1', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'heart', fillColor: '#0F172A', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'card', content: 'club', fillColor: '#6366F1', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'heart', strokeColor: '#0F172A', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'card', content: 'diamond', fillColor: '#6366F1' },
      { type: 'card', content: 'club', strokeColor: '#0F172A' },
      { type: 'card', content: 'heart', fillColor: '#6366F1' },
      { type: 'card', content: 'diamond', strokeColor: '#6366F1' },
      { type: 'card', content: 'club', fillColor: '#0F172A' },
      { type: 'card', content: 'heart', fillColor: '#0F172A' }
    ],
    correctAnswer: 0 // diamante relleno verde
  },

  // PREGUNTA 13 - DIFÍCIL: Secuencia de Fibonacci
  {
    id: 13,
    type: 'sequence',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'number', content: 1, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 1, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 2, backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'number', content: 3, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 5, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 8, backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'number', content: 13, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 21, backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'number', content: 28 },
      { type: 'number', content: 34 },
      { type: 'number', content: 32 },
      { type: 'number', content: 29 },
      { type: 'number', content: 35 },
      { type: 'number', content: 30 }
    ],
    correctAnswer: 1 // 34 (13+21)
  },

  // PREGUNTA 14 - DIFÍCIL: Grid con múltiples cuadrados
  {
    id: 14,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'grid', content: 'top-left', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'top-right', backgroundColor: '#FFFFFF' },
        { type: 'grid', content: 'bottom-left', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'grid', content: 'bottom-right', backgroundColor: '#FFFFFF' },
        { type: 'grid', content: 'center', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'top-center', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'grid', content: 'center-left', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'center-right', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'grid', content: 'top-left' },
      { type: 'grid', content: 'bottom-center' },
      { type: 'grid', content: 'center' },
      { type: 'grid', content: 'top-right' },
      { type: 'grid', content: 'bottom-left' },
      { type: 'grid', content: 'cross' }
    ],
    correctAnswer: 1 // bottom-center
  },

  // PREGUNTA 15 - DIFÍCIL: Flechas con rotación compleja
  {
    id: 15,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'arrow', direction: 'up', count: 1, backgroundColor: '#F0F9F9' },
        { type: 'arrow', direction: 'up', count: 2, backgroundColor: '#FFFFFF' },
        { type: 'arrow', direction: 'down', count: 1, backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'arrow', direction: 'down', count: 2, backgroundColor: '#FFFFFF' },
        { type: 'arrow', direction: 'left', count: 1, backgroundColor: '#F0F9F9' },
        { type: 'arrow', direction: 'left', count: 2, backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'arrow', direction: 'right', count: 1, backgroundColor: '#F0F9F9' },
        { type: 'arrow', direction: 'right', count: 2, backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'arrow', direction: 'up', count: 1 },
      { type: 'arrow', direction: 'down', count: 2 },
      { type: 'arrow', direction: 'left', count: 3 },
      { type: 'arrow', direction: 'up', count: 3 },
      { type: 'arrow', direction: 'right', count: 3 },
      { type: 'arrow', direction: 'down', count: 1 }
    ],
    correctAnswer: 0 // 1 flecha arriba (retoma ciclo)
  },

  // PREGUNTA 16 - DIFÍCIL: Hexágonos con patrones internos complejos
  {
    id: 16,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'shape', content: 'hexagon', fillColor: '#0F172A', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'hexagon', strokeColor: '#6366F1', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'hexagon', fillColor: '#6366F1', nested: true, innerShape: 'hexagon', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'shape', content: 'hexagon', strokeColor: '#0F172A', nested: true, innerShape: 'circle', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'hexagon', fillColor: '#0F172A', nested: true, innerShape: 'hexagon', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'hexagon', strokeColor: '#6366F1', nested: true, innerShape: 'hexagon', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'shape', content: 'hexagon', fillColor: '#6366F1', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'hexagon', strokeColor: '#0F172A', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'shape', content: 'hexagon', fillColor: '#6366F1', nested: true, innerShape: 'circle' },
      { type: 'shape', content: 'hexagon', fillColor: '#0F172A' },
      { type: 'shape', content: 'hexagon', strokeColor: '#6366F1' },
      { type: 'shape', content: 'circle', fillColor: '#6366F1' },
      { type: 'shape', content: 'hexagon', fillColor: '#6366F1' },
      { type: 'shape', content: 'hexagon', strokeColor: '#0F172A', nested: true }
    ],
    correctAnswer: 0 // hexágono verde con círculo interior
  },

  // PREGUNTA 17 - DIFÍCIL: Secuencia aritmética compleja (-5, +3)
  {
    id: 17,
    type: 'sequence',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'number', content: 50, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 45, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 48, backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'number', content: 43, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 46, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 41, backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'number', content: 44, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 39, backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'number', content: 36 },
      { type: 'number', content: 42 },
      { type: 'number', content: 38 },
      { type: 'number', content: 44 },
      { type: 'number', content: 40 },
      { type: 'number', content: 37 }
    ],
    correctAnswer: 1 // 42 (39+3)
  },

  // PREGUNTA 18 - DIFÍCIL: Triángulos con múltiples transformaciones
  {
    id: 18,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'shape', content: 'triangle', fillColor: '#0F172A', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'circle', fillColor: '#6366F1', nested: true, innerShape: 'triangle', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'square', strokeColor: '#0F172A', nested: true, innerShape: 'circle', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'shape', content: 'triangle', strokeColor: '#6366F1', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'circle', strokeColor: '#0F172A', nested: true, innerShape: 'square', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'square', fillColor: '#6366F1', nested: true, innerShape: 'triangle', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'shape', content: 'triangle', fillColor: '#6366F1', nested: true, innerShape: 'circle', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'circle', fillColor: '#0F172A', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'shape', content: 'square', fillColor: '#0F172A' },
      { type: 'shape', content: 'square', strokeColor: '#6366F1', nested: true, innerShape: 'square' },
      { type: 'shape', content: 'circle', fillColor: '#6366F1' },
      { type: 'shape', content: 'triangle', strokeColor: '#0F172A' },
      { type: 'shape', content: 'square', fillColor: '#6366F1' },
      { type: 'shape', content: 'hexagon', fillColor: '#0F172A' }
    ],
    correctAnswer: 0 // cuadrado relleno azul oscuro
  },

  // PREGUNTA 19 - DIFÍCIL: Patrón mixto de cartas con inversión
  {
    id: 19,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'card', content: 'heart', fillColor: '#0F172A', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'heart', strokeColor: '#6366F1', backgroundColor: '#FFFFFF' },
        { type: 'card', content: 'diamond', fillColor: '#6366F1', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'card', content: 'diamond', strokeColor: '#0F172A', backgroundColor: '#FFFFFF' },
        { type: 'card', content: 'club', fillColor: '#0F172A', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'club', strokeColor: '#6366F1', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'card', content: 'heart', fillColor: '#6366F1', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'heart', strokeColor: '#0F172A', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'card', content: 'diamond', fillColor: '#0F172A' },
      { type: 'card', content: 'club', fillColor: '#6366F1' },
      { type: 'card', content: 'heart', fillColor: '#0F172A' },
      { type: 'card', content: 'diamond', strokeColor: '#6366F1' },
      { type: 'card', content: 'club', strokeColor: '#0F172A' },
      { type: 'card', content: 'heart', strokeColor: '#6366F1' }
    ],
    correctAnswer: 0 // diamante relleno azul oscuro
  },

  // PREGUNTA 20 - DIFÍCIL: Grid con patrón diagonal complejo
  {
    id: 20,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'grid', content: 'top-left', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'center', backgroundColor: '#FFFFFF' },
        { type: 'grid', content: 'bottom-right', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'grid', content: 'top-center', backgroundColor: '#FFFFFF' },
        { type: 'grid', content: 'center-left', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'bottom-center', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'grid', content: 'top-right', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'center-right', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'grid', content: 'bottom-left' },
      { type: 'grid', content: 'center' },
      { type: 'grid', content: 'top-left' },
      { type: 'grid', content: 'bottom-right' },
      { type: 'grid', content: 'cross' },
      { type: 'grid', content: 'bottom-center' }
    ],
    correctAnswer: 0 // bottom-left (patrón diagonal)
  }
]

// Funciones auxiliares
export function calculateIQ(correctAnswers: number): number {
  if (correctAnswers <= 4) return 75 + correctAnswers * 3.5
  if (correctAnswers <= 8) return 90 + (correctAnswers - 4) * 2.5
  if (correctAnswers <= 12) return 100 + (correctAnswers - 8) * 2.5
  if (correctAnswers <= 15) return 110 + (correctAnswers - 12) * 3
  if (correctAnswers <= 17) return 120 + (correctAnswers - 15) * 5
  if (correctAnswers === 18) return 135
  if (correctAnswers === 19) return 142
  return 150
}

export function getIQCategory(iq: number, lang: string = 'es'): string {
  const categories: { [key: string]: { [key: string]: string } } = {
    es: {
      veryLow: 'Muy bajo',
      low: 'Bajo',
      belowAverage: 'Por debajo del promedio',
      average: 'Promedio',
      aboveAverage: 'Por encima del promedio',
      superior: 'Superior',
      verySuperior: 'Muy superior'
    },
    en: {
      veryLow: 'Very Low',
      low: 'Low',
      belowAverage: 'Below Average',
      average: 'Average',
      aboveAverage: 'Above Average',
      superior: 'Superior',
      verySuperior: 'Very Superior'
    },
    fr: {
      veryLow: 'Très faible',
      low: 'Faible',
      belowAverage: 'En dessous de la moyenne',
      average: 'Moyen',
      aboveAverage: 'Au-dessus de la moyenne',
      superior: 'Supérieur',
      verySuperior: 'Très supérieur'
    },
    de: {
      veryLow: 'Sehr niedrig',
      low: 'Niedrig',
      belowAverage: 'Unter dem Durchschnitt',
      average: 'Durchschnittlich',
      aboveAverage: 'Über dem Durchschnitt',
      superior: 'Überlegen',
      verySuperior: 'Sehr überlegen'
    },
    it: {
      veryLow: 'Molto basso',
      low: 'Basso',
      belowAverage: 'Sotto la media',
      average: 'Medio',
      aboveAverage: 'Sopra la media',
      superior: 'Superiore',
      verySuperior: 'Molto superiore'
    },
    pt: {
      veryLow: 'Muito baixo',
      low: 'Baixo',
      belowAverage: 'Abaixo da média',
      average: 'Média',
      aboveAverage: 'Acima da média',
      superior: 'Superior',
      verySuperior: 'Muito superior'
    },
    sv: {
      veryLow: 'Mycket låg',
      low: 'Låg',
      belowAverage: 'Under genomsnittet',
      average: 'Genomsnittlig',
      aboveAverage: 'Över genomsnittet',
      superior: 'Överlägsen',
      verySuperior: 'Mycket överlägsen'
    },
    no: {
      veryLow: 'Veldig lav',
      low: 'Lav',
      belowAverage: 'Under gjennomsnittet',
      average: 'Gjennomsnittlig',
      aboveAverage: 'Over gjennomsnittet',
      superior: 'Overlegen',
      verySuperior: 'Veldig overlegen'
    }
  }

  const cat = categories[lang] || categories['es']
  
  if (iq < 70) return cat.veryLow
  if (iq < 85) return cat.low
  if (iq < 100) return cat.belowAverage
  if (iq < 115) return cat.average
  if (iq < 130) return cat.aboveAverage
  if (iq < 145) return cat.superior
  return cat.verySuperior
}

export function getIQDescription(iq: number, lang: string = 'es'): string {
  const descriptions: { [key: string]: { [key: string]: string } } = {
    es: {
      veryLow: 'Tu puntuación indica dificultades significativas en el razonamiento abstracto.',
      low: 'Tu puntuación está por debajo del promedio pero con margen de mejora.',
      belowAverage: 'Tu capacidad de razonamiento está ligeramente por debajo del promedio poblacional.',
      average: 'Tienes una inteligencia dentro del rango promedio, como la mayoría de la población.',
      aboveAverage: 'Tu inteligencia está por encima del promedio. Tienes excelentes capacidades de razonamiento.',
      superior: 'Posees una inteligencia superior. Tu capacidad de análisis está muy por encima del promedio.',
      verySuperior: 'Tu puntuación indica un nivel de inteligencia excepcional, en el rango de genio.'
    },
    en: {
      veryLow: 'Your score indicates significant difficulties in abstract reasoning.',
      low: 'Your score is below average but with room for improvement.',
      belowAverage: 'Your reasoning ability is slightly below the population average.',
      average: 'You have intelligence within the average range, like most of the population.',
      aboveAverage: 'Your intelligence is above average. You have excellent reasoning abilities.',
      superior: 'You possess superior intelligence. Your analytical capacity is well above average.',
      verySuperior: 'Your score indicates an exceptional level of intelligence, in the genius range.'
    },
    fr: {
      veryLow: 'Votre score indique des difficultés importantes dans le raisonnement abstrait.',
      low: 'Votre score est en dessous de la moyenne mais avec une marge d\'amélioration.',
      belowAverage: 'Votre capacité de raisonnement est légèrement en dessous de la moyenne de la population.',
      average: 'Vous avez une intelligence dans la moyenne, comme la majorité de la population.',
      aboveAverage: 'Votre intelligence est au-dessus de la moyenne. Vous avez d\'excellentes capacités de raisonnement.',
      superior: 'Vous possédez une intelligence supérieure. Votre capacité d\'analyse est bien au-dessus de la moyenne.',
      verySuperior: 'Votre score indique un niveau d\'intelligence exceptionnel, dans la gamme du génie.'
    },
    de: {
      veryLow: 'Ihre Punktzahl deutet auf erhebliche Schwierigkeiten beim abstrakten Denken hin.',
      low: 'Ihre Punktzahl liegt unter dem Durchschnitt, aber mit Verbesserungspotenzial.',
      belowAverage: 'Ihre Denkfähigkeit liegt leicht unter dem Bevölkerungsdurchschnitt.',
      average: 'Sie haben eine Intelligenz im Durchschnittsbereich, wie die meisten Menschen.',
      aboveAverage: 'Ihre Intelligenz liegt über dem Durchschnitt. Sie haben ausgezeichnete Denkfähigkeiten.',
      superior: 'Sie besitzen überlegene Intelligenz. Ihre analytische Fähigkeit liegt deutlich über dem Durchschnitt.',
      verySuperior: 'Ihre Punktzahl deutet auf ein außergewöhnliches Intelligenzniveau hin, im Geniebereich.'
    },
    it: {
      veryLow: 'Il tuo punteggio indica difficoltà significative nel ragionamento astratto.',
      low: 'Il tuo punteggio è sotto la media ma con margine di miglioramento.',
      belowAverage: 'La tua capacità di ragionamento è leggermente sotto la media della popolazione.',
      average: 'Hai un\'intelligenza nel range medio, come la maggior parte della popolazione.',
      aboveAverage: 'La tua intelligenza è sopra la media. Hai eccellenti capacità di ragionamento.',
      superior: 'Possiedi un\'intelligenza superiore. La tua capacità analitica è molto sopra la media.',
      verySuperior: 'Il tuo punteggio indica un livello di intelligenza eccezionale, nella gamma del genio.'
    },
    pt: {
      veryLow: 'Sua pontuação indica dificuldades significativas no raciocínio abstrato.',
      low: 'Sua pontuação está abaixo da média, mas com margem para melhoria.',
      belowAverage: 'Sua capacidade de raciocínio está ligeiramente abaixo da média da população.',
      average: 'Você tem inteligência dentro da faixa média, como a maioria da população.',
      aboveAverage: 'Sua inteligência está acima da média. Você tem excelentes capacidades de raciocínio.',
      superior: 'Você possui inteligência superior. Sua capacidade analítica está bem acima da média.',
      verySuperior: 'Sua pontuação indica um nível de inteligência excepcional, na faixa de gênio.'
    },
    sv: {
      veryLow: 'Ditt resultat indikerar betydande svårigheter i abstrakt resonemang.',
      low: 'Ditt resultat är under genomsnittet men med utrymme för förbättring.',
      belowAverage: 'Din resonemangsförmåga är något under befolkningens genomsnitt.',
      average: 'Du har intelligens inom genomsnittsområdet, som majoriteten av befolkningen.',
      aboveAverage: 'Din intelligens är över genomsnittet. Du har utmärkta resonemangsförmågor.',
      superior: 'Du besitter överlägsen intelligens. Din analytiska förmåga är långt över genomsnittet.',
      verySuperior: 'Ditt resultat indikerar en exceptionell nivå av intelligens, inom geninivån.'
    },
    no: {
      veryLow: 'Din poengsum indikerer betydelige vanskeligheter i abstrakt resonnement.',
      low: 'Din poengsum er under gjennomsnittet, men med rom for forbedring.',
      belowAverage: 'Din resonnementsevne er litt under befolkningens gjennomsnitt.',
      average: 'Du har intelligens innenfor gjennomsnittsområdet, som de fleste i befolkningen.',
      aboveAverage: 'Din intelligens er over gjennomsnittet. Du har utmerkede resonnementsevner.',
      superior: 'Du besitter overlegen intelligens. Din analytiske kapasitet er langt over gjennomsnittet.',
      verySuperior: 'Din poengsum indikerer et eksepsjonelt nivå av intelligens, innenfor geninivået.'
    }
  }

  const desc = descriptions[lang] || descriptions['es']
  
  if (iq < 70) return desc.veryLow
  if (iq < 85) return desc.low
  if (iq < 100) return desc.belowAverage
  if (iq < 115) return desc.average
  if (iq < 130) return desc.aboveAverage
  if (iq < 145) return desc.superior
  return desc.verySuperior
}
