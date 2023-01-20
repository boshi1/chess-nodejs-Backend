import {Server} from 'socket.io';
let io: any;
const socketManager = {
  //Initialize the socket server
  Initialize: () => {
    io = new Server({
      cors: {
        origin: process.env.host,
        methods: ['GET', 'POST'],
      },
    });
    io.listen(3002);
  },

  getInstance: (): any => {
    return io;
  },
};

export {socketManager};
