// Game state storage management
const STORAGE_KEY = 'hackingGameState';

export interface GameState {
  // Add your game state interface properties here
  // This will need to be updated based on your actual game state structure
  [key: string]: any;
}

export function saveGameState(gameState: GameState): void {
  try {
    const serializedState = JSON.stringify(gameState, (key, value) => {
      // Handle Date objects by converting them to ISO strings
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      return value;
    });
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

export function loadGameState(): GameState | null {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) {
      return null;
    }
    
    const gameState = JSON.parse(serializedState, (key, value) => {
      // Re-hydrate Date objects from ISO strings
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });
    
    return gameState;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

export function resetGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset game state:', error);
  }
}

export function hasExistingGameState(): boolean {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    return serializedState !== null && serializedState.trim() !== '';
  } catch (error) {
    console.error('Failed to check for existing game state:', error);
    return false;
  }
}