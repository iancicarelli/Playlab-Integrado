# backend-playlab

## Requisitos

- Java 17 (OpenJDK) y Maven 3.9.x para ejecutar directamente desde tu máquina.
- Docker y Docker Compose 2.x si prefieres levantar todo con contenedores.

## Variables de entorno

1. Copia el archivo `.env.example` a `.env` y ajusta los valores según tu entorno.
2. Genera una clave JWT (algoritmo HS256, base64, 32 bytes). Ejemplo:

	```bash
	openssl rand -base64 32
	```

3. Pega la clave en `.env` como `JWT_PRIVATE_KEY=clave_generada`.

Los valores `MYSQL_*` controlan las credenciales de la base de datos en Docker Compose y también pueden usarse para una instancia local.

## Ejecución local (sin Docker)

1. Asegúrate de tener instalado Java 17.
2. Revisa `pom.xml` y descarga las dependencias (`./mvnw dependency:go-offline`).
3. Crea en tu MySQL local la base de datos `db-playlab` (o ajusta `application.properties`).
4. Crea el archivo `.env` (ver pasos anteriores).
5. Ejecuta la aplicación con `./mvnw spring-boot:run`.

## Ejecución con Docker Compose

1. Copia `.env.example` a `.env` y define `JWT_PRIVATE_KEY`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` y `MYSQL_ROOT_PASSWORD`.
2. Construye y levanta los contenedores:

	```bash
	docker compose up --build
	```

3. La API quedará disponible en `http://localhost:8080` y MySQL expuesto en `localhost:3306`.
4. Para detener los servicios usa `docker compose down` (agrega `-v` si quieres borrar los datos del volumen `mysql_data`).

El contenedor de la aplicación usa OpenJDK 17 y el contenedor de base de datos utiliza la última imagen estable de MySQL 8.4.

## API rápida

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/auth/log-in` | Inicia sesión y devuelve un JWT. |
| `POST` | `/auth/sign-up` | Crea un jugador y devuelve un JWT listo para usar. |
| `POST` | `/auth/validate-token` | Verifica si un JWT sigue siendo válido. |
| `GET` | `/auth/logout` | Endpoint formal para cerrar sesión en el cliente. |
| `POST` | `/api/scores` | Guarda un puntaje para un juego específico (token requerido). |
| `GET` | `/api/scores?gameId=1` | Ranking completo del juego indicado. |
| `GET` | `/api/scores?gameId=1&playerId=42` | Mejor puntaje del jugador en el juego indicado. |
| `GET` | `/api/scores/leaderboard?gameId=1&limit=15` | Top N (máx. 50) puntajes del juego indicado. |
| `GET` | `/api/profile?playerId=42` | Resumen de puntajes acumulados del jugador. |
| `GET` | `/api/games` | Lista de todos los juegos disponibles. |
| `GET` | `/api/games/{id}` | Información puntual de un juego. |

Todos los endpoints bajo `/api/**` requieren un header `Authorization: Bearer <token>`.
