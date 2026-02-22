import { Injectable } from '@angular/core';
import { GridItem } from '../../shared/components/dashboard-grid/dashboard-grid.component';

export interface UndoState {
  items: GridItem[];
  timestamp: number;
  action: string; // Description like "Moved widget", "Deleted widget"
}

@Injectable({
  providedIn: 'root',
})
export class UndoRedoService {
  private undoStack: UndoState[] = [];
  private redoStack: UndoState[] = [];
  private maxHistorySize = 20; // Configurable limit

  constructor() {
    // Load from localStorage if needed
    this.loadFromStorage();
  }

  /**
   * Save current state to undo stack
   */
  saveState(items: GridItem[], action: string): void {
    // Deep clone to prevent reference issues
    const state: UndoState = {
      items: JSON.parse(JSON.stringify(items)),
      timestamp: Date.now(),
      action,
    };

    this.undoStack.push(state);

    // Limit stack size (FIFO - remove oldest)
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift(); // Remove oldest
    }

    // Clear redo stack when new action is performed
    this.redoStack = [];

    // Persist to localStorage
    this.saveToStorage();
  }

  /**
   * Undo last action
   */
  undo(): GridItem[] | null {
    if (!this.canUndo()) return null;

    const currentState = this.undoStack.pop()!;
    this.redoStack.push(currentState);

    // Return previous state (or empty if no more)
    const previousState = this.undoStack[this.undoStack.length - 1];

    this.saveToStorage();

    return previousState ? JSON.parse(JSON.stringify(previousState.items)) : [];
  }

  /**
   * Redo last undone action
   */
  redo(): GridItem[] | null {
    if (!this.canRedo()) return null;

    const state = this.redoStack.pop()!;
    this.undoStack.push(state);

    this.saveToStorage();

    return JSON.parse(JSON.stringify(state.items));
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 1; // Need at least 2 states (current + previous)
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Get last action description
   */
  getLastAction(): string | null {
    if (this.undoStack.length === 0) return null;
    return this.undoStack[this.undoStack.length - 1].action;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.clearStorage();
  }

  /**
   * Reset for new dashboard
   */
  reset(initialItems: GridItem[]): void {
    this.clear();
    this.saveState(initialItems, 'Initial state');
  }

  /**
   * Get history size info
   */
  getHistoryInfo() {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      maxSize: this.maxHistorySize,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
  }

  /**
   * Persist to localStorage (optional)
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('dashboard-undo-stack', JSON.stringify(this.undoStack.slice(-10))); // Save last 10
      localStorage.setItem('dashboard-redo-stack', JSON.stringify(this.redoStack.slice(-10)));
    } catch (error) {
      console.warn('Failed to save undo/redo state:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    try {
      const undoData = localStorage.getItem('dashboard-undo-stack');
      const redoData = localStorage.getItem('dashboard-redo-stack');

      if (undoData) this.undoStack = JSON.parse(undoData);
      if (redoData) this.redoStack = JSON.parse(redoData);
    } catch (error) {
      console.warn('Failed to load undo/redo state:', error);
    }
  }

  /**
   * Clear storage
   */
  private clearStorage(): void {
    localStorage.removeItem('dashboard-undo-stack');
    localStorage.removeItem('dashboard-redo-stack');
  }
}
