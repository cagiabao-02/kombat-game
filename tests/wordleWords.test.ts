import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateGuess,
  getDailyWord,
  getKeyboardStatuses,
  WORDLE_WORDS,
} from '../src/features/games/wordle/wordleWords';

test('WORDLE_WORDS contains only 5-letter uppercase words', () => {
  assert.ok(WORDLE_WORDS.length >= 150);
  for (const word of WORDLE_WORDS) {
    assert.match(word, /^[A-Z]{5}$/);
  }
});

test('getDailyWord is deterministic for the same date', () => {
  const a = getDailyWord('2026-11-24');
  const b = getDailyWord('2026-11-24');
  assert.equal(a, b);
});

test('evaluateGuess handles duplicate letters accurately (2-pass Wordle rule)', () => {
  // Target: APPLE (one P at index 1, one P at index 2; Wait: A P P L E)
  // Guess:  PAPER -> P(0) present, A(1) present, P(2) correct, E(3) present, R(4) absent
  assert.deepEqual(evaluateGuess('PAPER', 'APPLE'), [
    'present',
    'present',
    'correct',
    'present',
    'absent',
  ]);

  // Target: BRAIN (one A at index 2)
  // Guess:  ALLOY -> A(0) present; Guess: ARRAY -> A(0) present, R(1) correct, R(2) absent, A(3) absent, Y(4) absent
  assert.deepEqual(evaluateGuess('ARRAY', 'BRAIN'), [
    'present',
    'correct',
    'absent',
    'absent',
    'absent',
  ]);
});

test('getKeyboardStatuses keeps highest priority status per letter', () => {
  const map = getKeyboardStatuses(['CRANE', 'APPLE'], 'APPLE');
  assert.equal(map.A, 'correct');
  assert.equal(map.P, 'correct');
  assert.equal(map.C, 'absent');
});
