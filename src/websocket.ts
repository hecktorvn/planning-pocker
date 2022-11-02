import { io } from "./http";
import { Room } from "./interfaces/room.interface";
import { UserRoom } from "./interfaces/userRoom.interface";

let users: UserRoom[] = [];
let rooms: Room[] = [];

io.on("connection", (socket) => {
  socket.on("select_room", (data, callback) => {
    socket.join(data.room);

    startRoom(data.room);
    const userInRoom = getUser(data);

    if (userInRoom) {
      userInRoom.socket_id = socket.id;

      const players = getUsers(data.room);
      socket.to(data.room).emit("connect_player", players);
      callback(players);
      return;
    }

    users.push({
      socket_id: socket.id,
      username: data.username,
      room: data.room,
      vote: 0,
    });

    const players = getUsers(data.room);
    socket.to(data.room).emit("connect_player", players);
    callback(players);
  });

  socket.on("select_point", (data, callback) => {
    const actualUser = getUser(data);

    if (actualUser) {
      actualUser.vote = data.vote;

      socket.to(data.room).emit("player_vote", getUsers(data.room));
    }

    callback(getUsers(data.room));
  });

  socket.on("show_cards", ({ room, showCard }, callback) => {
    if ((room = rooms.find(({ id }) => id === room))) {
      room.show = showCard;
    }

    const players = getUsers(room.id);

    socket.to(room.id).emit("show_cards", players);
    callback(players);
  });

  socket.on("reset", ({ room }, callback) => {
    if ((room = rooms.find(({ id }) => id === room))) {
      room.show = false;
    }

    users = users.map((user) => ({ ...user, vote: 0 }));

    const players = getUsers(room.id);
    socket.to(room.id).emit("player_vote", players);
    callback(players);
  });

  socket.on("disconnect", () => {
    const user = users.find(({ socket_id }) => socket_id == socket.id);

    if (user) {
      users = users.filter(({ socket_id }) => socket_id != socket.id);

      if (!destroyRoom(user.room)) {
        socket.to(user.room).emit("connect_player", getUsers(user.room));
      }
    }
  });
});

function getUsers(room: string) {
  const players = users.filter((user) => user.room === room);
  const show = rooms.find(({ id }) => id === room)?.show ?? false;

  return { players, show };
}

function getUser(data: UserRoom): UserRoom | undefined {
  return users.find(
    (user) => user.room === data.room && user.username === data.username
  );
}

function startRoom(roomId: string): void {
  const room = rooms.find((room) => room.id === roomId);

  if (!room) {
    rooms.push({
      id: roomId,
      show: false,
    });
  }
}

function destroyRoom(roomId: string): boolean {
  if (!users.filter(({ room }) => room === roomId).length) {
    rooms = rooms.filter(({ id }) => id !== roomId);
    return true;
  }

  return false;
}
