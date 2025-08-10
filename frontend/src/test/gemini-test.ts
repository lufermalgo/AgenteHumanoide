import 'dotenv/config';

async function testGeminiAPI() {
  try {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('No se encontró REACT_APP_GEMINI_API_KEY en .env');
    }
    const model = 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    console.log('Iniciando prueba de conexión con Gemini...');

    const requestBody = {
      contents: [{
        parts: [{
          text: "Responde en una frase: ¿Qué es la inteligencia artificial generativa?"
        }]
      }]
    };

    console.log('Enviando solicitud a Gemini...');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Respuesta:', JSON.stringify(data, null, 2));

    console.log('Prueba completada');

  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testGeminiAPI();