# Stupendo App Vercel

App interna estática para subir a GitHub y desplegar en Vercel.

## Rutas

- `/agenda/`: agenda operativa, reserva rápida, cotizador y leads.
- `/finanzas/`: panel de finanzas.
- `/`: selector de módulos.

## Deploy

1. Subir esta carpeta completa a un repositorio de GitHub.
2. Crear un proyecto nuevo en Vercel usando ese repositorio.
3. Framework preset: `Other`.
4. Build command: dejar vacío.
5. Output directory: dejar vacío.

La app usa la anon key pública de Supabase ya incluida en los scripts actuales.
