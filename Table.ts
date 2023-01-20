import {Player, Table} from './interface';
import {PromotionType, Color, Squares, StoneType} from './types';
import {Chess} from 'chess.ts';
import {socketManager} from './socketManager';
class ChessTable implements Table {
  Id: string;
  NumberPlayer: number;
  IsActive: boolean;
  Isfinish: boolean;
  IsFull: boolean;
  Captured: {[key in Color]: {[key in StoneType]: {amount: number}}};
  Turn: Color;
  InCheck: boolean;
  inCheckmate: boolean;
  gameOver: boolean;
  Players: Player[] = [];
  Board: Array<Squares> = [];
  Timer: null | ReturnType<typeof setTimeout> = null;
  Winner: Player | undefined;
  chessLibary: any;
  constructor(Id: string) {
    this.Id = Id;
    this.NumberPlayer = 1;
    this.IsActive = false;
    this.Isfinish = false;
    this.IsFull = false;
    this.inCheckmate = false;
    this.InCheck = false;
    this.gameOver = false;
    this.Turn = 'w';
    this.Captured = {
      w: {
        b: {amount: 0},
        k: {amount: 0},
        n: {amount: 0},
        p: {amount: 0},
        q: {amount: 0},
        r: {amount: 0},
      },
      b: {
        b: {amount: 0},
        k: {amount: 0},
        n: {amount: 0},
        p: {amount: 0},
        q: {amount: 0},
        r: {amount: 0},
      },
    };
  }
  FinishGame() {
    this.Isfinish = true;
    this.gameOver = true;
  }
  DecideWinner() {
    if (this.Winner !== undefined) {
      return {winner: this.Winner};
    }

    if (this.chessLibary.inCheckmate() && this.Players.length == 2) {
      if (this.chessLibary.turn() == this.Players[0].color) {
        this.Winner = this.Players[1];
      } else {
        this.Winner = this.Players[0];
      }
      this.FinishGame;
    }
    if (this.chessLibary.inDraw()) {
      //considering first palyer as winner in case of draw
      this.Winner = this.Players[0];
      this.FinishGame;
    }

    return {winner: this.Winner};
  }

  Checkgame() {
    if (this.chessLibary.inCheck()) {
      this.InCheck = true;
    }
    if (this.chessLibary.inCheckmate()) {
      this.inCheckmate = true;
    }

    if (this.chessLibary.gameOver()) {
      this.gameOver = true;
    }
    return {
      gameOver: this.gameOver,
      inCheckmate: this.inCheckmate,
      InCheck: this.InCheck,
    };
  }
  MoveStone(from: Squares, to: Squares, promotions: PromotionType) {
    const ResultsOfMove: any = this.chessLibary.move({
      from: from,
      to: to,
      promotion: promotions,
    });

    if (ResultsOfMove != null) {
      if (ResultsOfMove.captured != undefined) {
        const CapturedType = ResultsOfMove.captured as StoneType;
        if (ResultsOfMove.color == 'b') {
          this.Captured['w'][CapturedType].amount += 1;
        } else {
          this.Captured['b'][CapturedType].amount += 1;
        }
      }
    }
    this.StartTimer('move');
    this.SendGameStatus(
      {
        from: from,
        to: to,
        place: 'MoveStone',
        promotion: promotions,
      },
      'move',
    );
  }
  SendGameStatus(extra: any, place: string) {
    console.log(place);
    socketManager.getInstance().emit(place, {
      ...{
        board: this.chessLibary.board(),
        fen: this.chessLibary.fen(),
        turn: this.chessLibary.turn(),
        Captured: this.Captured,
        Players: this.Players,
        TableId: this.Id,
        IsActive: this.IsActive,
        Isfinish: this.Isfinish,
      },
      ...this.Checkgame(),
      ...this.DecideWinner(),
      ...extra,
    });
  }
  CreateTable(player: Player): Table {
    this.chessLibary = new Chess();
    this.Board = this.chessLibary.board();
    this.Players.push(player);
    this.SendGameStatus({}, 'joinPlayer');
    return this;
  }
  joinPlayer(player: Player): void {
    this.Players.push(player);
    this.SendGameStatus({}, 'joinPlayer');
    this.startGame();
  }
  KickPlayer() {
    const Splided = this.Players.splice(
      this.Players.findIndex(p => p.color === this.chessLibary.turn()),
      1,
    );
    this.Turn = this.Players[0].color!;
    this.Winner = this.Players[0];
    this.FinishGame();
    this.SendGameStatus({}, 'GameOver');
  }
  startGame() {
    this.IsActive = true;
    this.StartTimer('start');
    setTimeout(() => {
      this.SendGameStatus({}, 'startGame');
    }, 1000);
  }
  StartTimer(place: string) {
    let Timing: number = parseInt(
      process.env.WaitingTime !== undefined ? process.env.WaitingTime : '13000',
    );
    if (this.Timer !== null) {
      clearInterval(this.Timer);
    }
    this.Timer = setTimeout(
      () => {
        this.KickPlayer();
      },
      place === 'start' ? Timing + 1000 : Timing,
    );
  }
}
export {ChessTable};
