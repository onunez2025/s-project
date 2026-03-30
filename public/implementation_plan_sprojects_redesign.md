# Rediseño Visual de S-Project → Estética EBM

## Contexto

**S-Project** es una aplicación Angular 21 standalone que utiliza Tailwind CSS con clases directas en templates inline (`template: \`...\``). **EBM** es una aplicación React con Tailwind CSS y un sistema de design tokens basado en CSS custom properties (HSL) definidas en `index.css`.

El objetivo es hacer que S-Project sea **visualmente idéntica** a EBM sin cambiar funcionalidad, estructura de componentes, base de datos ni servicios.

> [!IMPORTANT]
> **Diferencia clave de stack**: S-Project usa Angular (templates inline en `.component.ts`) mientras EBM usa React (`.tsx`). **No se migrará de framework**. Solo se modificarán las clases de Tailwind CSS, estilos CSS globales y la estructura visual del HTML en los templates Angular existentes.

## Análisis Comparativo

### Diferencias Visuales Identificadas

| Aspecto | S-Project (Actual) | EBM (Objetivo) |
|---|---|---|
| **Sidebar** | Fondo `slate-900`, ítems con `rounded-xl`, activo `bg-blue-600`, perfil en la parte inferior con popover | Fondo `slate-50/80` (light) / `card` (dark), ítems con `rounded-md`, activo `bg-primary text-primary-foreground`, perfil arriba del nav |
| **Login** | Card centrada con glassmorphism sobre bg de imagen Unsplash, esquinas `rounded-3xl` | Split layout (50/50), izquierda brand panel oscuro, derecha form limpio, sin imagen de fondo |
| **Header** | Breadcrumb simple con botón settings y notificaciones | Solo header mobile con hamburger menu, sin header desktop separado |
| **Cards** | `rounded-2xl`, sombras pesadas `shadow-2xl`, bordes `border-slate-100` | `rounded-lg`, sombras sutiles `shadow-sm`, bordes con token `border-border` |
| **Botones primarios** | `bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30 hover:-translate-y-0.5` | `bg-primary rounded-md shadow-sm hover:bg-primary/90` (sin translate) |
| **Inputs** | `rounded-xl bg-slate-50 focus:ring-4 focus:ring-blue-500/10 p-3` | `rounded-md bg-background border-input h-10 px-3 py-2 focus:ring-2 focus:ring-primary` |
| **Tipografía** | Tamaños grandes (`text-3xl`, `text-2xl`) con estilo bold-heavy | Tamaños compactos (`text-2xl`, `text-lg`) con estilo profesional |
| **Sistema de colores** | Colores directos de Tailwind (`blue-600`, `slate-800`, etc.) | Design tokens HSL via CSS variables (`primary`, `foreground`, `muted`, etc.) |
| **Scrollbar** | Custom scrollbar inline en cada componente | Global scrollbar definida en `index.css` |
| **Tablas** | `divide-slate-100`, headers `bg-slate-50`, `uppercase tracking-wider` | `divide-border`, headers `bg-muted/50`, `text-muted-foreground font-medium` |
| **Badges/Tags** | `rounded-full` con colores pastel directos | `rounded-full` con tokens `bg-secondary text-secondary-foreground` |
| **Modales/Slide-overs** | Slide-over desde la derecha con `bg-slate-900/40 backdrop-blur-sm` | `Modal` component centrado con overlay `bg-background/80 backdrop-blur-sm` |
| **Animaciones** | `hover:-translate-y-0.5`, `shadow-lg shadow-blue-600/30` | `transition-colors`, sin translate, sombras sutiles |
| **Dark mode** | Parcial, usando `dark:` prefixes con slate | Completo, usando CSS variables que cambian en `.dark` |

---

## Propuesta de Cambios

> [!CAUTION]
> **Regla de oro**: NO se toca ninguna lógica de negocio, servicio, modelo, routing, ni base de datos. Solo se modifican clases CSS, estructura HTML visual y archivos de estilos globales.

### Fase 1: Sistema de Design Tokens (Fundación)

#### [MODIFY] [styles.css](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/styles.css)
- Implementar el mismo sistema de CSS custom properties HSL que usa EBM (`--background`, `--foreground`, `--primary`, `--card`, `--border`, `--muted`, `--destructive`, etc.)
- Copiar las animaciones globales (`fadeIn`, `zoomIn95`, `animate-in`)
- Implementar los estilos globales de scrollbar
- Agregar reglas base (`* { border-color: hsl(var(--border)); }`, `body { bg-background text-foreground }`)

#### [MODIFY] [tailwind.config.js](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/tailwind.config.js)
- Extender la configuración de Tailwind para que reconozca los nuevos tokens de color (`background`, `foreground`, `primary`, `card`, `border`, `muted`, `accent`, `destructive`, etc.) exactamente como EBM

---

### Fase 2: Layout Principal (Shell)

#### [MODIFY] [app.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/app.component.ts)
Rediseñar el template completo del sidebar y header para que sea idéntico al layout de EBM:

**Sidebar:**
- Fondo: de `bg-slate-900` → `bg-card` (light), con `border-r border-border`
- Logo: Mantener el logo "S" y nombre "S-Project" pero con el estilo compacto de EBM (padding `p-6`, `gap-3`)
- Perfil de usuario: Mover de la parte inferior a la parte superior del nav (debajo del logo), usando el estilo de tarjeta compacta de EBM
- Ítems de navegación: de `rounded-xl px-4 py-3 bg-blue-600` → `rounded-md px-3 py-2.5 bg-primary text-primary-foreground`
- Categorías del menú: Mantener separadores "Menu Principal", "Soporte", "Administración"
- Footer: Agregar botón de logout estilizado como EBM (`text-destructive hover:bg-destructive/10`)

**Header:**
- Eliminar el header desktop (breadcrumb) como en EBM
- Mantener solo el header mobile con hamburger menu

**Content area:**
- De `p-4 sm:p-8` → `p-4 lg:p-8` con wrapper `max-w-7xl w-full mx-auto`

---

### Fase 3: Login

#### [MODIFY] [login.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/components/login/login.component.ts)
- Cambiar de layout centrado con glassmorphism → Split layout 50/50 como EBM
- Panel izquierdo: Fondo `bg-slate-900` con pattern SVG, logo "S" + "S-Project", descripción, logo Grupo Sole, copyright
- Panel derecho: Form limpio con fondo `bg-background`, inputs con estilo EBM (`rounded-lg`, `bg-input/50`, `border-input`)
- Botón: de `rounded-xl shadow-lg shadow-blue-600/30` → `rounded-lg bg-gradient-to-r from-primary/80 to-primary`
- Agregar checkbox "Recordarme" y link "¿Olvidaste tu contraseña?"

---

### Fase 4: Páginas Internas (Contenido)

#### [MODIFY] [dashboard.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/components/dashboard/dashboard.component.ts)
- Headers: de `text-3xl font-bold text-slate-800` → `text-2xl font-bold tracking-tight` con icono de lucide (o SVG equivalente)
- Cards de proyectos: de `rounded-2xl shadow-[...] border-slate-100` → `rounded-lg bg-card border shadow-sm`
- Botón "Nuevo Proyecto": de `rounded-xl shadow-lg shadow-blue-600/30 hover:-translate-y-0.5` → `rounded-md bg-primary text-primary-foreground shadow-sm hover:bg-primary/90`
- View switcher: de `bg-slate-200 rounded-xl` → `bg-muted rounded-md`
- Progress bars: de `bg-slate-100 rounded-full` → `bg-muted/30 rounded-full`
- Badges de estado: usar tokens

#### [MODIFY] [bi-dashboard.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/components/bi-dashboard/bi-dashboard.component.ts)
- KPI Cards: de `rounded-2xl shadow-sm border-slate-100 h-32` → `rounded-lg bg-card border shadow-sm` (estilo KPICard de EBM)
- Filter bar: de `bg-white rounded-xl border-slate-100` → `bg-card rounded-lg border`
- Selects: de `bg-slate-50 rounded-lg border-slate-200` → `bg-background border-input rounded-md`
- Tablas: Adoptar estilo EBM (`bg-muted/50` headers, `divide-border`)
- Chart container: de `bg-white rounded-2xl` → `bg-card rounded-lg border`

#### [MODIFY] [user-management.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/components/user-management/user-management.component.ts)
- Header: estilo compacto EBM con `text-lg font-medium` + icono
- Tabla: adoptar `bg-card rounded-lg border overflow-hidden`, headers con `bg-muted/50`
- Slide-over form: mantener funcionalidad pero cambiar estilos de inputs y layout
- Botones: uniformizar con estilo EBM
- Badges de roles: usar tokens de colores

#### [MODIFY] [area-management.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/components/area-management/area-management.component.ts)
- Misma transformación que user-management

#### [MODIFY] [profile.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/components/profile/profile.component.ts)
- Header: de `text-3xl font-bold text-slate-800` → `text-2xl font-bold tracking-tight`
- Card: de `rounded-3xl shadow-sm border-slate-100` → `rounded-lg bg-card border shadow-sm`
- Inputs: adoptar estilo EBM
- Sección seguridad: de `bg-slate-50 rounded-2xl` → `bg-muted rounded-lg border`
- Botón guardar: estilo EBM

#### [MODIFY] [kanban-board.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/components/kanban-board/kanban-board.component.ts)
- Columnas kanban: de `bg-slate-50 rounded-2xl` → `bg-card rounded-lg border`
- Cards de tareas: de `bg-white rounded-xl shadow-sm` → `bg-background rounded-md border shadow-sm`
- Badges: usar tokens

#### [MODIFY] [project-detail.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/components/project-detail/project-detail.component.ts)
- Layout general: adoptar padding y spacing de EBM
- Tabs: estilo compacto con bordes
- Info cards: `rounded-lg bg-card border`
- Tablas de gastos/indicadores: estilizar como EBM

#### [MODIFY] [project-form.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/components/project-form/project-form.component.ts)
- Slide-over: mantener pero con estilos de inputs EBM
- Secciones agrupadas: de `rounded-2xl bg-slate-50` → `rounded-lg bg-muted border`

#### [MODIFY] [notification.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/components/notification/notification.component.ts)
- Dropdown: de `bg-white rounded-2xl shadow-2xl border-slate-100` → `bg-card rounded-lg border shadow-lg`
- Items: de `hover:bg-slate-50` → `hover:bg-accent`

#### [MODIFY] [manual.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/components/manual/manual.component.ts)
- Adoptar estilos de card y tipografía de EBM

#### [MODIFY] [gantt-chart.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/components/gantt-chart/gantt-chart.component.ts)
- Container: `bg-card rounded-lg border`
- Colores de D3: adaptar a los tokens del nuevo diseño

#### [MODIFY] Componentes UI
- [filter-bar.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/components/ui/filter-bar/filter-bar.component.ts): Adoptar estilos de inputs y selects de EBM
- [due-soon-widget.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/components/ui/due-soon-widget/due-soon-widget.component.ts): Adoptar estilo de card EBM
- [project-chat.component.ts](file:///D:/diego/Documentos/Antigravity/S-Project/s-project/src/components/project-chat/project-chat.component.ts): Adoptar estilo de chat con tokens

---

## Resumen de Archivos a Modificar

| # | Archivo | Tipo de cambio |
|---|---|---|
| 1 | `styles.css` | Design tokens + scrollbar + animaciones |
| 2 | `tailwind.config.js` | Extensión de colores con tokens |
| 3 | `app.component.ts` | Sidebar + layout + header |
| 4 | `login.component.ts` | Rediseño completo del login |
| 5 | `dashboard.component.ts` | Cards, botones, tipografía |
| 6 | `bi-dashboard.component.ts` | KPIs, filtros, tablas, D3 |
| 7 | `user-management.component.ts` | Tabla, form, badges |
| 8 | `area-management.component.ts` | Tabla, form |
| 9 | `profile.component.ts` | Card, inputs, botones |
| 10 | `kanban-board.component.ts` | Columnas, cards, badges |
| 11 | `project-detail.component.ts` | Layout, tabs, tablas |
| 12 | `project-form.component.ts` | Slide-over, inputs |
| 13 | `notification.component.ts` | Dropdown, items |
| 14 | `manual.component.ts` | Cards, tipografía |
| 15 | `gantt-chart.component.ts` | Container, D3 colors |
| 16 | `filter-bar.component.ts` | Inputs, selects |
| 17 | `due-soon-widget.component.ts` | Card styles |
| 18 | `project-chat.component.ts` | Chat bubbles |

**Total: 18 archivos** — Solo cambios visuales (clases CSS/Tailwind en templates HTML)

---

## Open Questions

> [!IMPORTANT]
> 1. **Dark Mode**: S-Project actualmente tiene soporte parcial de dark mode. ¿Quieres que implemente el soporte completo de dark mode como en EBM (con toggle funcional), o prefieres solo el modo claro por ahora?
>
> 2. **Logo**: ¿Deseas mantener el ícono "S" actual como logo del sidebar, o tienes un logo específico para S-Project (archivo de imagen)?
>
> 3. **Login Grupo Sole**: ¿Debo incluir el logo de "Grupo Sole" y el copyright "Rinnai Corporation" en el panel izquierdo del login, tal como está en EBM? ¿O prefieres un texto/branding diferente para S-Project?

---

## Verification Plan

### Compilación
```bash
cd "D:\diego\Documentos\Antigravity\S-Project\s-project"
npm run build
```

### Verificación Visual
- Ejecutar `npm run dev` y navegar por todas las vistas
- Comparar lado a lado con EBM en el navegador
- Verificar responsive (mobile + desktop)
- Verificar que todas las funcionalidades siguen operando correctamente

### Git
- Commit y push al repositorio de GitHub
