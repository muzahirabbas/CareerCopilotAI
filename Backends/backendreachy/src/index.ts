
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAfterApplyingPrompt, getExpandNetworkPrompt } from './prompts';

export interface Env {
  // If you set a secret in wrangler.toml, it would be available here.
  // GEMINI_API_KEY: string;
}

async function handleRequest(request: Request, env: Env) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { type, data, apiKey } = await request.json();

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Gemini API key is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    let prompt;
    if (type === 'after-applying') {
      prompt = getAfterApplyingPrompt(data);
    } else if (type === 'expand-network') {
      prompt = getExpandNetworkPrompt(data);
    } else {
      return new Response(JSON.stringify({ error: 'Invalid generation type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ message: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to generate message from Gemini API.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // In production, restrict this to your frontend's domain
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function handleOptions(request: Request) {
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS preflight requests.
    return new Response(null, {
      headers: corsHeaders(),
    });
  } else {
    // Handle standard OPTIONS requests.
    return new Response(null, {
      headers: {
        Allow: 'POST, OPTIONS',
      },
    });
  }
}

export default {
  fetch: handleRequest,
};
