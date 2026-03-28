# 🎮 Playlab-Integrado

Guía de inicio rápido para levantar el proyecto completo (Backend + Frontend) en tu entorno local.

---
## 🚀 Demo en Vivo

¡El frontend de Playlab está desplegado y listo para usarse! Puedes probar los minijuegos (que utilizan tu cámara web con MediaPipe) directamente desde tu navegador sin instalar nada:

🎮 **¡Juega ahora!** 👉 **[https://playlab-integrado.onrender.com](https://playlab-integrado.onrender.com)**

> **Nota sobre esta versión web:** Actualmente está desplegada la interfaz gráfica (Frontend) para demostración de los juegos con visión artificial. Las funciones que dependen del backend (como registro en base de datos o ranking global) operan de forma local o simulada en esta demo.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas en tu sistema. Puedes verificar tus versiones ejecutando los comandos de la derecha:

| Herramienta | Versión Requerida | Comando de Verificación |
| :--- | :--- | :--- |
| **Node.js** | 18+ | `node -v` y `npm -v` |
| **Java** | 17 | `java -version` |
| **Docker** | Reciente | `docker -v` |
| **Maven** | Opcional* | `mvn -v` |

> *Nota: Utilizamos `mvnw` (Maven Wrapper) incluido en el proyecto, por lo que tener Maven instalado globalmente es opcional.*

---

## ⚙️ 1. Configuración del Backend (Spring Boot + MySQL)

Puedes levantar el backend de dos maneras: usando Docker (recomendado) o de forma manual.

### Opción A: Con Docker (Recomendado y más fácil)
Esta opción levanta tanto la base de datos MySQL como el backend automáticamente.

1. Entra a la carpeta del backend:
   cd backend-playlab
2. Construye y levanta los contenedores:
    docker compose up --build
    📍 El backend quedará disponible en: http://localhost:8080
    Para detener y limpiar los contenedores, usa:
    docker compose down -v
Opción B: Sin Docker (Manual)

Si prefieres no usar Docker, necesitas tener MySQL instalado y corriendo en tu máquina.

    Entra a la carpeta del backend y copia el archivo de variables de entorno:
    Bash

    cd backend-playlab
    cp .env.example .env

    Edita el archivo .env con tus credenciales de MySQL:
    Fragmento de código

    MYSQL_DATABASE=db-playlab
    MYSQL_ROOT_PASSWORD=supersecret
    MYSQL_USER=playlab
    MYSQL_PASSWORD=playlab
    JWT_PRIVATE_KEY=replace-with-base64-key

    Ejecuta el backend usando Maven Wrapper:
    Bash

    ./mvnw spring-boot:run

💻 2. Configuración del Frontend (Vue + Vite)

Abre una nueva terminal para mantener el backend corriendo, y sigue estos pasos:

    Entra a la carpeta del frontend:
    Bash

    cd Playlab

    Instala las dependencias:
    Bash

    npm install

    Levanta el servidor de desarrollo:
    Bash

    npm run dev

    📍 El frontend quedará disponible en: http://localhost:5173

🔑 Usuarios de Prueba

Para facilitarte las pruebas, el backend crea automáticamente un usuario por defecto al inicializar la base de datos:

    Usuario: tester

    Contraseña: 123

🔄 Flujo de Trabajo (Orden Correcto)

SIEMPRE que vayas a retomar el trabajo en el proyecto, este es el orden que debes seguir:

Terminal 1 (Backend):
Bash

cd backend-playlab
docker compose up

Terminal 2 (Frontend):
Bash

cd Playlab
npm run dev

## 📸 Capturas de Pantalla

A continuación, algunas vistas de la interfaz y los minijuegos de Playlab:

### Autenticación y Menú
| Login | Registro |
| :---: | :---: |
| ![Login](Capturas/Login.png) | ![Register](Capturas/Register.png) |

| Menú Principal | Puntuaciones (Score) |
| :---: | :---: |
| ![Menú](Capturas/MenuPlaylab.png) | ![Score](Capturas/Score.png) |

---

### 🦖 Juego: Dino
| Inicio / Gameplay | Gameplay Avanzado |
| :---: | :---: |
| ![Dino](Capturas/Dino.png) | ![Dino 2](Capturas/DIno2.png) |

| Game Over |
| :---: |
| ![Dino 3](Capturas/DIno3.png) |

---

### 🧠 Juego: Simon Gesture
| Menú del Juego | Gameplay (Gestos) | Game Over |
| :---: | :---: | :---: |
| ![Simon Menu](Capturas/SimonMenu.png) | ![Simon Gesture](Capturas/SimonGesture.png) | ![Simon Lost](Capturas/SimoneGestureLost.png) |

---

### 🐍 Juego: Snake
| Inicio | Gameplay | Gameplay Avanzado | Game Over |
| :---: | :---: | :---: | :---: |
| ![Snake 1](Capturas/Snake1.png) | ![Snake 2](Capturas/Snake2.png) | ![Snake 3](Capturas/Snak3.png) | ![Snake 4](Capturas/snake4.png) |

---

### 🛸 Juego: UFO Evader
| Menú Principal | Controles |
| :---: | :---: |
| ![UFO](Capturas/Ufo.png) | ![UFO Controls](Capturas/UfoControls.png) |

| Gameplay | Game Over |
| :---: | :---: |
| ![UFO Evader](Capturas/UFOevader.png) | ![UFO Lost](Capturas/UfoLost.png) |

---

## 🏗️ Arquitectura y Documentación Técnica

En esta sección se detalla la estructura lógica, el modelo de datos y los procesos que componen Playlab.

### Modelo C4
Utilizamos el modelo C4 para describir la arquitectura del software en diferentes niveles de abstracción.

| Nivel 1: Contexto | Nivel 2: Contenedores |
| :---: | :---: |
| ![C4 Nivel 1](Documentation/playlab-c4-nivel1.png) | ![C4 Nivel 2](Documentation/playlab-c4-nivel2.png) |

| Nivel 3: Componentes (Frontend) | Nivel 3: Componentes (Backend) |
| :---: | :---: |
| ![C4 Nivel 3A](Documentation/playlab-c4-nivel3a.png) | ![C4 Nivel 3B](Documentation/playlab-c4-nivel3b.png) |

---

### Modelos de Datos y Dominio

| Modelo de Dominio | Modelo Relacional (MR) |
| :---: | :---: |
| ![Modelo Dominio](Documentation/Dominio_Play_Lab.png) | ![Modelo Relacional](Documentation/MR_Play_Lab.png) |

---

### Procesos (BPMN)
Diagrama de notación de procesos de negocio para la lógica del sistema.

![BPMN](Documentation/bpmn.png)

---

### 📄 Documentación Detallada (PDFs)

Para una comprensión profunda del proyecto, puedes consultar los siguientes documentos adjuntos en el repositorio:

* 📘 **[Descripción de la Arquitectura de Playlab](Documentation/arquitectura%20Playlab.pdf)**: Detalle técnico sobre las decisiones de diseño y tecnologías.
* 📕 **[IEEE 830 SRS - Play Lab](Documentation/ieee830%20SRS%20Play%20Lab.pdf)**: Especificación de Requisitos de Software basada en el estándar IEEE 830.
