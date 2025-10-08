# EasyPark Backend - Railway Deployment

## Desplegar en Railway (RECOMENDADO - No duerme)

### Por qué Railway:
- ✅ NO duerme por inactividad
- ✅ $5 de crédito gratis cada mes
- ✅ Muy fácil de usar
- ✅ Conecta directo con GitHub
- ✅ Métricas y logs en tiempo real

### Paso 1: Crear cuenta en Railway
1. Ve a [https://railway.app](https://railway.app)
2. Regístrate con tu cuenta de GitHub
3. Verifica tu email

### Paso 2: Subir código a GitHub (si no lo has hecho)
```bash
cd "C:\Users\WINDOWS 10\WebstormProjects\Frontend-app"
git add .
git commit -m "Preparar backend para Railway"
git push
```

### Paso 3: Crear nuevo proyecto en Railway
1. En Railway, click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Autoriza Railway a acceder a tus repositorios
4. Selecciona tu repositorio `Frontend-app`
5. Railway detectará automáticamente que es un proyecto Node.js

### Paso 4: Configurar variables de entorno
1. En el dashboard del proyecto, ve a "Variables"
2. Agrega:
   - `PORT` = `10000` (Railway lo asigna automáticamente, pero puedes especificarlo)

### Paso 5: Configurar el directorio raíz
1. En "Settings" → "Root Directory"
2. Escribe: `server`
3. Guarda los cambios

### Paso 6: Configurar comandos
1. En "Settings" → "Build Command": `npm install`
2. En "Settings" → "Start Command": `npm start`
3. Railway desplegará automáticamente

### Paso 7: Obtener la URL
1. Railway generará automáticamente una URL como:
   `https://easypark-backend-production-xxxx.up.railway.app`
2. También puedes configurar un dominio personalizado gratis

### Paso 8: Actualizar el frontend
Copia la URL que te dio Railway y actualízala en:
- `src/environments/environment.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-proyecto.up.railway.app'
};
```

### Verificar que funciona
Visita tu API:
- `https://tu-proyecto.up.railway.app/vehicles`
- `https://tu-proyecto.up.railway.app/accounting-records`

## Ventajas de Railway sobre Render
- ✅ **No duerme**: Tu API siempre responde rápido
- ✅ **$5 gratis/mes**: Suficiente para proyectos pequeños
- ✅ **Mejor UX**: Dashboard más intuitivo
- ✅ **Logs en tiempo real**: Fácil debug
- ✅ **Despliegue automático**: Push a GitHub y se actualiza solo

## Monitoreo de créditos
- Railway te da $5/mes gratis
- Tu backend consumirá ~$2-3/mes
- Puedes ver el uso en tiempo real en el dashboard

## Alternativa: Koyeb (100% gratis)
Si Railway se te acaba el crédito, usa Koyeb:
1. Ve a [https://koyeb.com](https://koyeb.com)
2. Conecta GitHub
3. Despliega (mismo proceso que Railway)
4. **100% gratis** para 1 servicio, sin límite de tiempo

