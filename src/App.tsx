import { create } from "zustand";

type GameState = {
  history: Array<Array<string | null>>;
  currentMove: number;
};

type GameActions = {
  setHistory: (
    nextHistory:
      | Array<Array<string | null>>
      | ((squares: Array<Array<string | null>>) => Array<Array<string | null>>)
  ) => void;
  setCurrentMove: (
    nextCurrentMove: number | ((currentMove: number) => number)
  ) => void;
};

const useGameStore = create<GameState & GameActions>((set) => ({
  history: [Array(9).fill(null)],
  currentMove: 0,
  setHistory: (nextHistory) => {
    set((state) => ({
      history:
        typeof nextHistory === "function"
          ? nextHistory(state.history)
          : nextHistory,
    }));
  },
  setCurrentMove: (nextCurrentMove) => {
    set((state) => ({
      currentMove:
        typeof nextCurrentMove === "function"
          ? nextCurrentMove(state.currentMove)
          : nextCurrentMove,
    }));
  },
}));

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

function calculateWinner(squares: Array<string | null>) {
  for (const [a, b, c] of WINNING_LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function calculateTurns(squares: Array<string | null>) {
  return squares.filter((square) => square !== null).length;
}

function calculateStatus(winner: string | null, turns: number, player: string) {
  if (winner) return `Winner: ${winner}`;
  if (turns === 9) return "Draw";
  return `Next player: ${player}`;
}

type SquareProps = {
  value: string | null;
  onSquareClick: () => void;
};

function Square({ value, onSquareClick }: SquareProps) {
  return (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        backgroundColor: "#fff",
        border: "1px solid #999",
        outline: 0,
        borderRadius: 0,
        fontSize: "1rem",
        fontWeight: "bold",
      }}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

type BoardProps = {
  xIsNext: boolean;
  squares: Array<string | null>;
  onPlay: (nextSquares: Array<string | null>) => void;
};

function Board({ xIsNext, squares, onPlay }: BoardProps) {
  const winner = calculateWinner(squares);
  const turns = calculateTurns(squares);
  const player = xIsNext ? "X" : "O";
  const status = calculateStatus(winner, turns, player);

  function handleClick(i: number) {
    if (squares[i] || winner) return;
    const nextSquares = squares.slice();
    nextSquares[i] = player;
    onPlay(nextSquares);
  }

  return (
    <div>
      <div style={{ marginBottom: "0.5rem" }}>{status}</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
          width: "calc(3 * 2.5rem)",
          height: "calc(3 * 2.5rem)",
          border: "1px solid #999",
        }}
      >
        {squares.map((square, index) => (
          <Square
            key={index}
            value={square}
            onSquareClick={() => handleClick(index)}
          />
        ))}
      </div>
    </div>
  );
}

function Game() {
  const history = useGameStore((state) => state.history);
  const setHistory = useGameStore((state) => state.setHistory);
  const currentMove = useGameStore((state) => state.currentMove);
  const setCurrentMove = useGameStore((state) => state.setCurrentMove);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: Array<string | null>) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "row", fontFamily: "monospace" }}
    >
      <div>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div style={{ marginLeft: "1rem" }}>
        <ol>
          {history.map((_, index) => (
            <li key={index}>
              <button onClick={() => jumpTo(index)}>
                {index > 0 ? `Go to move #${index}` : "Go to game start"}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function App() {
  return <Game />;
}

export default App;
