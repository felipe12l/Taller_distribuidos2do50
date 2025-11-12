# Manual de Uso

## Métricas de Préstamos de Aulas
Se añadió un módulo de métricas en el servicio `loans_service` para que DTIC's pueda consultar:

1. **Hora con mayor frecuencia de préstamo**: agrupa por `startHour` y devuelve la hora con más préstamos.
2. **Frecuencia de préstamo de las salas**: total de préstamos por `classroomId`.
3. **Reportes semanal y mensual por programa**: número de préstamos por día dentro de una semana o mes para un programa académico.

### Nuevos campos en `Loan`
`program`, `loanDate` (LocalDate), `startHour`, `endHour` para soportar agregaciones.

### Endpoints
Base: `http://localhost:8082/metrics`

| Endpoint | Descripción | Parámetros |
|----------|-------------|------------|
| `/metrics/top-hour` | Hora con mayor frecuencia | - |
| `/metrics/classroom-frequency` | Frecuencia por aula | - |
| `/metrics/weekly-program` | Reporte semanal por programa | `program`, `dateInWeek` (YYYY-MM-DD cualquiera dentro de la semana) |
| `/metrics/monthly-program` | Reporte mensual por programa | `program`, `month` (YYYY-MM-DD cualquiera dentro del mes) |

Ejemplo:
```
GET http://localhost:8082/metrics/weekly-program?program=ING-SIS&dateInWeek=2025-11-10
```

### Frontend
falla

### Datos iniciales
El script `init-mongo.js` aún no crea préstamos con los nuevos campos. Para ver métricas reales, insertar préstamos con `loanDate`, `startHour`, `program`.

### Imagenes para la construccion base 
mongo, servicio de estudiantes,aula yprestamos

