# Checklist de Verificación de Cuenta MercadoPago

## Error Actual
- Código: `PA_UNAUTHORIZED_RESULT_FROM_POLICIES`
- Bloqueado por: `PolicyAgent`
- Status: 403 Forbidden

## ✅ Ya Implementado en el Código

### Campos Obligatorios de MercadoPago
1. ✅ `external_reference` - Referencia externa para conciliación (formato: `EP-timestamp-random`)
2. ✅ `notification_url` - URL del webhook para notificaciones
3. ✅ Device ID está siendo enviado correctamente
4. ✅ Las credenciales de producción están configuradas en Heroku
5. ✅ El token de la tarjeta se genera correctamente
6. ✅ El `advancedFraudPrevention` está habilitado

### Campos Recomendados de MercadoPago
1. ✅ `items.category_id` - Categoría "kids" para productos infantiles
2. ✅ `items.description` - Descripción de cada item

### Migración de Base de Datos
- ✅ Migración 032: Agrega campo `external_reference` a tabla `online_sales`

## 🔍 Pendiente de Verificar en Dashboard de MercadoPago

### 1. Estado de las Credenciales de Producción
- [ ] Ve a: https://www.mercadopago.com.mx/developers/panel/app
- [ ] Verifica que tus credenciales de producción estén **ACTIVADAS**
- [ ] Deben mostrar estado "Activas" o "Activadas"

### 2. Información del Negocio Completa
- [ ] Ve a tu Panel de MercadoPago → Configuración → Negocio
- [ ] Verifica que tengas completados:
  - Nombre del negocio
  - Tipo de industria/categoría
  - URL del sitio web (https://tienda.entrepeques.com o similar)
  - RFC (si aplica en México)
  - Dirección fiscal

### 3. Proceso de Homologación/Certificación
- [ ] Ve a: https://www.mercadopago.com.mx/developers/panel/credentials
- [ ] Busca si hay algún mensaje de "Certificación pendiente" o "Homologación requerida"
- [ ] Si aparece, necesitas completar el proceso de certificación

### 4. Límites y Restricciones
- [ ] Verifica si tu cuenta tiene límites de transacción
- [ ] Revisa si hay alertas o notificaciones en tu dashboard
- [ ] Confirma que no haya restricciones temporales

### 5. Configuración de la Aplicación
- [ ] En el Panel de Desarrolladores, verifica:
  - [ ] Redirect URIs configuradas (si es necesario)
  - [ ] URLs de notificación configuradas
  - [ ] Permisos de la aplicación (debe incluir "payments")

## 📋 Resumen de Cambios Realizados

### En `onlinePayment.controller.ts`:
```javascript
// Generar referencia externa única
const externalReference = `EP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

// URL del webhook
const notificationUrl = `${apiBaseUrl}/api/online-payments/webhook`;

// Campos agregados al paymentData:
external_reference: externalReference,
notification_url: notificationUrl,

// Items con campos adicionales:
items: items?.map((item: any) => ({
  id: item.valuation_item_id?.toString(),
  title: item.title || "Producto",
  description: item.description || item.title || "Producto infantil Entrepeques",
  category_id: "kids",
  quantity: item.quantity,
  unit_price: item.unit_price
}))
```

### Nueva migración `032-add-external-reference-to-online-sales.sql`:
- Agrega columna `external_reference` a tabla `online_sales`
- Crea índice para búsquedas rápidas

## 🚀 Pasos para Desplegar

1. **Ejecutar migración en producción:**
   ```bash
   heroku run npm run migrate -a entrepeques-api
   ```

2. **Desplegar cambios del API:**
   ```bash
   git add .
   git commit -m "feat(mp): agregar campos obligatorios para MercadoPago"
   git push heroku main
   ```

3. **Probar un pago de prueba**

## 📧 Si Sigue Fallando Después de los Cambios

Contacta a Soporte de MercadoPago con esta información:

**Asunto**: Error PA_UNAUTHORIZED_RESULT_FROM_POLICIES al procesar pagos

**Información a proporcionar**:
- Access Token: APP_USR-794ecdaf-84e6-4f2e-88a5-70a74b39ff0f
- Error Code: PA_UNAUTHORIZED_RESULT_FROM_POLICIES
- Blocked by: PolicyAgent
- Descripción: Los pagos son rechazados con error 403 incluso con todos los campos obligatorios
- Sitio web: https://pequeprogram-tienda.vercel.app
- Webhook URL: https://entrepeques-api-39ced1cb6398.herokuapp.com/api/online-payments/webhook

## 📚 Referencias
- Dashboard MercadoPago: https://www.mercadopago.com.mx/developers/panel
- Documentación de Producción: https://www.mercadopago.com.ar/developers/en/docs/checkout-api/integration-test/go-to-production-requirements
- Soporte MercadoPago: https://www.mercadopago.com.mx/developers/es/support
