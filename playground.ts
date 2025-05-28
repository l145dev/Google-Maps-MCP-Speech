/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// tslint:disable
import hljs from 'highlight.js';
import { html, LitElement, svg } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';

import { MapParams } from './mcp_maps_server';

// --- Web Speech API Type Definitions ---
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
  readonly interpretation?: any;
  readonly emma?: Document;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

type SpeechRecognitionErrorCode =
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported';

interface SpeechGrammar {
  src: string;
  weight?: number;
}
interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
}
declare var SpeechGrammarList: {
  prototype: SpeechGrammarList;
  new(): SpeechGrammarList;
};
declare var webkitSpeechGrammarList: {
  prototype: SpeechGrammarList;
  new(): SpeechGrammarList;
};


interface SpeechRecognitionEventMap {
  audioend: Event;
  audiostart: Event;
  end: Event;
  error: SpeechRecognitionErrorEvent;
  nomatch: SpeechRecognitionEvent;
  result: SpeechRecognitionEvent;
  soundend: Event;
  soundstart: Event;
  speechend: Event;
  speechstart: Event;
  start: Event;
}

interface SpeechRecognition extends EventTarget {
  grammars: SpeechGrammarList;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  serviceURI?: string;

  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

  abort(): void;
  start(): void;
  stop(): void;

  addEventListener<K extends keyof SpeechRecognitionEventMap>(type: K, listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof SpeechRecognitionEventMap>(type: K, listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface Window {
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof SpeechRecognition;
}

// --- End Web Speech API Type Definitions ---


/** Markdown formatting function with syntax hilighting */
export const marked = new Marked(
  markedHighlight({
    async: true,
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }),
);

const ICON_BUSY = html`<svg
  class="rotating"
  xmlns="http://www.w3.org/2000/svg"
  height="24px"
  viewBox="0 -960 960 960"
  width="24px"
  fill="currentColor">
  <path
    d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Z" />
</svg>`;

const ICON_MICROPHONE = svg`<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Zm0 320q-86 0-158-30.5T190-270q-14-14-14.5-33.5T176-340q0-17 11.5-28.5T216-380q14 0 25.5 6.5T266-352q42 24 91 38t93 14q43 0 92.5-14t90.5-38q13-8 27-4t21 11.5q10 10 12 24t-1 26.5q-14 14-33 23t-40 13.5q-66 29-140 29Z"/></svg>`;
const ICON_MICROPHONE_ACTIVE = svg`<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="orangered"><path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Zm0 320q-86 0-158-30.5T190-270q-14-14-14.5-33.5T176-340q0-17 11.5-28.5T216-380q14 0 25.5 6.5T266-352q42 24 91 38t93 14q43 0 92.5-14t90.5-38q13-8 27-4t21 11.5q10 10 12 24t-1 26.5q-14 14-33 23t-40 13.5q-66 29-140 29Z"/></svg>`;

/**
 * Chat state enum to manage the current state of the chat interface.
 */
export enum ChatState {
  IDLE,
  GENERATING,
  THINKING,
  EXECUTING,
}

/**
 * Chat tab enum to manage the current selected tab in the chat interface.
 */
enum ChatTab {
  GEMINI,
}

/**
 * Chat role enum to manage the current role of the message.
 */
export enum ChatRole {
  USER,
  ASSISTANT,
  SYSTEM,
}

/**
 * Playground component for p5js.
 */
@customElement('gdm-playground')
export class Playground extends LitElement {
  @query('#anchor') anchor?: HTMLDivElement;
  @query('#messageInput') messageInputElement?: HTMLInputElement;


  @state() chatState = ChatState.IDLE;
  @state() isRunning = true;
  @state() selectedChatTab = ChatTab.GEMINI;
  @state() inputMessage = '';
  @state() messages: HTMLElement[] = [];

  @state() isListening = false;
  @state() speechRecognitionError: string | null = null;
  private SpeechRecognitionAPI: typeof SpeechRecognition | null = null;
  private speechRecognitionInstance: SpeechRecognition | null = null;
  private initialInputMessageOnListenStart = '';


  private readonly previewFrame: HTMLIFrameElement =
    document.createElement('iframe');

  sendMessageHandler?: CallableFunction;

  constructor() {
    super();
    this.previewFrame.classList.add('preview-iframe');
    this.previewFrame.setAttribute('allowTransparency', 'true');
    this.previewFrame.setAttribute('allowfullscreen', 'true');
    this.previewFrame.setAttribute('loading', 'lazy');
    this.previewFrame.setAttribute(
      'referrerpolicy',
      'no-referrer-when-downgrade',
    );
    this.SpeechRecognitionAPI = (window as Window).SpeechRecognition || (window as Window).webkitSpeechRecognition || null;
  }

  /** Disable shadow DOM */
  createRenderRoot() {
    return this;
  }

  setChatState(state: ChatState) {
    this.chatState = state;
  }

  renderMapQuery(location: MapParams) {
    const MAPS_API_KEY = process.env.MAPS_API_KEY;
    let src = '';
    if (location.location) {
      src = `https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${location.location}`;
    } else if (location.origin && location.destination) {
      src = `https://www.google.com/maps/embed/v1/directions?key=${MAPS_API_KEY}&origin=${location.origin}&destination=${location.destination}`;
    } else if (location.search) {
      src = `https://www.google.com/maps/embed/v1/search?key=${MAPS_API_KEY}&q=${location.search}`;
    }

    this.previewFrame.src = src;
  }

  setInputField(message: string) {
    this.inputMessage = message.trim();
  }

  addMessage(role: string, message: string) {
    const div = document.createElement('div');
    div.classList.add('turn');
    div.classList.add(`role-${role.trim()}`);

    const thinkingDetails = document.createElement('details');
    thinkingDetails.classList.add('hidden');
    const summary = document.createElement('summary');
    summary.textContent = 'Thinking...';
    thinkingDetails.classList.add('thinking');
    thinkingDetails.setAttribute('open', 'true');
    const thinking = document.createElement('div');
    thinkingDetails.append(thinking);
    div.append(thinkingDetails);
    const text = document.createElement('div');
    text.className = 'text';
    text.textContent = message;
    div.append(text);

    this.messages.push(div);
    this.requestUpdate();

    this.scrollToTheEnd();

    return { thinking, text };
  }

  scrollToTheEnd() {
    if (!this.anchor) return;
    this.anchor.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }

  async sendMessageAction(message?: string, role?: string) {
    if (this.chatState !== ChatState.IDLE) return;

    if (this.isListening) {
      this.speechRecognitionInstance?.stop();
      this.isListening = false;
    }

    this.chatState = ChatState.GENERATING;

    let msg = '';
    if (message) {
      msg = message.trim();
    } else {
      // get message and empty the field
      msg = this.inputMessage.trim();
      this.inputMessage = '';
      this.initialInputMessageOnListenStart = '';
    }

    if (msg.length === 0) {
      this.chatState = ChatState.IDLE;
      return;
    }

    const msgRole = role ? role.toLowerCase() : 'user';

    if (msgRole === 'user' && msg) {
      this.addMessage(msgRole, msg);
    }

    if (this.sendMessageHandler) {
      await this.sendMessageHandler(msg, msgRole);
    }

    this.chatState = ChatState.IDLE;
  }

  private handleInputMessage(e: InputEvent) {
    this.inputMessage = (e.target as HTMLInputElement).value;
    if (this.isListening) {
      this.speechRecognitionInstance?.stop();
      // isListening will be set to false in the 'onend' handler
    }
    this.initialInputMessageOnListenStart = this.inputMessage;
  }


  private async inputKeyDownAction(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      this.sendMessageAction();
    }
  }

  private toggleVoiceInput() {
    if (!this.SpeechRecognitionAPI) {
      this.speechRecognitionError = "Voice input is not supported by your browser.";
      return;
    }

    if (this.isListening) {
      this.speechRecognitionInstance?.stop();
      // isListening will be set to false by onend
    } else {
      this.speechRecognitionInstance = new this.SpeechRecognitionAPI();
      const recognition = this.speechRecognitionInstance!;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';

      this.initialInputMessageOnListenStart = this.inputMessage;

      recognition.onstart = () => {
        this.isListening = true;
        this.speechRecognitionError = null;
      };

      recognition.onend = () => {
        this.isListening = false;
        this.speechRecognitionInstance = null; // Clean up
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error, event.message);
        if (event.error === 'no-speech') {
          this.speechRecognitionError = 'No speech detected. Please try again.';
        } else if (event.error === 'audio-capture') {
          this.speechRecognitionError = 'Audio capture failed. Is microphone connected?';
        } else if (event.error === 'not-allowed') {
          this.speechRecognitionError = 'Microphone access denied. Please allow access in browser settings.';
        } else {
          this.speechRecognitionError = `Error: ${event.error} - ${event.message}`;
        }
        this.isListening = false; // Ensure this is reset
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = this.initialInputMessageOnListenStart ? this.initialInputMessageOnListenStart + ' ' : '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcriptPart = result[0].transcript;
          if (result.isFinal) {
            // Consolidate final results directly
            finalTranscript += transcriptPart;
            // If a part becomes final, we should update initialInputMessageOnListenStart for the next part
            this.initialInputMessageOnListenStart = finalTranscript.trim();
          } else {
            interimTranscript += transcriptPart;
          }
        }
        // Display is formed by concatenated final parts (from current session) + current interim part
        this.inputMessage = (finalTranscript.trim() + ' ' + interimTranscript).trim();
        this.messageInputElement?.focus(); // Keep focus on input
      };
      try {
        recognition.start();
      } catch (e) {
        console.error("Error starting speech recognition:", e);
        this.speechRecognitionError = "Could not start voice input.";
        this.isListening = false;
      }
    }
  }


  render() {
    const showStatus = this.chatState !== ChatState.IDLE || this.speechRecognitionError;
    return html`<div class="playground">
      <div class="sidebar">
        <div class="selector">
          <button
            id="geminiTab"
            class=${classMap({
      'selected-tab': this.selectedChatTab === ChatTab.GEMINI,
    })}
            @click=${() => {
        this.selectedChatTab = ChatTab.GEMINI;
      }}>
            Gemini
          </button>
        </div>
        <div
          id="chat"
          class=${classMap({
        'tabcontent': true,
        'showtab': this.selectedChatTab === ChatTab.GEMINI,
      })}>
          <div class="chat-messages">
            ${this.messages}
            <div id="anchor"></div>
          </div>

          <div class="footer">
            <div
              id="chatStatus"
              class=${classMap({ 'hidden': !showStatus })}>
              ${this.chatState === ChatState.GENERATING
        ? html`${ICON_BUSY} Generating...`
        : this.chatState === ChatState.THINKING
          ? html`${ICON_BUSY} Thinking...`
          : this.chatState === ChatState.EXECUTING
            ? html`${ICON_BUSY} Executing...`
            : this.speechRecognitionError
              ? html`<span class="voice-error">${this.speechRecognitionError}</span>`
              : html``}
            </div>
            <div id="inputArea">
              <button
                id="voiceInputButton"
                title="${this.isListening ? 'Stop Voice Input' : 'Start Voice Input'}"
                @click=${this.toggleVoiceInput}
                class=${classMap({
                'mic-active': this.isListening,
                'disabled': !this.SpeechRecognitionAPI || (this.chatState !== ChatState.IDLE && !this.isListening)
              })}
                aria-label="Toggle Voice Input"
                aria-pressed=${this.isListening}
                ?disabled=${!this.SpeechRecognitionAPI || (this.chatState !== ChatState.IDLE && !this.isListening)}
                >
                ${this.isListening ? ICON_MICROPHONE_ACTIVE : ICON_MICROPHONE}
              </button>
              <input
                type="text"
                id="messageInput"
                .value=${this.inputMessage}
                @input=${this.handleInputMessage}
                @keydown=${(e: KeyboardEvent) => {
        this.inputKeyDownAction(e);
      }}
                placeholder="Type your message or use microphone..."
                autocomplete="off" />
              <button
                id="sendButton"
                class=${classMap({
        'disabled': this.chatState !== ChatState.IDLE,
      })}
                @click=${() => {
        this.sendMessageAction();
      }}
                aria-label="Send Message"
                title="Send Message">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="30px"
                  viewBox="0 -960 960 960"
                  width="30px"
                  fill="currentColor">
                  <path d="M120-160v-240l320-80-320-80v-240l760 320-760 320Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="main-container"> ${this.previewFrame} </div>
    </div>`;
  }
}
