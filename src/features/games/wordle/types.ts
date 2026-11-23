export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export type WordleMode = 'daily' | 'endless';

export interface WordleGameState {
  mode: WordleMode;
  dailyDate: string; // YYYY-MM-DD
  targetWord: string;
  guesses: string[];
  currentGuess: string;
  status: 'playing' | 'won' | 'lost';
}
