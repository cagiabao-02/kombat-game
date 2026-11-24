import test from 'node:test';
import assert from 'node:assert/strict';
import { OthelloBoardState } from '../src/features/games/othello/types';
import {
  applyMove,
  countPieces,
  createInitialBoard,
  getFlippablePieces,
  getValidMoves,
  resolveNextTurn,
} from '../src/features/games/othello/othelloLogic';

test('createInitialBoard sets up 2 black and 2 white discs in center', () => {
  const board = createInitialBoard();
  const counts = countPieces(board);

  assert.equal(counts.black, 2);
  assert.equal(counts.white, 2);
  assert.equal(counts.empty, 60);
  assert.equal(board[3][3], 'white');
  assert.equal(board[3][4], 'black');
  assert.equal(board[4][3], 'black');
  assert.equal(board[4][4], 'white');
});

test('black has exactly 4 valid opening moves', () => {
  const board = createInitialBoard();
  const moves = getValidMoves(board, 'black');
  assert.equal(moves.length, 4);

  // (2,3) should flip (3,3)
  const flipped = getFlippablePieces(board, 2, 3, 'black');
  assert.deepEqual(flipped, [{ row: 3, col: 3 }]);
});

test('applyMove flips bracketed opponent discs and updates counts', () => {
  const board = createInitialBoard();
  const result = applyMove(board, 2, 3, 'black');
  assert.ok(result);
  assert.equal(result.flipped.length, 1);
  assert.equal(result.nextBoard[2][3], 'black');
  assert.equal(result.nextBoard[3][3], 'black');

  const next = resolveNextTurn(result.nextBoard, 'black');
  assert.equal(next.counts.black, 4);
  assert.equal(next.counts.white, 1);
  assert.equal(next.nextTurn, 'white');
  assert.equal(next.isGameOver, false);
});

test('resolveNextTurn detects game over when neither player has valid moves', () => {
  const board: OthelloBoardState = createInitialBoard().map((row) =>
    row.map(() => 'black')
  );
  board[0][0] = 'white';

  const next = resolveNextTurn(board, 'black');
  assert.equal(next.isGameOver, true);
  assert.equal(next.winner, 'black');
  assert.equal(next.counts.black, 63);
  assert.equal(next.counts.white, 1);
});
