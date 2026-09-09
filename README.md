# Encuentra UNISON

Encuentra UNISON es una aplicación para la gestión de objetos perdidos y encontrados dentro de la comunidad universitaria.

El proyecto utiliza Expo y React Native para permitir el desarrollo de una aplicación Web y una aplicación móvil Android desde una misma base de código.

La autenticación se realiza mediante Microsoft Entra ID y Supabase.

---

# Tecnologías utilizadas

El proyecto utiliza principalmente:

- Expo
- React Native
- Expo Router
- React Native Web
- TypeScript
- NativeWind
- Tailwind CSS
- Supabase
- Microsoft Entra ID

---

# Requisitos

Antes de ejecutar el proyecto es necesario instalar las siguientes herramientas.

## Node.js

Instalar una versión reciente de Node.js.

Verificar la instalación:

```bash
node -v
```

Verificar npm:

```bash
npm -v
```

---

# Clonar el proyecto

Clonar el repositorio:

```bash
git clone https://github.com/wizkat/unison-encuentra.git
```

Entrar a la carpeta:

```bash
cd unison-encuentra
```

En Windows se recomienda utilizar una ruta corta, por ejemplo:

```text
C:\dev\unison-encuentra
```

Se recomienda evitar rutas demasiado largas o carpetas sincronizadas con OneDrive, ya que pueden causar problemas durante la compilación nativa de Android.

---

# Instalar dependencias

Desde la raíz del proyecto ejecutar:

```bash
npm install
```

Las dependencias principales ya se encuentran declaradas en `package.json`, por lo que normalmente no es necesario instalarlas individualmente.

---

# Variables de entorno

El proyecto utiliza un archivo:

```text
.env
```

Este archivo no debe subirse al repositorio.

Debe contener las siguientes variables:

```env
EXPO_PUBLIC_SUPABASE_URL=https://oyvfedcsxroxanyhfltb.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_7N7Qckipgp7J6dpBx5TorA_ptv_965h
EXPO_PUBLIC_ENTRA_TENANT_ID=5625c838-74ae-4a4f-abf5-4747c86cd2ff
```

El archivo `.env` debe mantenerse privado.

---

# Ejecutar el proyecto Web

Para iniciar Expo:

```bash
npx expo start
```

Desde la terminal se puede presionar:

```text
w
```

para abrir la versión Web.

También se puede iniciar directamente con:

```bash
npx expo start --web
```

La aplicación normalmente estará disponible en:

```text
http://localhost:8081
```

Si existen problemas de caché:

```bash
npx expo start --web --clear
```
---
Usuarios
employee01 ( David Martinez Perez ) Admin

employee01@unisoftannonuseraleeas.onmicrosoft.com
Ruda167074pa
employee02 ( Layla Quijada Quirarte ) Member

employee02@unisoftannonuseraleeas.onmicrosoft.com
Powo650291dj
employee03 ( Kenia Zeilan Flores Castro ) Operator

employee03@unisoftannonuseraleeas.onmicrosoft.com
Moyo7759dsa
student01 ( Jose Maria Bustamante Caldera ) Miembro

a220000001@unisoftannonuseraleeas.onmicrosoft.com
Dayo971793df
student02 ( Ana Lucia Ballesteros Zamorano ) Miembro

a220000002@unisoftannonuseraleeas.onmicrosoft.com
Gotu208607vn
student03 ( Cristian David Morales Quijada ) Operator

a220000003@unisoftannonuseraleeas.onmicrosoft.com
Kazu20123jda

---
---

# Desarrollo Android

La aplicación Android utiliza un Development Build.

Para este proyecto no se recomienda depender únicamente de Expo Go, principalmente por la autenticación OAuth y el esquema personalizado utilizado por la aplicación.

El esquema configurado es:

```text
unisonencuentra
```

y se encuentra definido en `app.json`.

---

# Requisitos para Android en Windows

Para compilar Android se necesita:

- Android Studio
- Android SDK
- JDK 17
- Un celular Android o un emulador
- Opciones de desarrollador habilitadas
- Depuración USB habilitada

---

# Instalar Android Studio

Instalar Android Studio y desde el SDK Manager asegurarse de tener instalado:

- Android SDK
- Android SDK Platform Tools
- Android SDK Build Tools
- Android Emulator, si se desea utilizar uno

La ruta habitual del Android SDK en Windows es:

```text
C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
```

---

# Java / JDK

Para compilar el proyecto Android se recomienda utilizar JDK 17.

Verificar Java con:

```bash
java -version
```

Debe mostrar una versión 17.

Ejemplo:

```text
openjdk version "17.x.x"
```

En Windows se puede configurar temporalmente:

```bat
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"
```

Después verificar:

```bat
java -version
```

---

# Configurar Android SDK

La carpeta:

```text
android
```

puede ser generada automáticamente por Expo.

Después de generarla puede ser necesario crear:

```text
android\local.properties
```

Ejemplo:

```properties
sdk.dir=C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk
```

En una computadora donde el usuario de Windows sea `HP`:

```properties
sdk.dir=C:\\Users\\HP\\AppData\\Local\\Android\\Sdk
```

Este archivo es específico de cada computadora.

---

# Generar e instalar la aplicación Android

Conectar el celular mediante USB.

Verificar que tenga habilitado:

- Modo desarrollador
- Depuración USB
- Instalación mediante USB, si el dispositivo muestra esa opción

Desde la raíz del proyecto ejecutar:

```bash
npx expo run:android
```

Expo realizará aproximadamente lo siguiente:

```text
Proyecto
   ↓
Prebuild
   ↓
Gradle
   ↓
APK Debug
   ↓
Instalación mediante ADB
   ↓
Development Build
```

La primera compilación puede tardar varios minutos.

Las siguientes compilaciones normalmente son más rápidas.

---

# Error: SDK location not found

Si aparece:

```text
SDK location not found
```

crear:

```text
android\local.properties
```

y agregar:

```properties
sdk.dir=C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk
```

---

# Error: INSTALL_FAILED_USER_RESTRICTED

Si aparece:

```text
INSTALL_FAILED_USER_RESTRICTED
```

el APK sí fue compilado, pero Android rechazó la instalación.

Revisar en el celular:

- Depuración USB
- Permitir instalación mediante USB
- Aceptar la ventana de confirmación de instalación
- Mantener el celular desbloqueado durante la instalación

Después volver a ejecutar:

```bash
npx expo run:android
```

---

# Trabajar en Android después de instalar la app

Una vez que el Development Build está instalado en el celular, no es necesario ejecutar:

```bash
npx expo run:android
```

después de cada cambio.

Para cambios normales de React Native, TypeScript o estilos utilizar:

```bash
npx expo start --dev-client
```

Luego abrir manualmente la aplicación `unison-encuentra` instalada en el teléfono.

---

# Desarrollo mediante Wi-Fi

Si la computadora y el celular se encuentran en la misma red Wi-Fi:

```bash
npx expo start --dev-client
```

Metro mostrará una dirección similar a:

```text
unisonencuentra://expo-development-client/?url=http://192.168.1.X:8081
```

La aplicación Android se conecta al servidor Metro de la computadora.

No es necesario mantener el cable USB conectado.

---

# Desarrollo mediante túnel

Si la red local bloquea la comunicación entre el celular y la computadora, se puede utilizar un túnel.

Instalar ngrok para Expo:

```bash
npm install --save-dev @expo/ngrok@^4.1.0
```

Después iniciar:

```bash
npx expo start --dev-client --tunnel
```

Si es necesario limpiar la caché:

```bash
npx expo start --dev-client --tunnel --clear
```

El túnel permite conectar el Development Build con Metro sin depender directamente de la red LAN.

---

# Importante sobre Development Build

El Development Build instalado en Android no es todavía una aplicación completamente independiente.

Durante desarrollo necesita conectarse al servidor Metro.

Flujo normal:

```text
Computadora
   │
   │ Metro
   │
   ▼
Internet / Wi-Fi
   │
   ▼
Aplicación Android
```

Para obtener una aplicación que pueda abrirse sin Metro y sin tener la computadora encendida será necesario generar posteriormente una build de producción o preview.

---

# Web y Android

El proyecto comparte una misma base de código para Web y Android.

Sin embargo, cada plataforma puede tener una interfaz distinta.

React Native y Expo permiten utilizar archivos específicos por plataforma.

Ejemplo:

```text
src/app/
├── index.tsx
├── index.web.tsx
└── index.native.tsx
```

Donde:

```text
index.web.tsx
```

puede contener la interfaz Web y:

```text
index.native.tsx
```

puede contener la interfaz para Android/iOS.

De esta manera se puede mantener:

```text
WEB
├── Dashboard
├── Tablas
├── Filtros
└── Administración

ANDROID
├── Inicio
├── Buscar objetos
├── Reportar objeto
├── Mis reportes
└── Perfil
```

Mientras ambas plataformas comparten:

```text
Supabase
Autenticación
Tipos
Modelos
Base de datos
Lógica de negocio
```

---

# Autenticación

La aplicación utiliza:

```text
Microsoft Entra ID
        ↓
Supabase Auth
        ↓
Encuentra UNISON
```

Microsoft maneja las credenciales del usuario.

La aplicación no almacena directamente las contraseñas de Microsoft.

---

# Autenticación Web

En Web el flujo es:

```text
Aplicación Web
      ↓
Supabase
      ↓
Microsoft
      ↓
Supabase
      ↓
Aplicación Web
```

Durante desarrollo la aplicación normalmente utiliza:

```text
http://localhost:8081
```

Esta dirección debe estar permitida dentro de las Redirect URLs de Supabase.

Por ejemplo:

```text
http://localhost:8081/**
```

---

# Autenticación Android

En Android se utiliza el esquema personalizado:

```text
unisonencuentra://
```

El callback utilizado por la aplicación es:

```text
unisonencuentra://auth/callback
```

Esta dirección debe agregarse en:

```text
Supabase
→ Authentication
→ URL Configuration
→ Redirect URLs
```

El flujo móvil es:

```text
Android
   ↓
Supabase
   ↓
Microsoft Entra ID
   ↓
Supabase
   ↓
unisonencuentra://auth/callback
   ↓
Android
```

---

# Microsoft Entra ID

Cuando Supabase se utiliza como intermediario de OAuth, Microsoft Entra ID debe redireccionar hacia Supabase.

El Redirect URI de Microsoft tiene una estructura similar a:

```text
https://TU_PROYECTO.supabase.co/auth/v1/callback
```

No se debe colocar:

```text
unisonencuentra://auth/callback
```

directamente como callback principal de Microsoft en este flujo.

Supabase recibe primero la respuesta de Microsoft y después redirecciona hacia la aplicación.

---

# Estructura principal

La estructura general del proyecto es:

```text
unison-encuentra/
│
├── assets/
│
├── src/
│   ├── adapters/
│   │   └── supabase/
│   │
│   ├── app/
│   │
│   ├── components/
│   │
│   ├── domain/
│   │
│   ├── mocks/
│   │
│   ├── ports/
│   │
│   ├── providers/
│   │
│   ├── theme/
│   │
│   └── global.css
│
├── supabase/
│   └── migrations/
│
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

---

# Supabase

Las configuraciones relacionadas con Supabase se encuentran principalmente en:

```text
src/adapters/supabase/
```

Las migraciones de la base de datos se encuentran en:

```text
supabase/migrations/
```

Las variables de conexión no deben escribirse directamente dentro del código fuente.

Deben utilizarse desde:

```text
.env
```

---

# Comandos útiles

Instalar dependencias:

```bash
npm install
```

Iniciar Expo:

```bash
npx expo start
```

Iniciar Web:

```bash
npx expo start --web
```

Iniciar Web limpiando caché:

```bash
npx expo start --web --clear
```

Iniciar Development Build:

```bash
npx expo start --dev-client
```

Iniciar mediante túnel:

```bash
npx expo start --dev-client --tunnel
```

Compilar e instalar Android:

```bash
npx expo run:android
```

Revisar compatibilidad de dependencias Expo:

```bash
npx expo install --check
```

---

# Recomendaciones

No utilizar:

```bash
npm audit fix --force
```

sin revisar los cambios que realizará, ya que puede actualizar dependencias a versiones incompatibles con Expo.

Para dependencias relacionadas con Expo se recomienda utilizar:

```bash
npx expo install nombre-del-paquete
```

en lugar de instalar versiones arbitrarias con npm.

---

# Solución de problemas

## Limpiar caché de Metro

```bash
npx expo start --clear
```

---

## Verificar dispositivos Android conectados

```bash
adb devices
```

Si `adb` no está disponible directamente:

```bat
C:\Users\TU_USUARIO\AppData\Local\Android\Sdk\platform-tools\adb.exe devices
```

---

## Android funciona por USB pero no por Wi-Fi

Probar:

```bash
npx expo start --dev-client --tunnel
```

Si el túnel no funciona, comprobar que `@expo/ngrok` esté instalado:

```bash
npm list @expo/ngrok
```

Si no aparece:

```bash
npm install --save-dev @expo/ngrok@^4.1.0
```

---

## Revisar versión de Java

```bash
java -version
```

Para Android debe utilizarse JDK 17.

---

## Revisar paquetes de Expo

```bash
npx expo install --check
```

Esto permite detectar paquetes cuya versión no coincide con la recomendada para el SDK de Expo utilizado por el proyecto.

---

# Seguridad

No subir al repositorio:

- `.env`
- Contraseñas
- Tokens
- Claves privadas
- Credenciales de Microsoft
- Claves privadas de Supabase
- Archivos de firma Android

Las credenciales de prueba deben compartirse mediante un canal privado y nunca dentro del README de un repositorio público.

---

# Usuarios de prueba

Las cuentas utilizadas para pruebas deben administrarse de manera privada.

No se recomienda publicar correos con contraseñas de cuentas de Microsoft Entra ID dentro de este README ni dentro de un repositorio público.

Los integrantes del equipo deben obtener las credenciales de prueba mediante un canal privado.

---

# Licencia

Este proyecto incluye una licencia MIT.