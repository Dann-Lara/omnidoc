# Changelog

## [1.1.0] — 2026-05-08

### Módulo de Farmacia — Implementación completa

Se implementó el módulo de farmacia e inventario clínico con integración a notas clínicas. Incluye las siguientes funcionalidades:

#### Catálogo de Productos
- CRUD completo de productos (crear, editar, listar) con campos: nombre comercial, sustancia activa, presentación, laboratorio, código de barras
- Campo `unitsPerBox` para equivalencia de presentación por caja
- Integración con el sistema de inventario por lotes

#### Gestión de Inventario por Lotes
- Visualización agrupada por producto con expansión de lotes individuales
- Prioridad FEFO (First Expired, First Out) con indicadores visuales
- Reabastecimiento con selección de producto, número de lote, fecha de caducidad y cantidad
- Ajuste manual de inventario (solo Owner) con justificación obligatoria

#### Dashboard de Farmacia
- KPIs: valor total del inventario, riesgos de caducidad (30/60/90 días), alertas de stock de seguridad, compras pendientes
- Categorización de vencimientos con badges de criticidad
- Formato de moneda dinámico según configuración de la organización

#### Despacho de Medicamentos
- Historial de despachos con FEFO y auditoría completa
- Equivalencias caja/unidad en cantidades
- Indicador de disponibilidad en notas clínicas
- Desglose en tiempo real de cajas y unidades en el selector de cantidad

#### Configuración de Moneda
- Selector de moneda (USD/MXN/EUR) en página de Settings
- Persistencia en `Organization.settings.currency`
- Formato dinámico de moneda en dashboard según locale

#### Integración con Notas Clínicas
- Visualización de equivalentes en cajas en la columna de medicación
- Picker de productos con información de `unitsPerBox`
- Cantidad por defecto de 1 caja al seleccionar producto
- Despacho directo desde la nota clínica
- Seed de datos de prueba con cantidades realistas (máx. 3 cajas)

#### Correcciones y Optimización
- Corrección de error de build (llave extra en settings page)
- Seed script actualizado con cantidades realistas usando `unitsPerBox`
- 270 lotes existentes con `costPerBox` asignado
- 50+ productos con `unitsPerBox` correcto (20 para tabletas, 1 para inyectables/inhaladores)
- 204 registros de dispensación con cantidades normalizadas
