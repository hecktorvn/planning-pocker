export interface UserRoom {
  socket_id?: string;
  username: string;
  room: string;
  vote: string | number;
}
