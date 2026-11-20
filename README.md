# 🐉 GrimoireLink — Frontend

Aplicación web de **GrimoireLink**, una herramienta para gestionar campañas de **Dungeons & Dragons 5e (SRD 2014)**. Reúne en un solo lugar las campañas, los personajes, el diario de la aventura, los encuentros y el bestiario, para que el Dungeon Master y los jugadores trabajen sobre la misma información.

Desarrollada como **Trabajo Final de Programación IV** — UTN Mar del Plata. Consume la API REST de [GrimoireLink (backend)](https://github.com/MacchiLisandro/grimoireLink).

## 🏰 Descripción

Cada usuario tiene un **rol según la campaña**:

- **Dungeon Master (DM):** crea la campaña, comparte el código de invitación, prepara los encuentros y administra monstruos y personajes durante el combate.
- **Jugador:** se une con el código de invitación, crea su personaje y lo lleva a lo largo de la campaña.

Un mismo usuario puede ser DM en una campaña y jugador en otra. La campaña activa se elige en el menú lateral y define qué se ve en el resto de la aplicación. El DM puede además cambiar a la **vista de participante** para ver la campaña como la ven los jugadores.

## 🕯️ Tecnologías

- **Angular 22**: componentes standalone, sin Zone.js (zoneless).
- **Signals** para el estado (`signal`, `computed`, `effect`) y `rxResource` para cargar datos.
- **Signal Forms** (`@angular/forms/signals`) en todos los formularios.
- **TypeScript 6** y **RxJS 7.8**.
- **Vitest** con **jsdom** para los tests unitarios.
- **Prettier** para el formato.
- **[D&D 5e SRD API](https://www.dnd5eapi.co)** para razas, clases, hechizos, objetos y monstruos.

## 🧙 Instalación y ejecución

### Requisitos

- Node.js en una versión compatible con Angular 22 y npm 11.
- El [backend de GrimoireLink](https://github.com/MacchiLisandro/grimoireLink) corriendo, por defecto en `http://localhost:8080`.

### Pasos

1. Clonar el repositorio e instalar las dependencias:

```bash
git clone https://github.com/grimoire-link-dev-team/GrimoireLink-frontend.git
cd GrimoireLink-frontend
npm install
```

2. Revisar la URL de la API en `src/environments/environment.development.ts`:

```ts
export const environment = {
  production: false,
  apiURL: 'http://localhost:8080/api',
};
```

3. Levantar el servidor de desarrollo y abrir `http://localhost:4200`:

```bash
ng serve
```

### Otros comandos

| Comando | Qué hace |
|---|---|
| `ng build` | Compila para producción en `dist/`. Usa `src/environments/environment.ts`, donde hay que poner la URL real del backend. |
| `ng test` | Corre los tests unitarios con Vitest (en modo *watch*). |
| `ng test --watch=false` | Corre los tests una sola vez. |

## 🎲 Funcionalidades

### Todos los usuarios
- Registro e inicio de sesión con JWT. El token se envía en cada request mediante un interceptor; ante un 401 se cierra la sesión.
- Página de inicio pública con una introducción a D&D y datos del SRD.
- Bestiario: buscador de monstruos del SRD con su ficha.
- Lanzador de dados (d4 a d100, cantidad y modificador).
- Perfil con apodo y avatar.

### Jugador
- Unirse a una campaña con un código de invitación de 6 dígitos.
- Crear un personaje en la campaña activa con un asistente de 4 pasos: identidad, características (valores estándar, compra por puntos o manual), equipo y hechizos, y revisión. El borrador se guarda en el navegador.
- Hoja de personaje con características, habilidades, puntos de golpe, inventario y hechizos.
- Ver al resto del grupo y los encuentros en curso.
- Leer el diario de la campaña.

### Dungeon Master
- Crear campañas, cambiar su estado (activa, pausada, finalizada) y ver a sus miembros.
- Crear encuentros (tipo, dificultad, descripción) y cambiar su estado.
- Durante el encuentro:
  - agregar monstruos del SRD y personajes de la campaña;
  - aplicar daño y curación (el daño queda guardado en la hoja del personaje);
  - un personaje en 0 PV pasa a *Inconsciente* y, si falla sus tiradas de salvación contra muerte, el DM lo marca como *Muerto*.
- Escribir y editar el diario de la campaña.
- Ver y editar la hoja de los personajes de su campaña.

### Transversales
- Avisos de éxito y error (*toasts*).
- Modal de confirmación para acciones destructivas.
- Estados de carga, de error y de lista vacía en cada pantalla.
- Validaciones en todos los formularios.

## 🗺️ Rutas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Inicio (pública o del usuario) | Todos |
| `/login`, `/register` | Inicio de sesión y registro | Solo sin sesión |
| `/inicio` | Inicio del usuario | Con sesión |
| `/personajes` | Personajes de la campaña activa | Con sesión |
| `/personajes/nuevo` | Asistente de creación | Con sesión |
| `/personajes/:characterId` | Hoja de personaje | Con sesión |
| `/campanias` | Mis campañas | Con sesión |
| `/campanias/nueva` | Crear campaña | Con sesión |
| `/campanias/unirse` | Unirse con código | Con sesión |
| `/campanias/:publicId` | Detalle de campaña y sus encuentros | Con sesión |
| `/encuentros?encounterId=…&campaignId=…` | Encuentro | Con sesión |
| `/diario` | Diario de la campaña activa | Con sesión |
| `/monstruos` | Bestiario | Con sesión |
| `/dados` | Lanzador de dados | Con sesión |

Las rutas están centralizadas en `src/app/app.route.segments.ts`:
- `ROUTE_SEGMENTS` tiene los segmentos de cada URL.
- `ROUTE_COMMANDS` tiene los comandos listos para `routerLink` y `router.navigate`. Las rutas con id son funciones, como `ROUTE_COMMANDS.campaignDetail(id)`.

Ningún componente escribe una URL a mano. Cada dominio declara sus rutas en su propio archivo (`auth.routes.ts`, `campaigns.routes.ts`, `characters.routes.ts`) y se cargan de forma diferida.

## 🏗️ Estructura del proyecto

El código se organiza **por dominio** (ADR-10). Cada dominio separa el acceso a datos de las pantallas:

```
src/app/
├── app.route.segments.ts   # URLs y comandos de navegación
├── app.routes.ts           # rutas raíz (carga diferida por dominio)
├── auth/                   # login, registro, guards, interceptor
├── campaigns/              # campañas y contexto de la campaña activa
├── characters/             # personajes, asistente, hoja, inventario, hechizos
├── encounters/             # encuentros, gestor de personajes y de enemigos
├── home/                   # inicio público y del usuario
├── journal/                # diario de la campaña
├── monsters/               # bestiario
├── layout/                 # header, sidebar y layout principal
└── shared/
    ├── data-access/        # SRD, notificaciones, confirmaciones
    └── ui/                 # lanzador de dados, modal, avisos
```

Dentro de cada dominio:

- **`data-access/`**: servicios HTTP, modelos (interfaces, tipos y etiquetas en español), guards y reglas de negocio sin vista (por ejemplo, `character-rules.ts` con las fórmulas de D&D).
- **`features/`**: componentes de pantalla, conectados a servicios y rutas.
- **`ui/`**: componentes de presentación reutilizables dentro del dominio.

## 📐 Convenciones

- **Servicios** con `@Service()` e `inject()`. Devuelven el `Observable` del `HttpClient`; los componentes lo consumen con `await firstValueFrom(...)` o con `rxResource`.
- **Estado con signals:**
  - `private readonly` para los servicios inyectados.
  - `protected readonly` para signals y computeds que usa el template.
  - `protected` para los métodos del template.
- **Formularios con Signal Forms:**
  - Las validaciones van en el schema (`required`, `minLength`, `min`, `pattern`...), no como atributos del HTML.
  - El envío se hace con `submission.action`.
- **Etiquetas en el modelo:** los textos de enums viven junto al modelo (`CAMPAIGN_STATUS_LABELS`, `ENCOUNTER_TYPE_LABELS`, `CHARACTER_STATUS_LABELS`).
- **Idiomas:** el código, los commits y los PRs van en inglés; los textos de la interfaz, en español rioplatense (voseo).
- **Confirmaciones y avisos:** siempre con `ConfirmationService` y `NotificationService`, nunca con `window.confirm()` ni `alert()`.

## 🧪 Tests

```bash
ng test --watch=false
```

Hay 31 tests:
- Tests de creación de cada componente y servicio, con `provideHttpClientTesting()` para que no se hagan requests reales.
- Tests de comportamiento de `ConfirmationService` y `NotificationService`: respuesta del usuario, cancelación de una confirmación previa y cierre automático del aviso con *fake timers*.

## ⚠️ Limitaciones conocidas

- **La campaña activa tiene dos fuentes de verdad:** el menú lateral y la URL del encuentro. Para editar un encuentro, la campaña activa en el menú tiene que ser la del encuentro y hay que estar en vista de DM.
- **Algunas reglas de permisos se validan solo en el frontend.** Por ejemplo, que solo el dueño o el DM editen un personaje. El backend las tiene pendientes.
- **El apodo y el avatar del perfil** se guardan en `localStorage`, no en el backend.
- **El borrador del asistente de personajes** no se separa por usuario.
- **Las tiradas de salvación contra muerte** se hacen en la mesa; la aplicación solo registra el resultado.

## 🔮 Próximos pasos

- Vistas más integradas: encuentros dentro del detalle de la campaña, sin cambiar de pantalla.
- Iniciativa y turnos en los encuentros, con tiradas de salvación contra muerte.
- Reparto de botín (objetos y oro) desde el encuentro.
- Estilos compartidos para reducir el CSS duplicado entre componentes.
- Más tests de comportamiento, empezando por las reglas de `character-rules.ts`.

## 🧝 Autores

- Mateo Benegas
- Tomás Delio
- Lisandro Macchi