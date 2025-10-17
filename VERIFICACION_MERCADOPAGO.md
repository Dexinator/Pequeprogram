# Checklist de Verificación de Cuenta MercadoPago

## Error Actual
- Código: `PA_UNAUTHORIZED_RESULT_FROM_POLICIES`
- Bloqueado por: `PolicyAgent`
- Status: 403 Forbidden

## ✅ Ya Verificado
1. ✅ Device ID está siendo enviado correctamente
2. ✅ Las credenciales de producción están configuradas en Heroku
3. ✅ El token de la tarjeta se genera correctamente
4. ✅ El `advancedFraudPrevention` está habilitado

## 🔍 Necesitas Verificar en el Dashboard de MercadoPago

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

## 📧 Si Todo Está Correcto y Sigue Fallando

Contacta a Soporte de MercadoPago con esta información:

**Asunto**: Error PA_UNAUTHORIZED_RESULT_FROM_POLICIES al procesar pagos

**Información a proporcionar**:
- Access Token: APP_USR-794ecdaf-84e6-4f2e-88a5-70a74b39ff0f
- Error Code: PA_UNAUTHORIZED_RESULT_FROM_POLICIES
- Blocked by: PolicyAgent
- Descripción: Los pagos son rechazados con error 403 incluso con device_id correcto
- Último token de prueba: 025fa83576e5881b7a47edcf330bd9b6
- Sitio web: https://pequeprogram-tienda.vercel.app

## 🧪 Prueba Alternativa

Mientras verificas, puedes probar con credenciales de TEST para confirmar que la integración funciona:

Las credenciales de TEST deberían funcionar sin estos problemas de políticas.

## 📚 Referencias
- Dashboard MercadoPago: https://www.mercadopago.com.mx/developers/panel
- Documentación de Producción: https://www.mercadopago.com.ar/developers/en/docs/checkout-api/integration-test/go-to-production-requirements
- Soporte MercadoPago: https://www.mercadopago.com.mx/developers/es/support
