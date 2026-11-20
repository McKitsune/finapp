# Mi Presupuesto Mensual — versión de entrega

Aplicación de finanzas personales en **React 19 + TypeScript**, con servidor **Express** y asistencia opcional de **Gemini**. Conserva la interfaz original (gris claro, carbón y amarillo lima).

## Funciones incluidas

- Dashboard mensual: presupuestos, ingresos, gastos, saldo y gráfica diaria.
- Crear, editar y eliminar movimientos; filtros e historial; estados vacíos.
- Bolsillos de ahorro, aportes, retiros, transferencias, metas y comparación entre esperado y real.
- Asistente en español para consultar saldos y preparar operaciones de gasto, ingreso y ahorro. **Requiere confirmación humana antes de modificar datos**.
- Cargar y analizar imágenes JPG, PNG, WEBP y facturas PDF (hasta 8 MB en esta versión), corregir el borrador y registrar **un único gasto con productos asociados**. Detección orientativa de duplicados.
- Grabar o cargar audio (hasta 10 MB), transcribir con Gemini y revisar el texto antes de enviarlo al asistente.
- Copias de seguridad JSON exportables e importables desde Configuración.
- Almacenamiento **localStorage**, sin cuenta de usuario ni sincronización entre dispositivos.

## Instalación en Windows (PowerShell)

**Requisito: Node.js 22 o superior.**

```powershell
npm install
Copy-Item .env.example .env.local
# Edita .env.local y coloca tu clave de Gemini como GEMINI_API_KEY.
npm run dev
```

Abre `http://localhost:3000`.

También se puede usar el Dashboard, el registro manual y los bolsillos sin clave de Gemini. Las funciones de IA requieren clave, conexión y disponibilidad de cuota.

## Verificación

```powershell
npm run lint
npm test
npm run build
```

La carpeta compilada queda en `dist/`. Para ejecutar la versión de producción:

**PowerShell:**
```powershell
$env:NODE_ENV='production'
npm start
```

Abre `http://localhost:3000`. El servidor Express publica el frontend y las tres rutas de IA bajo `/api/assistant/`.

### Publicación en Render

1. Sube esta carpeta a un repositorio privado de GitHub (excluye `.env.local`).
2. En Render, crea un **Web Service** desde ese repositorio. Puedes utilizar `render.yaml` como referencia.
3. Build command: `npm install --include=dev && npm run build`.
4. Start command: `npm start`.
5. Environment: `NODE_ENV=production`, `GEMINI_MODEL=gemini-3.8-flash`, `GEMINI_API_KEY=<clave secreta>`.
6. Verifica `/api/health` (muestra `ok: true`) y el Dashboard. Prueba el análisis de un recibo de ejemplo sin datos personales.

`GEMINI_MODEL` puede cambiar si Google retira o restringe un modelo; verifica el identificador admitido en tu proyecto. Los planes gratuitos de alojamiento tienen límites y pueden suspender temporalmente el servicio por inactividad.

## Arquitectura

```text
server.ts                       Express + Gemini, análisis de documentos y audio
src/pages/Dashboard.tsx         Estado financiero, bolsillos y modales
src/components/dashboard/      Dashboard, movimientos, formularios
src/components/pockets/        Bolsillos, gráficas y comparativos
src/components/assistant/      Chat + captura/transcripción de voz
src/components/receipts/       Facturas con borrador revisable
src/services/                  localStorage y respaldos JSON
src/utils/                     Cálculos financieros y de ahorro
src/types/                     Tipos TypeScript (incluye facturas)
tests/                         Pruebas de cálculos y respaldos
```

## Precauciones y límites

**Este es un MVP funcional local, no un servicio financiero multiusuario listo para producción.**

- Ingresos, gastos, bolsillos y detalles de facturas permanecen en el navegador: borrar datos del sitio puede eliminarlos. Exporta copias de seguridad periódicas desde Configuración.
- **No hay cuentas, autenticación, autorización por usuario, base de datos central ni cifrado de información financiera en el servidor.** No cargues facturas personales sensibles ni expongas el servicio públicamente como producto final sin implementar estas protecciones.
- Las imágenes y audios se envían a Gemini **solo cuando el usuario solicita analizarlos o transcribirlos**. No se guardan archivos originales en esta versión.
- La detección de duplicados es orientativa. El usuario debe comprobar montos, fechas, NIT, descuentos, impuestos y productos. La IA puede equivocarse.
- La consulta de presupuesto al modelo utiliza los datos que el navegador envía: **no equivale a datos autenticados de una cuenta**.
- Los bolsillos son reservas contables virtuales; no representan dinero transferido a una institución financiera.
- Las proyecciones de ahorro y simulaciones son orientativas y no sustituyen asesoramiento financiero profesional.
- No existe integracion directa con Nequi, Daviplata, DIAN ni entidades bancarias.

## Siguientes tareas para producción

Autenticación y aislamiento de datos; base de datos persistente con migraciones y copias de seguridad; reglas de permisos; auditoría de movimientos y protección de secretos; pruebas end-to-end con navegador y llamadas reales de Gemini; control de costos, cuotas y protección del endpoint de IA; política de tratamiento de datos personales.
