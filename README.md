# 🧾 Reservas ENAP API

**Reservas ENAP API** es el backend oficial del sistema de **reservas y pagos en línea** desarrollado para el proyecto ENAP.  
Este servicio está construido con **Node.js + Express + Prisma + PostgreSQL**, e integra **pasarelas de pago reales** (Flow Chile / MercadoPago) en modo seguro y escalable.

---

## 🚀 Características principales

- 🔐 **Autenticación JWT** (roles: Admin / Socio)
- 🗄️ **ORM Prisma** con PostgreSQL
- 💳 **Pagos en línea** (Flow o MercadoPago)
- 📅 **Gestión de Reservas**
- 🧱 **Arquitectura modular y escalable**
- ⚙️ **Validación con Zod**
- 🛡️ **Protección con Helmet, XSS sanitizer, rate limit**
- 🌍 **Configuración ESM y TypeScript**

---

## 🧩 Estructura del proyecto

reservas_enap_api/
│
├── prisma/
│ ├── schema.prisma # Modelos de base de datos
│ └── migrations/ # Migraciones generadas por Prisma
│
├── src/
│ ├── config/ # Configuración global (DB, env)
│ ├── controllers/ # Controladores de rutas (Auth, Reservas, Pagos)
│ ├── middlewares/ # Middlewares (authGuard, errorHandler, etc)
│ ├── providers/ # Integraciones de pasarelas (Flow, MercadoPago)
│ ├── routes/ # Rutas principales de la API
│ ├── services/ # Lógica de negocio (pagos, reservas, etc)
│ ├── validators/ # Esquemas Zod de validación
│ └── server.ts # Punto de entrada del servidor
│
├── scripts/
│ └── verifyEnv.js # Verifica que todas las variables .env estén configuradas
│
├── .env # Variables de entorno (no subir)
├── .env.example # Ejemplo público para otros desarrolladores
├── package.json
├── tsconfig.json
└── README.md



---

## ⚙️ Instalación y configuración

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/<tu-usuario>/reservas_enap_api.git
cd reservas_enap_api


npm install


cp .env.example .env


npm run verify:env


npx prisma migrate dev --name init
npx prisma generate


npm run dev


npm run build && npm start


| Método   | Ruta                             | Descripción                           |
| -------- | -------------------------------- | ------------------------------------- |
| `POST`   | `/api/auth/register`             | Crear usuario                         |
| `POST`   | `/api/auth/login`                | Iniciar sesión                        |
| `GET`    | `/api/reservas`                  | Listar reservas (por usuario o admin) |
| `POST`   | `/api/reservas`                  | Crear nueva reserva                   |
| `PUT`    | `/api/reservas/:id`              | Actualizar estado de reserva          |
| `DELETE` | `/api/reservas/:id`              | Eliminar reserva                      |
| `POST`   | `/api/pagos/checkout`            | Crear intención de pago (Flow/MP)     |
| `GET`    | `/api/pagos/:id`                 | Consultar estado de pago              |
| `POST`   | `/api/pagos/webhook/flow`        | Webhook Flow Chile                    |
| `POST`   | `/api/pagos/webhook/mercadopago` | Webhook MercadoPago                   |



🪙 Pasarelas de pago integradas
💧 Flow Chile (sandbox)

Flow API Docs

Variables: FLOW_API_KEY, FLOW_SECRET, FLOW_BASE_URL

💰 MercadoPago (sandbox)

MercadoPago Developers

Variables: MP_ACCESS_TOKEN, MP_RETURN_URL, MP_NOTIFICATION_URL

Ambas pasarelas son gestionadas a través de un sistema de providers dinámico, que permite cambiar entre ellas sin alterar el código base.


| Comando                   | Descripción                                          |
| ------------------------- | ---------------------------------------------------- |
| `npm run dev`             | Ejecuta el servidor en modo desarrollo (ts-node-dev) |
| `npm run build`           | Compila TypeScript a JavaScript en `/dist`           |
| `npm start`               | Ejecuta el servidor compilado                        |
| `npm run prisma:generate` | Genera tipos de Prisma                               |
| `npm run prisma:migrate`  | Aplica migraciones a la BD                           |
| `npm run verify:env`      | Verifica que el `.env` esté completo                 |


🔐 Seguridad

Tokens JWT firmados con JWT_SECRET

Sanitización de entradas con express-xss-sanitizer

CORS restringido a orígenes específicos (WEB_URL)

Helmet y RateLimit configurados

Firmas HMAC para validar webhooks de Flow


📦 Despliegue
Render

Crear nuevo servicio web → conectar el repo.

Establecer Environment Variables copiando tu .env.

Comando de build:

npm run build


Comando de start:

npm start

Railway / Vercel (backend)

Configura las mismas variables .env.

PostgreSQL se puede alojar directamente desde Railway o Supabase.



🧩 Stack tecnológico
Capa	Tecnología
Backend	Node.js + Express (TypeScript + ESM)
ORM	Prisma ORM
Base de datos	PostgreSQL
Seguridad	Helmet, XSS Sanitizer, JWT
Validación	Zod
Pagos	Flow Chile / MercadoPago
Despliegue	Render / Railway / Vercel


👨‍💻 Autor

Desarrollador: Manuel Contreras
Rol: Full Stack Developer
GitHub: ManuelContrerasDev

Email: contacto@manuelcontrerasdev.cl
Portafolio: https://manuelcontrerasdev.github.io


📄 Licencia

Este proyecto se distribuye bajo la licencia MIT.
Puedes modificarlo y usarlo libremente para propósitos académicos o comerciales, manteniendo el crédito correspondiente.