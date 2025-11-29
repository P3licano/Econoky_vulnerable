# Econoky

Plataforma web para gestionar tu dinero de manera sencilla y efectiva. Construida con Next.js, Tailwind CSS, MongoDB y Stripe.

## 🚀 Características

- **Sistema de usuarios**: Registro, login y gestión de perfiles
- **Red social**: Publicaciones y comunidad
- **Sistema de saldos**: Gestión de transacciones y balance
- **Suscripciones**: Integración con Stripe para planes Pro
- **Dashboard**: Panel de control personalizado

## 📋 Requisitos Previos

- Node.js 18+ instalado
- MongoDB instalado localmente o cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Cuenta en [Stripe](https://stripe.com) (modo test)

## 🛠️ Instalación

1. **Clonar e instalar dependencias**:
```bash
npm install
```

2. **Configurar variables de entorno**:
Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# MongoDB (NoSQL)
# Local: mongodb://localhost:27017/econoky
# Atlas: mongodb+srv://usuario:contraseña@cluster.mongodb.net/econoky
MONGODB_URI=mongodb://localhost:27017/econoky

# JWT Secret (genera uno aleatorio: openssl rand -base64 32)
JWT_SECRET=tu-clave-secreta-jwt-muy-segura

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_clave_publica_de_stripe
STRIPE_SECRET_KEY=tu_clave_secreta_de_stripe
NEXT_PUBLIC_STRIPE_PRICE_ID=tu_price_id_de_stripe
STRIPE_WEBHOOK_SECRET=tu_webhook_secret_de_stripe

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Configurar MongoDB**:
   - Instala MongoDB localmente o usa MongoDB Atlas (recomendado)
   - MongoDB crea las colecciones automáticamente, no necesitas scripts
   - Ver `SETUP.md` para instrucciones detalladas

4. **Configurar JWT Secret**:
   - Genera una clave secreta: `openssl rand -base64 32`
   - Añádela a `.env.local` como `JWT_SECRET`

5. **Configurar Stripe**:
   - Crea un producto y precio en Stripe (modo test)
   - Copia el Price ID y añádelo a `NEXT_PUBLIC_STRIPE_PRICE_ID`
   - Configura un webhook en Stripe apuntando a: `https://tu-dominio.com/api/stripe/webhook`
   - Añade los eventos: `customer.subscription.deleted`, `customer.subscription.updated`, `invoice.payment_succeeded`

6. **Ejecutar el proyecto**:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
Econoky/
├── app/                    # Páginas y rutas (App Router)
│   ├── api/               # API routes
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard del usuario
│   ├── community/         # Red social
│   ├── profile/           # Perfil del usuario
│   └── plans/             # Página de planes
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y configuraciones
│   ├── mongodb.ts         # Cliente de MongoDB
│   └── stripe.ts          # Cliente de Stripe
├── mongodb/               # Documentación de MongoDB
└── public/                # Archivos estáticos
```

## 🗄️ Base de Datos

El proyecto usa MongoDB NoSQL para TODO:

- **MongoDB**: Base de datos NoSQL para todos los datos, incluyendo autenticación:
  - **profiles**: Información de los usuarios (con estadísticas embebidas)
  - **posts**: Publicaciones de la red social (con contador de likes embebido)
  - **transactions**: Transacciones y movimientos de saldo

**Características del diseño NoSQL:**
- No relacional: Sin foreign keys ni relaciones estrictas
- Referencias por ID: Se usan ObjectIds de MongoDB como referencias simples
- Agregaciones: Se usan agregaciones de MongoDB para unir datos
- Embedding: Datos relacionados embebidos cuando tiene sentido
- Escalabilidad: Diseñado para escalar horizontalmente

Ver `SETUP.md` para instrucciones detalladas de configuración.

## 💳 Stripe

El proyecto está configurado para usar Stripe en modo test. Asegúrate de:
- Usar las claves de test (empiezan con `pk_test_` y `sk_test_`)
- Configurar el webhook correctamente
- Usar tarjetas de prueba de Stripe

## 🚢 Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Añade todas las variables de entorno en la configuración de Vercel
3. Configura el webhook de Stripe con la URL de producción
4. Despliega

## 📝 Notas

- Este es un proyecto de aprendizaje, adapta la seguridad según tus necesidades
- La autenticación se maneja completamente con MongoDB y JWT (sin Supabase)
- MongoDB es NoSQL y no relacional, perfecto para redes sociales
- Usa un `JWT_SECRET` fuerte y seguro en producción
- Recuerda configurar correctamente los webhooks de Stripe
- Asegúrate de tener MongoDB corriendo antes de iniciar la aplicación
- Para producción, usa MongoDB Atlas (gratis hasta cierto límite)

## 📄 Licencia

Este proyecto es para fines educativos.
