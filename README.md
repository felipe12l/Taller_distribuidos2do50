**Autor:** Andres Felipe Luna Becerra
tutorial hecho en obsidian 
## Campus Manager - Sistema de Gestión de Préstamos de Aulas

---

## Índice

1. [Introducción](#introducción)
2. [Requisitos Previos](#requisitos-previos)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Despliegue con Docker Compose](#despliegue-con-docker-compose)
5. [Despliegue Manual de Servicios](#despliegue-manual-de-servicios)
6. [Verificación del Despliegue](#verificación-del-despliegue)
7. [Acceso a la Aplicación](#acceso-a-la-aplicación)
8. [Resolución de Problemas](#resolución-de-problemas)
9. [Comandos Útiles](#comandos-útiles)

---

## Introducción

Campus Manager es un sistema de microservicios para la gestión de préstamos de aulas académicas. El sistema está compuesto por:

- **Servicio de Aulas** (classroom): Gestión del inventario de aulas
- **Servicio de Estudiantes** (student_serv): Directorio de estudiantes
- **Servicio de Préstamos** (loans_service): Control de préstamos y métricas
- **Frontend**: Interfaz web de usuario
- **MongoDB**: Base de datos NoSQL compartida

---

## Requisitos Previos

### Software Necesario

#### Opción 1: Despliegue con Docker (Recomendado)
- **Docker Desktop** o **Docker Engine** (versión 20.10+)
- **Docker Compose** (versión 2.0+)
- **Git** (para clonar el repositorio)

#### Opción 2: Despliegue Manual
- **Java JDK 21** o superior
- **Maven 3.9+**
- **MongoDB 7** (instalado y ejecutándose ya sea en un contenedor o en una base de datos propia del sistema, aunque requerirá mas configuración)
- **Node.js 20+** y **npm** (para el frontend)

### Verificar Instalaciones

```bash
# Verificar Docker
docker --version
docker compose version

# Verificar Java (para despliegue manual)
java -version
mvn --version

# Verificar Node.js (para despliegue manual)
node --version
npm --version
```

### Puertos Requeridos

Asegúrese de que los siguientes puertos estén disponibles:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| MongoDB | 27017 | Base de datos |
| Classroom Service | 8200 | API de aulas |
| Loans Service | 8201 | API de préstamos |
| Student Service | 8202 | API de estudiantes |
| Frontend | 8203 | Aplicación web |

---

## Arquitectura del Sistema
Para este sistema se hizo uso de un servicio por funcionalidad y una api gateway si se quiere usar la version web, en caso contrario se puede omitir la api e implementar los servicios directamente a un cliente.
La mayor complicación fue el uso de la base de datos, ya que esta al ser una arquitectura distribuida es recomendable apartar una base por servicio.
```
┌─────────────────────────────────────────────────┐
│                  Frontend (Nginx)               │
│              http://localhost:8203              │
└──────────────────┬──────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │    API Gateway    │
         │   (Nginx Proxy)   │
         └─────────┬─────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐   ┌────▼─────┐   ┌───▼────────┐
│Classroom│   │ Students │   │   Loans    │
│Service  │   │ Service  │   │  Service   │
│  :8200  │   │  :8202   │   │   :8201    │
└───┬────┘   └────┬─────┘   └───┬────────┘
    │             │              │
    └─────────────┼──────────────┘
                  │
           ┌──────▼──────┐
           │   MongoDB   │
           │    :27017   │
           └─────────────┘
```

---

## Despliegue con Docker Compose

### Opción A: Despliegue desde Docker Hub (Recomendado)

Este método descarga las imágenes pre-construidas desde Docker Hub, lo que es más rápido y no requiere compilación local.

#### Paso 1: Crear el archivo docker-compose.yaml

Cree un directorio para el proyecto y dentro un archivo `docker-compose.yaml`:

```bash
mkdir campus-manager
cd campus-manager
```

Cree el archivo `docker-compose.yaml` con el siguiente contenido:

```yaml
services:
  mongo:
    image: mongo:7
    container_name: mongo
    restart: unless-stopped
    ports:
      - "27017:27017"    
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
    volumes:
      - mongo-data:/data/db
      - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  classroom:
    image: felipeluna01/classroom-service:latest
    restart: unless-stopped
    ports:
      - "8200:8200"
    environment:
      SPRING_DATA_MONGODB_URI: mongodb://root:example@mongo:27017/classroom_db?authSource=admin
    depends_on:
      mongo:
        condition: service_healthy

  student_serv:
    image: felipeluna01/student-service:latest
    restart: unless-stopped
    ports:
      - "8202:8202"
    environment:
      SPRING_DATA_MONGODB_URI: mongodb://root:example@mongo:27017/student_db?authSource=admin
    depends_on:
      mongo:
        condition: service_healthy

  loans_service:
    image: felipeluna01/loans-service:latest
    restart: unless-stopped
    ports:
      - "8201:8201"
    environment:
      SPRING_DATA_MONGODB_URI: mongodb://root:example@mongo:27017/loans_db?authSource=admin
    depends_on:
      mongo:
        condition: service_healthy

  frontend:
    image: felipeluna01/frontend:latest
    restart: unless-stopped
    ports:
      - "8203:80"
    depends_on:
      classroom:
        condition: service_started
      student_serv:
        condition: service_started
      loans_service:
        condition: service_started

volumes:
  mongo-data:
```
algunas anotaciones son que el frontend esta incompleto
#### Paso 2: Crear el archivo de inicialización de MongoDB

Cree el archivo `init-mongo.js` en el mismo directorio:

```javascript
// Script de inicialización de MongoDB
db = db.getSiblingDB('classroom_db');
db.classrooms.insertMany([
  { _id: 'aula-101', description: 'Aula de Matemáticas', capacity: 30, available: true },
  { _id: 'aula-102', description: 'Aula de Historia', capacity: 25, available: true },
  { _id: 'aula-103', description: 'Laboratorio', capacity: 20, available: false }
]);

db = db.getSiblingDB('student_db');
db.students.insertMany([
  { _id: 'est-001', name: 'Juan Pérez', email: 'juan@example.com' },
  { _id: 'est-002', name: 'María García', email: 'maria@example.com' }
]);

db = db.getSiblingDB('loans_db');
db.loans.insertMany([
  { _id: 'loan-001', classroomId: 'aula-101', borrowerId: 'est-001', status: 'active' }
]);

print('Datos iniciales cargados en classroom_db, student_db y loans_db');
```

#### Paso 3: Descargar e Iniciar los Servicios

```bash
# Descargar las imágenes e iniciar los contenedores
docker compose up -d
```

**Nota**: Este comando descargará automáticamente las imágenes desde Docker Hub. La primera vez puede tomar algunos minutos dependiendo de su conexión a internet.

#### Paso 4: Verificar la descarga

```bash
# Ver las imágenes descargadas
docker images | grep felipeluna01

# Debería ver algo como:
# felipeluna01/classroom-service    latest    xxxxx    X hours ago    XXX MB
# felipeluna01/student-service      latest    xxxxx    X hours ago    XXX MB
# felipeluna01/loans-service        latest    xxxxx    X hours ago    XXX MB
# felipeluna01/frontend             latest    xxxxx    X hours ago    XXX MB
```

### Opción B: Despliegue Compilando desde Código Fuente

Este método requiere clonar el repositorio y compilar las imágenes localmente.

#### Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd <nombre-del-proyecto>
```

#### Paso 2: Verificar la Estructura de Archivos

Asegúrese de que existe el archivo `docker-compose.yaml` en la raíz del proyecto:

```
.
├── docker-compose.yaml
├── classroom/
├── student_serv/
├── loans_service/
├── frontend/
└── init-mongo.js
```

#### Paso 3: Construir e Iniciar los Servicios

```bash
# Construir las imágenes y levantar los contenedores
docker compose up -d --build
```

**Nota**: La primera vez tomará varios minutos mientras descarga las dependencias y construye las imágenes.

### Paso 4: Monitorear el Inicio

```bash
# Ver los logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f classroom
docker compose logs -f loans_service
docker compose logs -f student_serv
docker compose logs -f frontend
```

### Paso 5: Verificar que los Contenedores Estén Ejecutándose

```bash
docker compose ps
```

Debería ver una salida similar a:

```
NAME                    STATUS              PORTS
mongo                   Up 2 minutes        0.0.0.0:27017->27017/tcp
classroom               Up 1 minute         0.0.0.0:8200->8200/tcp
student_serv            Up 1 minute         0.0.0.0:8202->8202/tcp
loans_service           Up 1 minute         0.0.0.0:8201->8201/tcp
frontend                Up 1 minute         0.0.0.0:8203->80/tcp
```

---

## Despliegue Manual de Servicios

### Paso 1: Iniciar MongoDB

```bash
# Opción 1: Con Docker
docker run -d \
  --name mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=example \
  mongo:7

# Opción 2: Servicio local (Linux/macOS)
sudo systemctl start mongodb

# Opción 3: Windows
net start MongoDB
```

### Paso 2: Inicializar la Base de Datos

```bash
# Copiar el script de inicialización a MongoDB
docker cp init-mongo.js mongo:/tmp/init-mongo.js

# Ejecutar el script
docker exec -it mongo mongosh -u root -p example --authenticationDatabase admin /tmp/init-mongo.js
```

### Paso 3: Compilar los Servicios Java

#### Servicio de Aulas (Classroom)

```bash
cd classroom

# Compilar el proyecto
./mvnw clean package -DskipTests

# Ejecutar el servicio
java -jar target/classroom-0.0.1-SNAPSHOT.jar
```

#### Servicio de Estudiantes (Student Service)

En una nueva terminal:

```bash
cd student_serv

# Compilar el proyecto
./mvnw clean package -DskipTests

# Ejecutar el servicio
java -jar target/student_serv-0.0.1-SNAPSHOT.jar
```

#### Servicio de Préstamos (Loans Service)

En otra terminal:

```bash
cd loans_service

# Compilar el proyecto
./mvnw clean package -DskipTests

# Ejecutar el servicio
java -jar target/loans_service-0.0.1-SNAPSHOT.jar
```

### Paso 4: Compilar y Ejecutar el Frontend

En una nueva terminal:

```bash
cd frontend

# Instalar dependencias
npm install

# Opción 1: Modo desarrollo
npm run dev

# Opción 2: Compilar para producción
npm run build

# Servir con un servidor estático (ej: http-server)
npx http-server dist -p 8203
```

---

## Verificación del Despliegue

### 1. Verificar MongoDB

```bash
# Con Docker Compose
docker compose exec mongo mongosh -u root -p example

# Comandos dentro de mongosh:
> show dbs
> use classroom_db
> db.classrooms.countDocuments()
> use student_db
> db.students.countDocuments()
> use loans_db
> db.loans.countDocuments()
> exit
```

### 2. Verificar APIs REST

#### API de Aulas

```bash
curl http://localhost:8200/classrooms
```

**Respuesta esperada**:
```json
[
  {
    "id": "aula-101",
    "description": "Aula de Matemáticas",
    "capacity": 30,
    "available": true
  }
]
```

#### API de Estudiantes

```bash
curl http://localhost:8202/students/
```

**Respuesta esperada**:
```json
[
  {
    "id": "est-001",
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }
]
```

#### API de Préstamos

```bash
curl http://localhost:8201/loans
```

**Respuesta esperada**:
```json
[
  {
    "id": "loan-001",
    "classroomId": "aula-101",
    "borrowerId": "est-001",
    "status": "active"
  }
]
```

#### API de Métricas

```bash
curl http://localhost:8201/metrics/top-hour
curl http://localhost:8201/metrics/classroom-frequency
```

### 3. Verificar el Frontend

Abra un navegador web y acceda a:

```
http://localhost:8203
```

Debería ver la interfaz de Campus Manager con:
- Sección de gestión de aulas
- Sección de gestión de estudiantes
- Sección de gestión de préstamos
- Panel de métricas con gráficos

---

## Acceso a la Aplicación

### URL Principal

```
http://localhost:8203
```

### Funcionalidades Disponibles

#### 1. Gestión de Aulas
- **Crear aula**: Complete el formulario y haga clic en "Guardar aula"
- **Editar aula**: Haga clic en el botón "Editar" de cualquier aula
- **Eliminar aula**: Haga clic en el botón "Eliminar"

#### 2. Gestión de Estudiantes
- **Crear estudiante**: Complete nombre y correo electrónico
- **Editar estudiante**: Use el botón "Editar"
- **Eliminar estudiante**: Use el botón "Eliminar"

#### 3. Gestión de Préstamos
- **Crear préstamo**: Especifique ID de estudiante, ID de aula, fecha y horario
- **Estados disponibles**: REQUESTED, APPROVED, FINISHED, CANCELLED
- **Editar/Eliminar**: Use los botones correspondientes

#### 4. Panel de Métricas
- **Hora con más reservas**: Muestra la hora del día con mayor frecuencia de préstamos
- **Préstamos por aula**: Tabla con la frecuencia de uso de cada aula
- **Gráfico de barras**: Visualización de la frecuencia por aula
se recomienda realizar uso de aplicativos como postman para realizar la consulta de los servicios e implementar a parte el front, debido a las fallas de CORS que se puedan presentar.
---

## Resolución de Problemas

### Problema: Los contenedores no inician

**Solución**:
```bash
# Detener todos los contenedores
docker compose down

# Limpiar volúmenes
docker compose down -v

# Reconstruir e iniciar
docker compose up -d --build
```

### Problema: Puerto ya en uso

**Solución**:
```bash
# Verificar qué proceso usa el puerto (ejemplo: 8200)
# Linux/macOS:
lsof -i :8200

# Windows:
netstat -ano | findstr :8200

# Detener el proceso o cambiar el puerto en docker-compose.yaml
```

### Problema: Error de conexión a MongoDB

**Verificaciones**:
1. Confirme que MongoDB está ejecutándose:
   ```bash
   docker compose ps mongo
   ```

2. Verifique los logs de MongoDB:
   ```bash
   docker compose logs mongo
   ```

3. Verifique la cadena de conexión en `application.properties`:
   ```
   spring.data.mongodb.uri=mongodb://root:example@mongo:27017/<db_name>?authSource=admin
   ```

### Problema: Frontend no carga datos

**Solución**:
1. Abra la consola del navegador (F12)
2. Verifique errores en la pestaña "Console"
3. Verifique solicitudes fallidas en la pestaña "Network"
4. Confirme que los servicios backend responden:
   ```bash
   curl http://localhost:8200/classrooms
   curl http://localhost:8201/loans
   curl http://localhost:8202/students/
   ```
 de ser asi hay un problema con las politicas del CORS o de nginx
### Problema: Servicios Spring Boot no inician

**Verificaciones**:
1. Revise los logs:
   ```bash
   docker compose logs classroom
   docker compose logs loans_service
   docker compose logs student_serv
   ```

2. Verifique que Java 21 esté instalado:
   ```bash
   docker compose exec classroom java -version
   ```

3. Verifique que MongoDB está listo antes de que inicie Spring Boot:
   - El `docker-compose.yaml` incluye `depends_on` con `condition: service_healthy`

---

## Comandos Útiles

### Docker Compose

```bash
# Iniciar servicios
docker compose up -d

# Detener servicios
docker compose down

# Ver logs
docker compose logs -f [servicio]

# Reiniciar un servicio específico
docker compose restart classroom

# Ver estado de los servicios
docker compose ps

# Reconstruir imágenes
docker compose build --no-cache

# Limpiar todo (contenedores, redes, volúmenes)
docker compose down -v
```

### MongoDB

```bash
# Conectarse a MongoDB
docker compose exec mongo mongosh -u root -p example

# Backup de base de datos
docker compose exec mongo mongodump --username root --password example --out /tmp/backup

# Restaurar base de datos
docker compose exec mongo mongorestore --username root --password example /tmp/backup
```

### Logs y Depuración

```bash
# Ver logs en tiempo real
docker compose logs -f

# Ver últimas 100 líneas de logs
docker compose logs --tail=100

# Ver logs de un servicio específico
docker compose logs -f classroom

# Inspeccionar contenedor
docker compose exec classroom bash
```

### Maven (Despliegue Manual)

```bash
# Limpiar y compilar
./mvnw clean package

# Compilar sin ejecutar tests
./mvnw clean package -DskipTests

# Ejecutar solo tests
./mvnw test

# Actualizar dependencias
./mvnw dependency:resolve
```

---

## Mantenimiento y Operaciones

### Actualizar la Aplicación

```bash
# Detener servicios
docker compose down

# Obtener últimos cambios
git pull

# Reconstruir e iniciar
docker compose up -d --build
```

### Monitoreo de Recursos

```bash
# Ver uso de recursos de contenedores
docker stats

# Ver uso de disco de Docker
docker system df
```

### Limpieza de Sistema

```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes sin usar
docker image prune -a

# Limpieza completa del sistema Docker
docker system prune -a --volumes
```

---

## Configuración Avanzada

### Variables de Entorno

Puede personalizar la configuración creando un archivo `.env` en la raíz del proyecto:

```env
# Puertos de servicios
CLASSROOM_PORT=8200
STUDENT_PORT=8202
LOANS_PORT=8201
FRONTEND_PORT=8203

# MongoDB
MONGO_PORT=27017
MONGO_ROOT_USERNAME=root
MONGO_ROOT_PASSWORD=example

# Frontend
VITE_API_BASE=/api
```

### Configuración de MongoDB

Para cambiar las credenciales de MongoDB, edite `docker-compose.yaml`:

```yaml
mongo:
  environment:
    MONGO_INITDB_ROOT_USERNAME: nuevo_usuario
    MONGO_INITDB_ROOT_PASSWORD: nueva_contraseña
```

Y actualice las URIs de conexión en cada servicio:

```yaml
classroom:
  environment:
    SPRING_DATA_MONGODB_URI: mongodb://nuevo_usuario:nueva_contraseña@mongo:27017/classroom_db?authSource=admin
```

---

## Conclusión

Ha completado exitosamente el despliegue de Campus Manager. El sistema ahora está listo para:

- Gestionar el inventario de aulas
- Administrar el directorio de estudiantes
- Controlar préstamos de aulas
- Visualizar métricas de uso

Para soporte adicional o reportar problemas, consulte la documentación del proyecto o contacte al equipo de desarrollo (osea yo).

---

**Versión**: 1.0  
**Fecha**: Noviembre 2025  
**Proyecto**: Campus Manager - Sistema de Gestión de Préstamos de Aulas
