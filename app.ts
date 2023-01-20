import * as dotenv from 'dotenv';
dotenv.config();
import { socketManager } from './socketManager';
import { Gamehander } from './GameHandler';
import { Player } from './interface';
const Game = new Gamehander();
socketManager.Initialize();
socketManager.getInstance().on('connection', (socket: any) => {
  socket.on('MovesStrone', (data: any) => {
    if (
      data.tableId !== undefined &&
      data.playerId !== undefined &&
      data.from !== undefined &&
      data.to !== undefined &&
      data.promotion !== undefined
    ) {
      Game.MovesStrone(data, socket);
    } else {
      socket.emit('error', { Message: 'invalid data' });
    }
  });

  socket.on('join', (data: Player) => {
    if (data.id !== undefined && data.Name !== undefined) {
      Game.SearchForTableAndJoin(data, socket);
    } else {
      socket.emit('error', { Message: 'invalid data' });
    }
  });
});
