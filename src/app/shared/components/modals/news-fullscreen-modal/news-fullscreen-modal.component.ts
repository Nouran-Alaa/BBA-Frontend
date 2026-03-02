import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsArticle } from '../../../../core/models/news-widget.model';

type NewsTab = 'article' | 'storytelling' | 'screenreader';
type ReaderState = 'idle' | 'playing' | 'paused';

export interface SentenceChunk {
  text: string;
  index: number;
}

@Component({
  selector: 'app-news-fullscreen-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news-fullscreen-modal.component.html',
  styleUrls: ['./news-fullscreen-modal.component.css'],
})
export class NewsFullscreenModalComponent implements OnDestroy {
  @Input() article!: NewsArticle;
  @Output() close = new EventEmitter<void>();

  activeTab: NewsTab = 'article';

  tabs: { key: NewsTab; label: string; icon: string }[] = [
    {
      key: 'article',
      label: 'Article',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      key: 'storytelling',
      label: 'Storytelling',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    },
    {
      key: 'screenreader',
      label: 'Screen Reader',
      icon: 'M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 12M8.464 8.464a5 5 0 000 7.072M3 9v6m18-6v6',
    },
  ];

  // ── Screen Reader ────────────────────────────────────────────────────────
  readerState: ReaderState = 'idle';
  readerRate = 1.0;
  readerVoice: SpeechSynthesisVoice | null = null;
  availableVoices: SpeechSynthesisVoice[] = [];
  activeSentenceIndex = -1;
  sentences: SentenceChunk[] = [];

  readonly speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  private currentIndex = 0; // tracks which sentence is currently speaking

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {
    if (this.speechSupported) {
      const load = () => {
        const all = speechSynthesis.getVoices();
        if (!all.length) return;
        // Prefer English voices but fall back to all voices so we always get something
        const en = all.filter((v) => v.lang.startsWith('en'));
        this.availableVoices = en.length ? en : all;
        // Always pick a default voice — never leave readerVoice null
        if (!this.readerVoice) {
          this.readerVoice = this.availableVoices.find((v) => v.default) ?? this.availableVoices[0];
        }
        this.cdr.markForCheck();
      };
      // Voices may already be loaded (Firefox) or need the event (Chrome)
      load();
      speechSynthesis.onvoiceschanged = load;
    }
  }

  switchTab(key: NewsTab): void {
    if (key !== 'screenreader') this.stopReader();
    this.activeTab = key;
    if (key === 'screenreader') this.buildSentences();
  }

  ngOnDestroy(): void {
    this.stopReader();
  }

  onClose(): void {
    this.stopReader();
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onClose();
  }

  buildSentences(): void {
    const raw = (this.article.fullContent || this.article.summary || '').replace(/\n\n+/g, ' ');
    // Split on sentence boundaries; keep Arabic/RTL punctuation too
    const parts = raw
      .split(/(?<=[.!?؟])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
    this.sentences = parts.map((text, index) => ({ text, index }));
    this.activeSentenceIndex = -1;
    this.currentIndex = 0;
  }

  // ── Getters ──────────────────────────────────────────────────────────────
  get isPlaying(): boolean {
    return this.readerState === 'playing';
  }
  get isPaused(): boolean {
    return this.readerState === 'paused';
  }
  get isIdle(): boolean {
    return this.readerState === 'idle';
  }

  get progressPercent(): number {
    if (!this.sentences.length) return 0;
    const idx = this.activeSentenceIndex < 0 ? 0 : this.activeSentenceIndex + 1;
    return Math.round((idx / this.sentences.length) * 100);
  }

  // ── Sequential chain — speak one sentence, onend fires the next ──────────
  private speakOne(index: number): void {
    if (index >= this.sentences.length) {
      this.ngZone.run(() => {
        this.activeSentenceIndex = -1;
        this.readerState = 'idle';
        this.currentIndex = 0;
        this.cdr.detectChanges();
      });
      return;
    }

    const utt = new SpeechSynthesisUtterance(this.sentences[index].text);
    utt.rate = this.readerRate;
    // Only set voice when we have one — never force a lang that contradicts the voice
    if (this.readerVoice) {
      utt.voice = this.readerVoice;
      utt.lang = this.readerVoice.lang;
    }

    utt.onstart = () =>
      this.ngZone.run(() => {
        this.activeSentenceIndex = index;
        this.currentIndex = index;
        this.readerState = 'playing';
        this.scrollToSentence(index);
        this.cdr.detectChanges();
      });

    // Chain: when this utterance ends, speak the next one (if still playing)
    utt.onend = () => {
      if (this.readerState === 'playing') this.speakOne(index + 1);
    };

    utt.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      this.ngZone.run(() => {
        this.readerState = 'idle';
        this.cdr.detectChanges();
      });
    };

    speechSynthesis.speak(utt);
  }

  // ── Public controls ───────────────────────────────────────────────────────
  startReader(fromIndex = 0): void {
    if (!this.speechSupported) return;
    // Chrome bug: cancel() is async — speaking immediately after is silently dropped.
    // A brief timeout lets the engine flush before we queue the new utterance.
    speechSynthesis.cancel();
    this.readerState = 'playing';
    setTimeout(() => {
      if (this.readerState === 'playing') this.speakOne(fromIndex);
    }, 120);
  }

  pauseReader(): void {
    if (!this.speechSupported || !this.isPlaying) return;
    speechSynthesis.pause();
    this.readerState = 'paused';
  }

  resumeReader(): void {
    if (!this.speechSupported || !this.isPaused) return;
    speechSynthesis.resume();
    this.readerState = 'playing';
  }

  stopReader(): void {
    if (!this.speechSupported) return;
    speechSynthesis.cancel();
    this.readerState = 'idle';
    this.activeSentenceIndex = -1;
    this.currentIndex = 0;
  }

  readFromSentence(index: number): void {
    this.startReader(index);
  }

  onRateChange(event: Event): void {
    this.readerRate = parseFloat((event.target as HTMLInputElement).value);
    if (this.isPlaying) this.startReader(this.currentIndex);
  }

  onVoiceChange(event: Event): void {
    const name = (event.target as HTMLSelectElement).value;
    this.readerVoice = this.availableVoices.find((v) => v.name === name) ?? null;
    if (this.isPlaying) this.startReader(this.currentIndex);
  }

  private scrollToSentence(index: number): void {
    setTimeout(() => {
      document
        .getElementById(`nfm-s-${index}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 30);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getTimeAgo(iso: string): string {
    const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (d < 60) return `${d}s ago`;
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
  }
  getSentimentColor(s?: string): string {
    return s === 'positive' ? '#10b981' : s === 'negative' ? '#ef4444' : '#94a3b8';
  }
  getSentimentLabel(s?: string): string {
    return s === 'positive' ? '▲ Positive' : s === 'negative' ? '▼ Negative' : '● Neutral';
  }
  formatEngagement(n?: number): string {
    if (!n) return '';
    return n >= 1000 ? `${(n / 1000).toFixed(1)}K engagements` : `${n} engagements`;
  }
  getReadingTime(): string {
    const w = ((this.article.fullContent || '') + this.article.summary).split(' ').length;
    return `${Math.max(1, Math.ceil(w / 200))} min read`;
  }
}
