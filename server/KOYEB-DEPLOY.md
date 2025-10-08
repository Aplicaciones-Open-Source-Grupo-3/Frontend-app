# EasyPark Backend - Koyeb Deployment (100% FREE)

## Desplegar en Koyeb (Opción GRATIS permanente)

### Por qué Koyeb:
- ✅ **100% GRATIS** para siempre (1 servicio web)
- ✅ NO duerme por inactividad
- ✅ Muy fácil de usar
- ✅ SSL automático
- ✅ Despliegue desde GitHub

### Paso 1: Crear cuenta en Koyeb
1. Ve a [https://www.koyeb.com](https://www.koyeb.com)
2. Regístrate con GitHub o email
3. No necesitas tarjeta de crédito

### Paso 2: Crear nueva app
1. Click en "Create App"
2. Selecciona "GitHub" como fuente
3. Conecta tu repositorio
4. Selecciona la rama `main`

### Paso 3: Configurar el servicio
- **Name**: `easypark-backend`
- **Region**: Selecciona la más cercana (Frankfurt, Washington, etc.)
- **Builder**: Buildpack
- **Build command**: `cd server && npm install`
- **Run command**: `cd server && npm start`
- **Port**: `10000`
- **Instance type**: Free (Nano)

### Paso 4: Variables de entorno
- Koyeb asigna automáticamente `PORT=8000`
- Ajusta el `server.js` para usar `process.env.PORT || 8000`

### Paso 5: Deploy
1. Click en "Deploy"
2. Espera 2-3 minutos
3. Obtendrás una URL como: `https://easypark-backend-xxxx.koyeb.app`

### Paso 6: Actualizar frontend
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://easypark-backend-xxxx.koyeb.app'
};
```

## Ventajas de Koyeb
- ✅ **GRATIS para siempre**: 1 servicio web sin límite
- ✅ **No duerme**: Siempre activo
- ✅ **Sin tarjeta**: No necesitas método de pago
- ✅ **SSL gratis**: HTTPS automático
- ✅ **Buena latencia**: Múltiples regiones

## Limitaciones plan gratuito
- Solo 1 servicio web
- 512MB RAM
- 2GB disco
- Suficiente para json-server

