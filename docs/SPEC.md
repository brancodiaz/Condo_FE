# CondoGestApp - Especificación Funcional Completa

## Visión General

Aplicación web SaaS multi-tenant para la gestión integral de condominios. Un usuario puede pertenecer a múltiples condominios simultáneamente; la aplicación no se vincula a un solo condominio tras la autenticación.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 21, TypeScript, Tailwind CSS, DaisyUI |
| Backend | .NET Core 8 Web API |
| Base de Datos | SQL Server |

## Entidades Principales

### Condominio
- Puede incluir bloques o no.
- Si no tiene bloques, se crea un bloque por defecto que **no se muestra visualmente** al usuario.
- Las unidades inmobiliarias pertenecen directamente a un bloque y, por extensión, al condominio.

### Bloque
- Divisiones dentro de un condominio.
- Un condominio puede tener 0 o más bloques (si 0, se crea uno oculto por defecto).

### Unidad Inmobiliaria
- Unidad mínima a gestionar: casa, departamento, estacionamiento, etc.
- Un estacionamiento puede pertenecer a un propietario de departamento como **unidad adicional**, pero también puede manejarse de manera independiente.
- Una unidad puede tener 0 o más usuarios asociados, pero solo **uno de tipo propietario** será el principal (para reportería y comunicaciones).
- Puede haber **varios arrendatarios** (ej. esposo, esposa), pero solo **uno será el principal**.

### Área Común
- Área compartida asociada a un bloque o a un condominio.
- Cualquier usuario puede usarla previa gestión (reserva) con el administrador del bloque al que pertenece.
- La reserva puede tener o no un costo asociado.
- **Pago de reserva:** Solo registro de pago externo (sin pasarela de pago integrada por ahora).

### Mantenimiento
- Pago de cuota periódica: mensual, trimestral, semestral, anual, etc.
- El administrador gestiona montos y periodicidad de las cuotas.
- **El monto es fijo por bloque o condominio**, con posibilidad de **descuentos por unidad** por algún motivo específico.
- Solo un **propietario** puede realizar el pago de mantenimiento.
- El propietario puede registrar el pago de **una o varias cuotas en una sola transacción**.
- Los usuarios registran pagos realizados en otras plataformas (sin pasarela de pago integrada).
- **Opcionalmente**, el propietario puede subir un comprobante (PDF o imagen) como evidencia. Se debe **validar la seguridad del archivo** para proteger el servidor.
- El **administrador debe aprobar/validar** el pago registrado.

### Usuario
Roles posibles (no mutuamente excluyentes, varían por condominio):
- Administrador de condominio
- Propietario de unidad inmobiliaria
- Arrendatario (inquilino)
- Personal de limpieza asociado a una unidad inmobiliaria (puede autenticarse opcionalmente con correo)
- Personal de seguridad del condominio
- Participante de junta directiva de bloque
- Participante de junta directiva de condominio
- Personal de limpieza de bloque o condominio

**Un usuario puede ser propietario en una unidad y arrendatario en otra dentro del mismo condominio.**

### Contactos Importantes
- Cada usuario puede agregar un contacto para distintos tipos de servicio: policía, serenazgo, vendedor de gas, gasfitero, mecánico, carpintero, etc.
- La **lista de tipos de contacto no es fija**; se agregan nuevos tipos dinámicamente si no existen.
- El registro se mantiene **pendiente hasta que el administrador apruebe**.
- Una vez aprobado, todos los usuarios asociados al bloque o condominio pueden ver el contacto.

### Incidentes
- Los usuarios pueden levantar incidentes asociados al bloque o condominio.
- **Tipos de incidentes precargados** (catálogo base); el administrador puede configurarlos a partir de la precarga por condominio.
- Los incidentes se asignan de acuerdo a la configuración de cada tipo (a administradores de condominio, de bloque, o personas de la junta directiva).
- **Visibilidad:** El usuario puede seleccionar si el incidente es visto por todo el bloque/condominio o es privado. **Por defecto es privado**, pero puede editarse a público (dependiendo del tipo de incidente).
- **Historial de interacciones** visible en cada incidente.
- **Flujo de estados:** Abierto → En revisión → En proceso → Resuelto → Cerrado.
- El usuario **puede reabrir** un incidente si pareció resuelto pero no lo estaba.

### Comunicados
- Los administradores pueden lanzar comunicados a todos los propietarios y arrendatarios.
- Alcance configurable: **a nivel de bloque o condominio**.
- Los comunicados pueden incluir **texto, imágenes (visor) y archivos descargables**.
- Los destinatarios son **notificados desde la campanita de notificaciones**.

### Notificaciones (Sistema)
- **Campanita de notificaciones** en la aplicación.
- Aplica para comunicados **y también para eventos del sistema**: pago aprobado, incidente actualizado, etc.
- Los eventos del sistema que generan notificaciones serán **configurados por el developer**.

## Relaciones entre Entidades

1. Un condominio puede tener 0 o más bloques; si no tiene, se crea uno oculto por defecto.
2. Un bloque puede tener 1 o más unidades inmobiliarias.
3. Un condominio puede tener 0 o más áreas comunes.
4. Un bloque puede tener 0 o más áreas comunes.
5. Un propietario puede alquilar su unidad inmobiliaria a otro usuario (arrendatario).
6. Una unidad inmobiliaria puede tener 0 o más usuarios asociados; solo uno de tipo propietario es el principal.
7. Solo un propietario puede realizar el pago de mantenimiento; puede pagar una o varias cuotas en una sola transacción.
8. Los contactos importantes quedan pendientes hasta la aprobación del administrador; luego son visibles para usuarios del bloque/condominio.
9. Un administrador puede lanzar múltiples comunicados especificando alcance (bloque o condominio).
10. Los incidentes pueden ser registrados por diversos usuarios.

## Funcionalidades y Consideraciones

### Autenticación y Autorización
- Login completo: autenticación propia (email/password) y Google OAuth.
- Registro de usuario, olvidó contraseña, verificación de email.
- Implementación OWASP Top 10 para seguridad.

### Flujo Post-Autenticación
1. Al autenticarse, el usuario es redirigido a una **pantalla de bienvenida/selección de condominio**.
2. Puede seleccionar un condominio de su lista o **crear uno nuevo** (en cuyo caso obtiene el rol de administrador, modificable después).
3. Si solo está asociado a un condominio, **navega automáticamente** al dashboard del condominio.
4. Desde el dashboard, el usuario puede **volver a la pantalla de selección** sin hacer logout.

### Dashboard
- El dashboard por condominio es **distinto para cada tipo de usuario/rol**.
- El manejo de permisos es por rol y puede variar por condominio.

### Navegación
- **Sin autenticar:** No existe menú de navegación.
- **Pantalla de bienvenida:** Menú horizontal (top bar) con:
  - Nombre de la aplicación
  - Nombre del usuario
  - Menú desplegable para gestión del usuario
  - Toggle dark/light mode
- **Dentro de un condominio:** Se mantiene el top bar y se agrega un **menú lateral izquierdo** con:
  - Opciones disponibles según el rol del usuario en ese condominio
  - Indicación del rol que tiene en el condominio

### Tema Visual
- Light mode: DaisyUI theme (cupcake/bumblebee)
- Dark mode: DaisyUI "dark" theme
- El modo se aplica **globalmente por usuario** (persiste su preferencia).

### Invitación de Usuarios
- El administrador puede **registrar usuarios manualmente** o **enviar un link de invitación**.
- En ambos casos debe indicar el **tipo de rol** que tendrá el usuario asociado.

### Monetización
- Modelo **freemium**: la mayoría de funcionalidades son gratuitas.
- Algunas funcionalidades serán **exclusivas de pago** (a definir).

## Priorización MVP (Completado)

| Prioridad | Módulo | Estado |
|-----------|--------|--------|
| 1 | Login | Completado |
| 2 | Condominios | Completado |
| 3 | Bloques | Completado |
| 4 | Unidades | Completado |
| 5 | Mantenimiento + Pagos | Completado |
| 6 | Notificaciones | Completado |
| 7 | Áreas Comunes + Reservas | Completado |
| 8 | Contactos Importantes | Completado |
| 9 | Comunicados | Completado |
| 10 | Incidentes | Completado |

---

## Roadmap Post-MVP — Épicas Nuevas

### Épica: Gobernanza y Auditoría (US-001 / US-002)

#### US-002 — Bitácora de Auditoría
- Registro automático de toda acción relevante del sistema (quién, qué, cuándo, desde dónde).
- Tabla de auditoría inmutable (solo insert, sin update/delete).
- Campos: usuario, acción, entidad afectada, valores anteriores/nuevos, IP, timestamp.
- Consulta disponible solo para ADMIN y SUPERADMIN.
- Filtros por usuario, entidad, rango de fechas, tipo de acción.

### Épica: Unidades Extendidas (US-010 / US-012)

#### US-010 — Coeficiente de Participación / m²
- Cada unidad inmobiliaria puede registrar su **superficie en m²** y un **coeficiente de participación** (porcentaje).
- El coeficiente se usa para prorratear cuotas extraordinarias y gastos comunes.
- Validación: la suma de coeficientes por bloque/condominio no debe superar 100%.
- Campos nuevos en Unidad: `AreaM2` (decimal, nullable), `ParticipationCoefficient` (decimal, nullable).

#### US-012 — Vehículos y Mascotas por Unidad
- Cada unidad puede registrar **vehículos** (placa, marca, modelo, color, tipo) y **mascotas** (nombre, especie, raza, observaciones).
- Relación: Unidad 1:N Vehículos, Unidad 1:N Mascotas.
- Visibilidad: el propietario/arrendatario registra; el admin puede consultar por unidad o listado general.
- Útil para control de acceso vehicular y normativas de mascotas.

### Épica: Gestión Financiera Avanzada (US-020 a US-025)

#### US-020 — Cuotas Extraordinarias / Derramas
- El administrador puede crear **cuotas extraordinarias** (derramas) asociadas a un motivo específico (reparación, mejora, emergencia).
- Prorrateo configurable: por coeficiente de participación, por partes iguales, o monto fijo por unidad.
- Fecha de vencimiento, estado (pendiente, pagada, vencida).
- Relación con unidades: genera un cargo por cada unidad afectada.

#### US-021 — Recibos con Numeración Correlativa y Estados
- Cada pago genera un **recibo** con número correlativo único por condominio (formato configurable, ej. `REC-2026-0001`).
- Estados del recibo: Emitido → Pagado → Anulado.
- El recibo incluye: número, fecha emisión, concepto, monto, unidad, propietario, estado.
- Exportable a PDF.
- Anulación solo por ADMIN con motivo obligatorio.

#### US-022 — Motor de Mora con Intereses
- Configuración por condominio: **tasa de interés por mora** (porcentaje mensual), **días de gracia** tras vencimiento.
- Cálculo automático de intereses sobre cuotas vencidas no pagadas.
- El motor recalcula diariamente (o bajo demanda).
- El estado de cuenta de la unidad refleja capital + intereses acumulados.
- Notificación automática al propietario cuando una cuota entra en mora.

#### US-023 — Pagos Parciales e Imputación Configurable
- Un propietario puede realizar un **pago parcial** sobre una cuota.
- Política de imputación configurable por condominio:
  - **FIFO**: el pago se aplica a la cuota más antigua primero.
  - **Proporcional**: se distribuye entre todas las cuotas pendientes.
  - **Manual**: el admin decide a qué cuota(s) aplicar.
- Registro del saldo restante por cuota.

#### US-024 — Estado de Cuenta por Unidad (Reporte)
- Reporte PDF/Excel por unidad mostrando: cuotas emitidas, pagos realizados, saldo pendiente, intereses acumulados.
- Rango de fechas configurable.
- Accesible por ADMIN (cualquier unidad) y OWNER/TENANT (su propia unidad).

#### US-025 — Reporte de Morosidad por Antigüedad
- Reporte que agrupa las deudas pendientes por **antigüedad** (0-30 días, 31-60, 61-90, >90).
- Vista general por condominio y detalle por unidad.
- Totales por rango y total general.
- Solo accesible por ADMIN/TREASURER.

### Épica: Egresos y Contabilidad (US-040 a US-043)

#### US-040 — Egresos/Gastos con Categorías y Comprobantes
- Registro de **egresos** del condominio: proveedor, monto, categoría, fecha, descripción.
- Categorías de gasto configurables por condominio (mantenimiento, servicios, reparación, administración, etc.).
- Adjuntar comprobante digital (factura/recibo escaneado).
- Estados: Registrado → Aprobado → Pagado.
- Aprobación requerida por ADMIN o TREASURER antes de marcar como pagado.

#### US-041 — Cuentas Bancarias y Caja Chica
- Registro de **cuentas bancarias** del condominio (banco, tipo, número, moneda, saldo inicial).
- **Caja chica**: cuenta especial para gastos menores con tope configurable.
- Cada ingreso (pago de cuota) y egreso se asocia a una cuenta.
- Saldo calculado por cuenta = saldo inicial + ingresos - egresos.
- Solo ADMIN/TREASURER pueden gestionar cuentas.

#### US-042 — Reporte Ingresos vs Egresos
- Reporte comparativo de ingresos (pagos recibidos) vs egresos (gastos realizados) por período.
- Desglose por categoría de gasto y por tipo de ingreso.
- Gráfico de barras/líneas por mes.
- Exportable a PDF/Excel.

#### US-043 — Presupuesto Anual y Ejecución Presupuestaria
- Creación de **presupuesto anual** por condominio: partidas de gasto con monto estimado por categoría.
- Seguimiento de **ejecución presupuestaria**: comparación presupuesto vs gasto real por categoría.
- Alertas cuando una categoría supera el 80% y 100% del presupuesto asignado.
- Reporte de ejecución presupuestaria exportable.

### Épica: Biblioteca de Documentos (US-051)

#### US-051 — Biblioteca Digital de Documentos
- Repositorio de documentos del condominio: reglamentos, actas, contratos, planos, etc.
- Carpetas organizativas configurables por admin.
- Control de acceso: documentos públicos (todos los residentes) o restringidos (solo admin/junta).
- Versionado básico: al subir una nueva versión, la anterior se archiva.
- Límite de almacenamiento por condominio (configurable, ej. 500MB plan free, 5GB plan premium).

### Épica: Órdenes de Trabajo (US-062)

#### US-062 — Órdenes de Trabajo
- Derivación de un incidente a una **orden de trabajo** formal.
- Campos: descripción del trabajo, proveedor/responsable asignado, presupuesto estimado, fecha programada.
- Estados: Creada → Asignada → En Ejecución → Completada → Verificada.
- Asociación con egreso (cuando se paga al proveedor).
- Historial de cambios de estado con comentarios.
- Notificación al reportante del incidente original cuando la orden cambia de estado.

### Épica: Garantías de Áreas Comunes (US-072)

#### US-072 — Registro de Garantías
- Cada área común o equipamiento puede tener **garantías** asociadas.
- Campos: proveedor, fecha inicio, fecha fin, tipo de cobertura, documento adjunto.
- Alertas automáticas antes del vencimiento (30, 15, 7 días).
- Historial de reclamos realizados bajo garantía.

### Épica: Seguridad Física y Control de Acceso (US-080 / US-081)

#### US-080 — Preautorización QR para Visitantes
- Un residente puede generar un **código QR de preautorización** para un visitante.
- Datos del QR: nombre visitante, unidad destino, fecha/hora válida, código único.
- El QR tiene vigencia configurable (ej. 24 horas, evento específico).
- Seguridad escanea el QR en portería para validar el acceso.
- Registro automático de ingreso al validar el QR.

#### US-081 — Bitácora de Portería
- Registro de **entradas y salidas** de personas y vehículos.
- Campos: nombre, documento, unidad destino, motivo, hora entrada, hora salida, placa vehículo (opcional).
- Integración con preautorización QR (marca automáticamente la entrada).
- Filtros: por fecha, por unidad, por tipo (residente/visitante/proveedor).
- Solo accesible por SECURITY y ADMIN.

### Épica: Asambleas y Votaciones (US-090)

#### US-090 — Votaciones y Asambleas Online
- Creación de **asambleas** con agenda, fecha/hora, tipo (ordinaria/extraordinaria).
- **Votaciones** asociadas a puntos de agenda: opciones configurables, voto ponderado por coeficiente o un voto por unidad.
- Quórum configurable (porcentaje mínimo de participación para validar).
- Período de votación abierto con fecha límite.
- Resultados en tiempo real (o tras cierre, configurable).
- Acta generada automáticamente con resultados.
- Solo propietarios pueden votar (uno por unidad).

### Épica: Dashboard y KPIs (US-100 / US-101)

#### US-100 — Dashboard KPIs Financieros
- Panel con indicadores clave para ADMIN/TREASURER:
  - Tasa de morosidad (% unidades con deuda vencida).
  - Recaudación del mes vs esperado.
  - Top 5 unidades morosas.
  - Saldo disponible por cuenta bancaria.
  - Gastos del mes por categoría.
- Gráficos interactivos (barras, pie, tendencia).

#### US-101 — Personalización de Dashboard por Rol
- Cada rol ve widgets distintos en su dashboard:
  - **ADMIN/TREASURER**: KPIs financieros, morosidad, gastos.
  - **OWNER/TENANT**: su estado de cuenta, próximas reservas, incidentes abiertos, anuncios recientes.
  - **SECURITY**: bitácora del día, preautorizaciones pendientes.
  - **PRESIDENT/SECRETARY**: resumen de asambleas, votaciones abiertas, incidentes pendientes.

---

## Reportes (Transversales — Prioridad Alta)

Los reportes son funcionalidades transversales que aplican a múltiples módulos y son críticos para la operación diaria:

| ID | Reporte | Módulo Origen | Acceso |
|----|---------|---------------|--------|
| US-024 | Estado de cuenta por unidad (PDF/Excel) | Financiero | ADMIN, OWNER |
| US-025 | Morosidad por antigüedad | Financiero | ADMIN, TREASURER |
| US-042 | Ingresos vs Egresos | Contabilidad | ADMIN, TREASURER |
| US-043 | Ejecución presupuestaria | Contabilidad | ADMIN, TREASURER |
| US-100 | Dashboard KPIs financieros | Dashboard | ADMIN, TREASURER |

---

## Priorización Roadmap Post-MVP

| Prioridad | Épica / US | Módulo | Justificación |
|-----------|-----------|--------|---------------|
| P0 | US-020, US-021, US-022, US-023 | Finanzas avanzadas | Core del negocio: cuotas extraordinarias, recibos, mora, pagos parciales |
| P0 | US-024, US-025 | Reportes financieros | Necesarios para operación diaria de admin/tesorería |
| P0 | US-040, US-041 | Egresos y cuentas | Completar ciclo financiero: sin egresos no hay balance |
| P1 | US-042, US-043 | Reportes contables | Ingresos vs egresos, presupuesto — depende de US-040/041 |
| P1 | US-100, US-101 | Dashboard KPIs | Alto impacto visual, depende de datos financieros completos |
| P1 | US-010, US-012 | Unidades extendidas | Coeficientes para prorrateo, vehículos/mascotas para control |
| P1 | US-062 | Órdenes de trabajo | Extiende incidentes con gestión formal de reparaciones |
| P2 | US-051 | Biblioteca documentos | Valor agregado, no bloquea operación |
| P2 | US-072 | Garantías | Complemento a áreas comunes |
| P2 | US-080, US-081 | Seguridad física | Módulo nuevo independiente, alto valor para condominios grandes |
| P2 | US-090 | Asambleas/votaciones | Módulo nuevo complejo, alto valor pero no urgente |
| P2 | US-002 | Auditoría | Transversal, se puede implementar incrementalmente |
