import {Player, Table} from './interface';
import {PromotionType, Squares} from './types';
import {ChessTable} from './Table';
import {makeid} from './utils';
import {TablePlayer} from './Player';
interface GameHandlerInterface {
  Table: Array<Table>;
  MovesStrone: (
    move: {
      tableId: string;
      playerId: string;
      from: Squares;
      to: Squares;
      promotion: PromotionType;
    },
    socket: any,
  ) => void;
  SearchForTableAndJoin: (player: Player, socket: any) => void;
}
class Gamehander implements GameHandlerInterface {
  Table: Array<Table> = [];
  MovesStrone(
    move: {
      tableId: string;
      playerId: string;
      from: Squares;
      to: Squares;
      promotion: PromotionType;
    },
    socket: any,
  ) {
    const table = this.Table.find(table => table.Id === move.tableId);
    if (table) {
      if (
        table.Players.findIndex(player => player.id === move.playerId) !== -1
      ) {
        table.MoveStone(move.from, move.to, move.promotion);
      } else {
        socket.emit('error', {Message: 'Not your turn'});
      }
    } else {
      socket.emit('error', {Message: 'Not your turn'});
    }
  }
  SearchForTableAndJoin(player: Player, socket: any) {
    const table = this.Table.find(table => !table.IsActive);
    if (table) {
      if (table.Players.findIndex(player => player.id === player.id) !== -1) {
        let Player = new TablePlayer(player.Name, 'b', player.id);
        table.joinPlayer(Player);
      } else {
        table.SendGameStatus({}, 'joinPlayer');
      }
      socket.join(table.Id);
    } else {
      const CreatTable = new ChessTable(makeid(5));
      socket.join(CreatTable.Id);

      let Player = new TablePlayer(player.Name, 'w', player.id);
      this.Table.push(CreatTable.CreateTable(Player));
    }
  }
}
export {Gamehander};
