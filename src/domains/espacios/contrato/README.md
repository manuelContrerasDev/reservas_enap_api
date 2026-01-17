# Espacios — Contrato Oficial v1.1

Este módulo implementa el contrato oficial Backend ↔ Frontend para "Espacios".
Fuente de verdad: EspacioTipoConfig.

## Endpoints
- GET /api/espacios/catalogo
- GET /api/espacios/:tipo/detalle?desde&hasta

## Admin
- POST   /api/espacios/admin/espacios/config
- PATCH  /api/espacios/admin/espacios/config/:tipo
- PATCH  /api/espacios/admin/espacios/config/:tipo/visibilidad
- DELETE /api/espacios/admin/espacios/config/:tipo

## Notas
- CLUBHOUSE existe en enum, pero no se implementa.
- Disponibilidad por tipo:
  - CABANA/QUINCHO: unidadesTotales - reservas solapadas por tipo
  - PISCINA: cupoTotal - personasPiscina
