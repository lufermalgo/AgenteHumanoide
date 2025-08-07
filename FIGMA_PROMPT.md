# PROMPT PARA FIGMA MAKE - Agente Humanoide Assessment

## 🎯 OBJETIVO
Crear un diseño web moderno y profesional para una aplicación de assessment de IA generativa con avatar humanoide interactivo.

## 🎨 IDENTIDAD VISUAL - SUMMAN SAS
- **Color Principal:** #9bc41c (Verde institucional)
- **Color Secundario:** #f08a00 (Naranja institucional)  
- **Color Terciario:** #666666 (Gris institucional)
- **Estilo:** Profesional, moderno, tecnológico pero humano

## 📱 LAYOUT PRINCIPAL
### Estructura Desktop (1200px+):
- **Grid 2 columnas (50/50)**
- **Columna Izquierda:** Contenido de la pregunta y controles
- **Columna Derecha:** Avatar humanoide en video streaming
- **Espaciado:** 24px entre elementos, 32px padding general

### Elementos de la Columna Izquierda:
1. **Header superior:**
   - Logo Summan SAS (esquina superior izquierda)
   - Indicador de progreso (X de Y preguntas)
   - Estado de conexión

2. **Área principal de pregunta:**
   - Título de la pregunta (tipografía grande, peso 600)
   - Subtítulo o contexto (si aplica)
   - Texto de la pregunta actual (tipografía clara, legible)

3. **Controles de voz:**
   - Botón principal de "Hablar" (circular, grande, color primario)
   - Indicador visual de estado (escuchando/procesando/respondiendo)
   - Botón secundario "Siguiente pregunta" (deshabilitado hasta completar)

4. **Footer:**
   - Tiempo estimado restante
   - Botón de ayuda o soporte

### Elementos de la Columna Derecha:
1. **Área del avatar:**
   - Contenedor para video D-ID (aspect ratio 16:9)
   - Fondo sutil con gradiente institucional
   - Indicadores de estado de audio/video

2. **Panel de estado conversacional:**
   - "Escuchando..." (verde #9bc41c)
   - "Procesando..." (naranja #f08a00)  
   - "Respondiendo..." (gris #666666)

## 📱 RESPONSIVE DESIGN
### Tablet (768px - 1199px):
- Mantener grid 2 columnas pero ajustar proporciones (40/60)
- Reducir tamaños de fuente y espaciado

### Mobile (< 768px):
- **Stack vertical:** Avatar arriba, contenido abajo
- **Avatar:** Altura fija 300px
- **Contenido:** Scroll vertical si es necesario
- **Controles:** Botones más grandes para touch

## 🎨 COMPONENTES DE DISEÑO

### Botones:
- **Primario:** Fondo #9bc41c, texto blanco, border-radius 8px
- **Secundario:** Borde #f08a00, texto #f08a00, fondo transparente
- **Estados:** Hover, active, disabled con variaciones de opacity

### Cards/Contenedores:
- **Fondo:** Blanco #ffffff
- **Sombra:** 0 4px 8px rgba(0,0,0,0.15)
- **Border-radius:** 12px
- **Padding interno:** 24px

### Tipografía:
- **Fuente:** Inter (Google Fonts)
- **Jerarquía:** 
  - H1: 32px, peso 700
  - H2: 24px, peso 600  
  - Cuerpo: 16px, peso 400
  - Pequeño: 14px, peso 400

### Estados de Interacción:
- **Hover:** Transición suave 0.2s
- **Focus:** Outline color institucional
- **Loading:** Animación de pulso sutil

## 🔄 ESTADOS DE LA APLICACIÓN

### Estado Inicial:
- Avatar en reposo
- Botón "Comenzar Assessment" prominente
- Texto de bienvenida personalizado

### Estado Escuchando:
- Avatar con animación sutil
- Indicador visual de grabación (onda de audio)
- Botón "Detener grabación"

### Estado Procesando:
- Avatar con animación de "pensando"
- Spinner o loader con colores institucionales
- Texto "Analizando tu respuesta..."

### Estado Respondiendo:
- Avatar hablando (sincronización labial)
- Transcripción en tiempo real (opcional)
- Controles de volumen

## 🎯 EXPERIENCIA DE USUARIO

### Principios:
- **Simplicidad:** Un solo foco de atención por pantalla
- **Claridad:** Instrucciones claras y concisas
- **Feedback:** Estados visuales inmediatos
- **Accesibilidad:** Contraste WCAG AA, navegación por teclado

### Microinteracciones:
- Transiciones suaves entre estados
- Feedback háptico en mobile
- Animaciones sutiles pero informativas

## 📐 ESPECIFICACIONES TÉCNICAS

### Breakpoints:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px  
- Desktop: 1024px - 1199px
- Wide: 1200px+

### Espaciado (múltiplos de 4px):
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, xxl: 48px

### Grid System:
- 12 columnas con gutters de 24px
- Contenedor máximo: 1200px centrado

## 🎨 INSPIRACIÓN VISUAL
- **Estilo:** Mezcla entre Zoom/Teams (profesional) y apps de voz (amigable)
- **Referencia:** Interfaz limpia como Notion, con toques tecnológicos como OpenAI
- **Personalidad:** Profesional pero cercano, tecnológico pero humano

---

**NOTA IMPORTANTE:** El diseño debe transmitir confianza, profesionalismo y cercanía humana. Los usuarios son empleados de Summan SAS realizando un assessment interno, no clientes externos.