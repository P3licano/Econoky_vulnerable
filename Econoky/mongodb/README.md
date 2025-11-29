# MongoDB - Base de Datos No Relacional

Esta aplicación usa MongoDB como base de datos NoSQL, optimizada para una red social.

## Características del Diseño

- **No Relacional**: No hay foreign keys ni relaciones estrictas
- **Embedding**: Los datos relacionados se pueden embebir cuando tiene sentido
- **Agregaciones**: Se usan agregaciones de MongoDB para unir datos cuando es necesario
- **Escalabilidad**: Diseñado para escalar horizontalmente
- **Flexibilidad**: Esquema flexible que se adapta a las necesidades de una red social

## Colecciones

### profiles
Almacena información de los usuarios. No tiene relaciones, solo referencias por ID.

### posts
Almacena las publicaciones de la red social. Usa `user_id` como referencia (no foreign key).

### transactions
Almacena transacciones financieras. Usa `user_id` como referencia.

## Índices

Los índices están optimizados para:
- Búsquedas por usuario
- Ordenamiento por fecha
- Consultas frecuentes

## Notas

- Los datos se crean automáticamente cuando se insertan los primeros documentos
- No necesitas ejecutar scripts de migración
- MongoDB crea las colecciones e índices automáticamente

