# EasyPark Backend - Deployment Guide

## Desplegar en Render

### Paso 1: Preparar el repositorio
1. Asegúrate de que la carpeta `server/` tenga los siguientes archivos:
   - `package.json`
   - `server.js`
   - `db.json`
   - `.gitignore`

2. Sube tu proyecto a GitHub (si aún no lo has hecho):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/tu-repo.git
   git push -u origin main
   ```

### Paso 2: Crear cuenta en Render
1. Ve a [https://render.com](https://render.com)
2. Regístrate con tu cuenta de GitHub

### Paso 3: Crear un nuevo Web Service
1. Click en "New +" → "Web Service"
2. Conecta tu repositorio de GitHub
3. Configura el servicio:
   - **Name**: `easypark` 
   - **Region**: Elige la más cercana (US East, EU West, etc.)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Click en "Create Web Service"

### Paso 4: Esperar el despliegue
- Render instalará las dependencias y ejecutará tu servidor
- En 2-3 minutos, obtendrás una URL como: `https://easypark-backend.onrender.com`

### Paso 5: Actualizar el frontend
1. Abre `src/environments/environment.ts`
2. Cambia la URL del API:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://easypark-backend.onrender.com'
   };
   ```

3. Recompila tu frontend:
   ```bash
   npm run build
   ```

### Verificar que funciona
Prueba tu API visitando:
- `https://tu-backend.onrender.com/vehicles`
- `https://tu-backend.onrender.com/accounting-records`
- `https://tu-backend.onrender.com/parkingSettings`

## Notas importantes
- El plan gratuito de Render puede "dormir" después de 15 minutos sin actividad
- La primera petición puede tardar 30-60 segundos si el servicio estaba dormido
- Para mantenerlo activo 24/7, necesitas un plan de pago

## Solución de problemas
Si hay errores, revisa los logs en el dashboard de Render en la sección "Logs".

