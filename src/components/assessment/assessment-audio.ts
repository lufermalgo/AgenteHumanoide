import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Analyser } from '../../analyser';

@customElement('assessment-audio')
export class AssessmentAudio extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }

    .audio-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .visualizer {
      width: 100%;
      max-width: 400px;
      aspect-ratio: 1;
      background: #1f2937;
      border-radius: 8px;
    }
  `;

  @property({ type: String })
  sessionId = '';

  @state()
  private isListening = false;

  @state()
  private isProcessing = false;

  private genAI: GoogleGenerativeAI;
  private audioContext!: AudioContext;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private inputAnalyser: Analyser | null = null;
  private outputAnalyser: Analyser | null = null;
  private audioChunks: Blob[] = [];

  constructor() {
    super();
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'test-key');
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.setupAudio();
  }

  private async setupAudio() {
    try {
      this.audioContext = new AudioContext({
        sampleRate: 16000,
        latencyHint: 'interactive'
      });

      // Solicitar permisos de micrófono
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.inputAnalyser = new Analyser(source);

      // Configurar MediaRecorder para capturar audio
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        
        // Procesar audio con Gemini
        this.isProcessing = true;
        try {
          for await (const response of this.genAI.streamGenerateContent({
            contents: [{
              role: 'user',
              parts: [{
                inlineData: {
                  mimeType: 'audio/webm;codecs=opus',
                  data: arrayBuffer
                }
              }]
            }]
          })) {
            // Emitir respuesta para que el componente padre la procese
            this.dispatchEvent(new CustomEvent('response', {
              detail: { text: response.text, final: false }
            }));
          }
        } catch (error) {
          console.error('Error al procesar audio:', error);
        } finally {
          this.isProcessing = false;
          this.audioChunks = [];
        }
      };

      // Configurar nodo de salida para la voz del agente
      const outputNode = this.audioContext.createGain();
      this.outputAnalyser = new Analyser(outputNode);
      outputNode.connect(this.audioContext.destination);

    } catch (error) {
      console.error('Error al configurar audio:', error);
    }
  }

  private startListening() {
    if (!this.mediaRecorder || this.isListening) return;

    this.isListening = true;
    this.audioChunks = [];
    this.mediaRecorder.start(1000); // Capturar en chunks de 1 segundo
  }

  private stopListening() {
    if (!this.mediaRecorder || !this.isListening) return;

    this.isListening = false;
    this.mediaRecorder.stop();
  }

  protected render() {
    return html`
      <div class="audio-container">
        <gdm-live-audio-visuals
          .inputNode=${this.inputAnalyser?.node}
          .outputNode=${this.outputAnalyser?.node}
        ></gdm-live-audio-visuals>
        
        <div class="controls">
          ${this.isProcessing 
            ? html`<span>Procesando...</span>`
            : this.isListening
              ? html`<button @click=${this.stopListening}>Detener</button>`
              : html`<button @click=${this.startListening}>Iniciar</button>`
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'assessment-audio': AssessmentAudio;
  }
}