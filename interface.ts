import { Color, PromotionType, Squares } from './types';

interface Player {
  Name: string;
  id: string;
  color?: Color;
}
interface TableHandler {
  findTable: (PlayerId: string) => Table;
  JoinTable: (table: Table, player: Player) => Table;
  LeaveTable: (table: Table, player: Player) => Table;
  Tables: Table[];
  RemoveFinishedTable: () => void;
}

interface Table {
  Id: string;
  NumberPlayer: number;
  CreateTable: (player: Player) => Table;
  joinPlayer: (player: Player) => void;
  IsActive: boolean;
  Isfinish: boolean;
  IsFull: boolean;
  Turn: Color;
  Board: Array<Squares>;
  MoveStone: (from: Squares, to: Squares, promotion: PromotionType) => void;
  Players: Player[];
  Timer: null | ReturnType<typeof setTimeout>;
  chessLibary: any;
  SendGameStatus(extra: any, place: string): void;
  Winner: Player | undefined;
}

export { Player, TableHandler, Table };
