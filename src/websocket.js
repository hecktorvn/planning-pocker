"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("./http");
var users = [];
var rooms = [];
http_1.io.on("connection", function (socket) {
    socket.on("select_room", function (data, callback) {
        socket.join(data.room);
        startRoom(data.room);
        var userInRoom = getUser(data);
        if (userInRoom) {
            userInRoom.socket_id = socket.id;
            var players_1 = getUsers(data.room);
            socket.to(data.room).emit("connect_player", players_1);
            callback(players_1);
            return;
        }
        users.push({
            socket_id: socket.id,
            username: data.username,
            room: data.room,
            vote: 0,
        });
        var players = getUsers(data.room);
        socket.to(data.room).emit("connect_player", players);
        callback(players);
    });
    socket.on("select_point", function (data, callback) {
        var actualUser = getUser(data);
        if (actualUser) {
            actualUser.vote = data.vote;
            socket.to(data.room).emit("player_vote", getUsers(data.room));
        }
        callback(getUsers(data.room));
    });
    socket.on("show_cards", function (_a, callback) {
        var room = _a.room, showCard = _a.showCard;
        if ((room = rooms.find(function (_a) {
            var id = _a.id;
            return id === room;
        }))) {
            room.show = showCard;
        }
        var players = getUsers(room.id);
        socket.to(room.id).emit("show_cards", players);
        callback(players);
    });
    socket.on("reset", function (_a, callback) {
        var room = _a.room;
        if ((room = rooms.find(function (_a) {
            var id = _a.id;
            return id === room;
        }))) {
            room.show = false;
        }
        users = users.map(function (user) { return (__assign(__assign({}, user), { vote: 0 })); });
        var players = getUsers(room.id);
        socket.to(room.id).emit("player_vote", players);
        callback(players);
    });
    socket.on("disconnect", function () {
        var user = users.find(function (_a) {
            var socket_id = _a.socket_id;
            return socket_id == socket.id;
        });
        if (user) {
            users = users.filter(function (_a) {
                var socket_id = _a.socket_id;
                return socket_id != socket.id;
            });
            if (!destroyRoom(user.room)) {
                socket.to(user.room).emit("connect_player", getUsers(user.room));
            }
        }
    });
});
function getUsers(room) {
    var _a, _b;
    var players = users.filter(function (user) { return user.room === room; });
    var show = (_b = (_a = rooms.find(function (_a) {
        var id = _a.id;
        return id === room;
    })) === null || _a === void 0 ? void 0 : _a.show) !== null && _b !== void 0 ? _b : false;
    console.log(room, show, players, "\n");
    return { players: players, show: show };
}
function getUser(data) {
    return users.find(function (user) { return user.room === data.room && user.username === data.username; });
}
function startRoom(roomId) {
    var room = rooms.find(function (room) { return room.id === roomId; });
    if (!room) {
        rooms.push({
            id: roomId,
            show: false,
        });
    }
}
function destroyRoom(roomId) {
    if (!users.filter(function (_a) {
        var room = _a.room;
        return room === roomId;
    }).length) {
        rooms = rooms.filter(function (_a) {
            var id = _a.id;
            return id !== roomId;
        });
        return true;
    }
    return false;
}
