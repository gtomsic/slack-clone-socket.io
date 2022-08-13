// If we didn't use express we need http
const express = require("express");
const cors = require("cors");
const app = express();
// We use socket.io instead of ws
const socketio = require("socket.io");

let namespaces = require("./data/namespaces");

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname + "/public"));

const server = app.listen(8000);

const io = socketio(server);

io.on("connection", (socket, req) => {
  // build and an array to send back with the img and endpoint for each NS
  let nsData = namespaces.map((ns) => {
    return {
      img: ns.img,
      endpoint: ns.endpoint,
    };
  });
  // Send the nsData back to the client
  // Using the socket to specify the client connetion where it connected
  socket.emit("nsList", nsData);
});

// Loop to each namespaces and listen for the a connection
namespaces.forEach((namespace) => {
  // console.log(namespace)
  io.of(namespace.endpoint).on("connection", (nsSocket) => {
    // console.log(`${nsSocket.id} has join ${namespace.endpoint}`);
    // When socket client is connected to one namespaces
    nsSocket.emit("nsRoomLoad", namespace.rooms);
    nsSocket.on("joinRoom", (roomToJoin, numOfUsersCallBack) => {
      // before joining the room we need to leave first
      const roomToLeave = Object.keys(nsSocket.rooms)[1];
      nsSocket.leave(roomToLeave);
      updateUsersInRoom(namespace, roomToLeave);
      nsSocket.join(roomToJoin);
      //   io.of("/wiki")
      //     .in(roomToJoin)
      //     .clients((error, client) => {
      //       numOfUsersCallBack(client.length);
      //     });
      const nsRoom = namespace.rooms.find(
        (room) => room.roomTitle === roomToJoin
      );
      nsSocket.emit("historyCatchUp", nsRoom.history);
      updateUsersInRoom(namespace, roomToJoin);
    });
    nsSocket.on("newMessageToServer", (msg) => {
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username: "gtomsic",
        avatar: "https://via.placeholder.com/30",
      };
      //   console.log(fullMsg);
      // Send this message to all clients that connected to this sockets
      // How do we know what room that this socket is in it
      // console.log(nsSocket.rooms);
      // The user will be in the 2nd room in the object list
      // This is beacuse the socket Always joins its own room on connection
      const roomTitle = Object.keys(nsSocket.rooms)[1];
      //   We need to find the room object for the room
      const nsRoom = namespace.rooms.find(
        (room) => room.roomTitle === roomTitle
      );
      nsRoom.addMessage(fullMsg);

      io.of(namespace.endpoint).to(roomTitle).emit("messageToClients", fullMsg);
    });
  });
});

function updateUsersInRoom(namespace, roomToJoin) {
  // Update the number of users to all when someone join the room
  io.of(namespace.endpoint)
    .in(roomToJoin)
    .clients((error, clients) => {
      io.of(namespace.endpoint)
        .in(roomToJoin)
        .emit("updateMembers", clients.length);
    });
}
