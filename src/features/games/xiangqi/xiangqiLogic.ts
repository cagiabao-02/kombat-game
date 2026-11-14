export type Side = 'red' | 'black';

export type PieceType =
  | 'general'  // Tướng / Soái (帥 / 將)
  | 'advisor'  // Sĩ (仕 / 士)
  | 'elephant' // Tượng (相 / 象)
  | 'horse'    // Mã (傌 / 馬)
  | 'chariot'  // Xe (俥 / 車)
  | 'cannon'   // Pháo (炮 / 砲)
  | 'soldier'; // Tốt / Binh (兵 / 卒)

export interface Piece {
  type: PieceType;
  side: Side;
}

export interface Position {
  row: number; // 0 (hàng trên cùng - bên Đen) đến 9 (hàng dưới cùng - bên Đỏ)
  col: number; // 0 (cột trái) đến 8 (cột phải)
}

export interface Move {
  from: Position;
  to: Position;
  captured?: Piece | null;
}

export type Board = (Piece | null)[][];

export interface GameState {
  board: Board;
  turn: Side;
  moveHistory: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  winner: Side | null;
}

// Bàn cờ Cờ Tướng tiêu chuẩn: 10 hàng (0-9) x 9 cột (0-8)
export const ROWS = 10;
export const COLS = 9;

// Khởi tạo bàn cờ ban đầu chuẩn quốc tế
export function createInitialBoard(): Board {
  const board: Board = Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(null));

  // --- Quân ĐEN (Hàng 0, 2, 3) ---
  board[0][0] = { type: 'chariot', side: 'black' };
  board[0][1] = { type: 'horse', side: 'black' };
  board[0][2] = { type: 'elephant', side: 'black' };
  board[0][3] = { type: 'advisor', side: 'black' };
  board[0][4] = { type: 'general', side: 'black' };
  board[0][5] = { type: 'advisor', side: 'black' };
  board[0][6] = { type: 'elephant', side: 'black' };
  board[0][7] = { type: 'horse', side: 'black' };
  board[0][8] = { type: 'chariot', side: 'black' };

  board[2][1] = { type: 'cannon', side: 'black' };
  board[2][7] = { type: 'cannon', side: 'black' };

  board[3][0] = { type: 'soldier', side: 'black' };
  board[3][2] = { type: 'soldier', side: 'black' };
  board[3][4] = { type: 'soldier', side: 'black' };
  board[3][6] = { type: 'soldier', side: 'black' };
  board[3][8] = { type: 'soldier', side: 'black' };

  // --- Quân ĐỎ (Hàng 9, 7, 6) ---
  board[9][0] = { type: 'chariot', side: 'red' };
  board[9][1] = { type: 'horse', side: 'red' };
  board[9][2] = { type: 'elephant', side: 'red' };
  board[9][3] = { type: 'advisor', side: 'red' };
  board[9][4] = { type: 'general', side: 'red' };
  board[9][5] = { type: 'advisor', side: 'red' };
  board[9][6] = { type: 'elephant', side: 'red' };
  board[9][7] = { type: 'horse', side: 'red' };
  board[9][8] = { type: 'chariot', side: 'red' };

  board[7][1] = { type: 'cannon', side: 'red' };
  board[7][7] = { type: 'cannon', side: 'red' };

  board[6][0] = { type: 'soldier', side: 'red' };
  board[6][2] = { type: 'soldier', side: 'red' };
  board[6][4] = { type: 'soldier', side: 'red' };
  board[6][6] = { type: 'soldier', side: 'red' };
  board[6][8] = { type: 'soldier', side: 'red' };

  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function isInsideBoard(row: number, col: number): boolean {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}

// Kiểm tra vị trí có nằm trong Cung tướng (Palace) hay không
export function isInPalace(row: number, col: number, side: Side): boolean {
  if (col < 3 || col > 5) return false;
  if (side === 'black') {
    return row >= 0 && row <= 2;
  } else {
    return row >= 7 && row <= 9;
  }
}

// Kiểm tra xem quân cờ đã qua sông chưa
export function hasCrossedRiver(row: number, side: Side): boolean {
  if (side === 'red') {
    return row <= 4; // Đỏ đi lên, qua sông khi row <= 4
  } else {
    return row >= 5; // Đen đi xuống, qua sông khi row >= 5
  }
}

// Tìm vị trí của Tướng (General)
export function findGeneral(board: Board, side: Side): Position | null {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'general' && piece.side === side) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

// Kiểm tra luật Lộ mặt Tướng (Flying General): hai Tướng không được nhìn thẳng mặt nhau trên cùng một cột mà không có quân cản
export function areGeneralsFacing(board: Board): boolean {
  const redGen = findGeneral(board, 'red');
  const blackGen = findGeneral(board, 'black');
  if (!redGen || !blackGen) return false;

  // Nếu không cùng cột thì không đối mặt
  if (redGen.col !== blackGen.col) return false;

  const col = redGen.col;
  const startRow = Math.min(blackGen.row, redGen.row) + 1;
  const endRow = Math.max(blackGen.row, redGen.row);

  // Đếm số quân chắn giữa hai tướng
  for (let r = startRow; r < endRow; r++) {
    if (board[r][col] !== null) {
      return false; // Có ít nhất 1 quân cản
    }
  }

  return true; // Lộ mặt tướng!
}

// Sinh danh sách nước đi sơ bộ (Pseudo-legal moves) theo quy tắc di chuyển của từng loại quân
export function getPseudoLegalMoves(board: Board, from: Position): Position[] {
  const { row: r, col: c } = from;
  const piece = board[r][c];
  if (!piece) return [];

  const side = piece.side;
  const moves: Position[] = [];

  const addIfValid = (targetR: number, targetC: number) => {
    if (!isInsideBoard(targetR, targetC)) return;
    const dest = board[targetR][targetC];
    // Không thể ăn quân cùng màu
    if (!dest || dest.side !== side) {
      moves.push({ row: targetR, col: targetC });
    }
  };

  switch (piece.type) {
    case 'general': {
      // Tướng: đi ngang dọc 1 ô trong Cung
      const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (isInPalace(nr, nc, side)) {
          addIfValid(nr, nc);
        }
      }
      break;
    }

    case 'advisor': {
      // Sĩ: đi chéo 1 ô trong Cung
      const diagDirs = [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ];
      for (const [dr, dc] of diagDirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (isInPalace(nr, nc, side)) {
          addIfValid(nr, nc);
        }
      }
      break;
    }

    case 'elephant': {
      // Tượng: đi chéo 2 ô, KHÔNG qua sông, kiểm tra CẢN MẮT TƯỢNG
      const elephantMoves = [
        { dest: [-2, -2], eye: [-1, -1] },
        { dest: [-2, 2], eye: [-1, 1] },
        { dest: [2, -2], eye: [1, -1] },
        { dest: [2, 2], eye: [1, 1] },
      ];

      for (const em of elephantMoves) {
        const nr = r + em.dest[0];
        const nc = c + em.dest[1];
        const eyeR = r + em.eye[0];
        const eyeC = c + em.eye[1];

        // Không được qua sông
        if (side === 'red' && nr < 5) continue;
        if (side === 'black' && nr > 4) continue;

        if (isInsideBoard(nr, nc)) {
          // Mắt tượng phải trống (không có quân chắn)
          if (board[eyeR][eyeC] === null) {
            addIfValid(nr, nc);
          }
        }
      }
      break;
    }

    case 'horse': {
      // Mã: đi chữ nhật (1 thẳng 1 chéo), kiểm tra CẢN CHÂN MÃ
      const horseMoves = [
        // Đi lên 2 ô: chân mã ở [r - 1, c]
        { dest: [-2, -1], leg: [-1, 0] },
        { dest: [-2, 1], leg: [-1, 0] },
        // Đi xuống 2 ô: chân mã ở [r + 1, c]
        { dest: [2, -1], leg: [1, 0] },
        { dest: [2, 1], leg: [1, 0] },
        // Đi sang trái 2 ô: chân mã ở [r, c - 1]
        { dest: [-1, -2], leg: [0, -1] },
        { dest: [1, -2], leg: [0, -1] },
        // Đi sang phải 2 ô: chân mã ở [r, c + 1]
        { dest: [-1, 2], leg: [0, 1] },
        { dest: [1, 2], leg: [0, 1] },
      ];

      for (const hm of horseMoves) {
        const nr = r + hm.dest[0];
        const nc = c + hm.dest[1];
        const legR = r + hm.leg[0];
        const legC = c + hm.leg[1];

        if (isInsideBoard(nr, nc)) {
          // Chân mã phải không bị cản
          if (board[legR][legC] === null) {
            addIfValid(nr, nc);
          }
        }
      }
      break;
    }

    case 'chariot': {
      // Xe: đi ngang dọc không giới hạn cho đến khi gặp quân cản
      const straightDirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [dr, dc] of straightDirs) {
        let nr = r + dr;
        let nc = c + dc;
        while (isInsideBoard(nr, nc)) {
          const targetPiece = board[nr][nc];
          if (!targetPiece) {
            moves.push({ row: nr, col: nc });
          } else {
            if (targetPiece.side !== side) {
              moves.push({ row: nr, col: nc }); // Ăn quân địch
            }
            break; // Gặp quân cản thì dừng
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }

    case 'cannon': {
      // Pháo: đi như Xe khi không ăn; khi ăn bắt buộc nhảy qua đúng 1 quân làm ngòi
      const straightDirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [dr, dc] of straightDirs) {
        let nr = r + dr;
        let nc = c + dc;
        let jumped = false; // Đã nhảy qua ngòi chưa

        while (isInsideBoard(nr, nc)) {
          const targetPiece = board[nr][nc];
          if (!jumped) {
            if (!targetPiece) {
              // Nước đi thông thường (chưa có ngòi)
              moves.push({ row: nr, col: nc });
            } else {
              // Tìm thấy ngòi
              jumped = true;
            }
          } else {
            if (targetPiece) {
              // Đã có ngòi, nếu gặp quân địch thì có thể ăn
              if (targetPiece.side !== side) {
                moves.push({ row: nr, col: nc });
              }
              break; // Sau khi tìm thấy quân mục tiêu hoặc quân cùng màu thì dừng
            }
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }

    case 'soldier': {
      // Tốt / Binh:
      // Đỏ: đi lên (r - 1). Chưa qua sông chỉ đi thẳng. Qua sông (r <= 4) được đi thẳng hoặc ngang.
      // Đen: đi xuống (r + 1). Chưa qua sông chỉ đi thẳng. Qua sông (r >= 5) được đi thẳng hoặc ngang.
      const forwardDir = side === 'red' ? -1 : 1;
      const forwardRow = r + forwardDir;

      // Nước tiến thẳng
      if (isInsideBoard(forwardRow, c)) {
        addIfValid(forwardRow, c);
      }

      // Nước đi ngang (nếu đã qua sông)
      if (hasCrossedRiver(r, side)) {
        addIfValid(r, c - 1);
        addIfValid(r, c + 1);
      }
      break;
    }
  }

  return moves;
}

// Kiểm tra xem vị trí pos của phe `side` có đang bị phe đối phương đe dọa hay không
export function isSquareAttacked(board: Board, pos: Position, side: Side): boolean {
  const opponentSide: Side = side === 'red' ? 'black' : 'red';

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const piece = board[r][c];
      if (piece && piece.side === opponentSide) {
        const moves = getPseudoLegalMoves(board, { row: r, col: c });
        if (moves.some((m) => m.row === pos.row && m.col === pos.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Kiểm tra xem Tướng của phe `side` có đang bị chiếu hay không
export function isSideInCheck(board: Board, side: Side): boolean {
  const generalPos = findGeneral(board, side);
  if (!generalPos) return false;

  // 1. Kiểm tra đối mặt tướng
  if (areGeneralsFacing(board)) {
    return true;
  }

  // 2. Kiểm tra các quân đối phương có ăn được tướng không
  return isSquareAttacked(board, generalPos, side);
}

// Kiểm tra một nước đi có hoàn toàn hợp lệ (Legal) hay không (không để Tướng mình bị chiếu sau khi đi)
export function isMoveLegal(board: Board, from: Position, to: Position, side: Side): boolean {
  const piece = board[from.row][from.col];
  if (!piece || piece.side !== side) return false;

  const pseudoMoves = getPseudoLegalMoves(board, from);
  const isPseudoValid = pseudoMoves.some((m) => m.row === to.row && m.col === to.col);
  if (!isPseudoValid) return false;

  // Thực hiện nước đi thử trên bàn cờ ảo
  const testBoard = cloneBoard(board);
  testBoard[to.row][to.col] = testBoard[from.row][from.col];
  testBoard[from.row][from.col] = null;

  // Nếu sau nước đi mà Tướng mình bị chiếu hoặc Lộ mặt tướng -> Nước đi phạm quy!
  if (isSideInCheck(testBoard, side)) {
    return false;
  }

  return true;
}

// Lấy tất cả các nước đi hợp lệ tuyệt đối của một quân cờ tại vị trí `from`
export function getLegalMoves(board: Board, from: Position): Position[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const pseudoMoves = getPseudoLegalMoves(board, from);
  return pseudoMoves.filter((dest) => isMoveLegal(board, from, dest, piece.side));
}

// Lấy tất cả nước đi hợp lệ của toàn bộ phe `side`
export function getAllLegalMoves(board: Board, side: Side): Move[] {
  const allMoves: Move[] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const piece = board[r][c];
      if (piece && piece.side === side) {
        const from = { row: r, col: c };
        const dests = getLegalMoves(board, from);
        for (const to of dests) {
          allMoves.push({
            from,
            to,
            captured: board[to.row][to.col],
          });
        }
      }
    }
  }

  return allMoves;
}

// Thực hiện nước đi và trả về GameState mới
export function makeMove(currentState: GameState, from: Position, to: Position): GameState | null {
  const { board, turn, moveHistory } = currentState;
  const piece = board[from.row][from.col];

  if (!piece || piece.side !== turn) return null;
  if (!isMoveLegal(board, from, to, turn)) return null;

  const newBoard = cloneBoard(board);
  const captured = newBoard[to.row][to.col];
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;

  const nextTurn: Side = turn === 'red' ? 'black' : 'red';
  const newHistory = [...moveHistory, { from, to, captured }];

  // Kiểm tra trạng thái của bên tiếp theo
  const opponentInCheck = isSideInCheck(newBoard, nextTurn);
  const opponentLegalMoves = getAllLegalMoves(newBoard, nextTurn);

  let isCheckmate = false;
  let isStalemate = false;
  let winner: Side | null = null;

  if (opponentLegalMoves.length === 0) {
    if (opponentInCheck) {
      // Chiếu bí (Checkmate) -> bên vừa đi thắng
      isCheckmate = true;
      winner = turn;
    } else {
      // Hết nước đi (Stalemate) -> Trong luật Cờ Tướng, bên hết nước đi bị xử THUA!
      isStalemate = true;
      winner = turn;
    }
  }

  return {
    board: newBoard,
    turn: nextTurn,
    moveHistory: newHistory,
    isCheck: opponentInCheck,
    isCheckmate,
    isStalemate,
    winner,
  };
}

// Khởi tạo trạng thái ván cờ mới hoàn chỉnh
export function createNewGame(): GameState {
  return {
    board: createInitialBoard(),
    turn: 'red', // Đỏ đi trước theo luật cờ tướng
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    winner: null,
  };
}

// Thông tin hiển thị quân cờ (Ký tự Hán và tên tiếng Việt / English)
export interface PieceVisualInfo {
  hanzi: string;
  nameVi: string;
  nameEn: string;
}

export const PIECE_INFO: Record<PieceType, { red: PieceVisualInfo; black: PieceVisualInfo }> = {
  general: {
    red: { hanzi: '帥', nameVi: 'Tướng / Soái', nameEn: 'General' },
    black: { hanzi: '將', nameVi: 'Tướng', nameEn: 'General' },
  },
  advisor: {
    red: { hanzi: '仕', nameVi: 'Sĩ', nameEn: 'Advisor' },
    black: { hanzi: '士', nameVi: 'Sĩ', nameEn: 'Advisor' },
  },
  elephant: {
    red: { hanzi: '相', nameVi: 'Tượng', nameEn: 'Elephant' },
    black: { hanzi: '象', nameVi: 'Tượng', nameEn: 'Elephant' },
  },
  horse: {
    red: { hanzi: '傌', nameVi: 'Mã', nameEn: 'Horse' },
    black: { hanzi: '馬', nameVi: 'Mã', nameEn: 'Horse' },
  },
  chariot: {
    red: { hanzi: '俥', nameVi: 'Xe', nameEn: 'Chariot' },
    black: { hanzi: '車', nameVi: 'Xe', nameEn: 'Chariot' },
  },
  cannon: {
    red: { hanzi: '炮', nameVi: 'Pháo', nameEn: 'Cannon' },
    black: { hanzi: '砲', nameVi: 'Pháo', nameEn: 'Cannon' },
  },
  soldier: {
    red: { hanzi: '兵', nameVi: 'Binh / Tốt', nameEn: 'Soldier' },
    black: { hanzi: '卒', nameVi: 'Tốt', nameEn: 'Soldier' },
  },
};

