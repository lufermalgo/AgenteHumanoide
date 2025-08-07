# Configuración de Variables de Entorno

Para ejecutar el proyecto, necesitas crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Firebase Config
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Gemini Config
REACT_APP_GEMINI_API_KEY=your_gemini_api_key

# D-ID Config (próximamente)
REACT_APP_DID_API_KEY=your_did_api_key
```

## Obtener las Credenciales

### Firebase
1. Ve a la [Consola de Firebase](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a Configuración del Proyecto > General
4. Desplázate hasta "Tus aplicaciones"
5. Copia las credenciales de la configuración

### Gemini
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API Key
3. Copia la API Key

### D-ID (próximamente)
1. Ve a [D-ID](https://www.d-id.com)
2. Regístrate para obtener una API Key
3. Copia la API Key

## Notas Importantes
- NUNCA comitees el archivo `.env` al repositorio
- Mantén tus API Keys seguras
- Usa diferentes API Keys para desarrollo y producción