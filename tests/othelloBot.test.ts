import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseOthelloBotMove } from '../src/features/games/othello/othelloBot';
import { createInitialBoard, getValidMoves } from '../src/features/games/othello/othelloLogic';

test('Othello bot returns a legal move for all difficulties', () => {
  const board = createInitialBoard();
  const validMoves = getValidMoves(board, 'black');
  const validKeys = new Set(validMoves.map((m) => `${m.row},${m.col}`));

  for (const diff of ['easy', 'medium', 'hard'] as const) {
    const move = chooseOthelloBotMove(board, 'black', diff);
    assert.ok(move, `Expected a move for difficulty=${diff}`);
    assert.ok(validKeys.has(`${move.row},${move.col}`));
  }
});
