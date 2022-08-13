function joinNs(endpoint) {
  if (nsSocket) {
    // Checking if nsSocket is actually a socket
    nsSocket.close();
    // Remove the event listener before its added again
    document
      .querySelector("#user-input")
      .removeEventListener("submit", formSubmission);
  }
  nsSocket = io(`http://localhost:8000${endpoint}`);
  nsSocket.on("nsRoomLoad", (nsRooms) => {
    // console.log(nsRooms)
    let roomList = document.querySelector(".room-list");
    roomList.innerHTML = "";
    nsRooms.forEach((room) => {
      roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${
        room.privateRoom ? "lock" : "globe"
      }"></span>${room.roomTitle}</li>`;
    });
    // adding click click listener to each room
    let roomNodes = document.getElementsByClassName("room");
    Array.from(roomNodes).forEach((elem) => {
      elem.addEventListener("click", (e) => {
        // console.log(`${e.target.innerText}`);
        joinRoom(e.target.innerText);
      });
    });
    // Automatically joine the top room
    const topRoom = document.querySelector(".room");
    const topRoomName = topRoom.innerText;
    joinRoom(topRoomName);
  });

  nsSocket.on("messageToClients", (msg) => {
    console.log(msg);
    const newMsg = buildHtmlMessage(msg);
    const ul = document.querySelector("#messages");
    ul.innerHTML += newMsg;
  });
  document
    .querySelector(".message-form")
    .addEventListener("submit", formSubmission);
}

function formSubmission(event) {
  event.preventDefault();
  const input = document.querySelector("#user-message");
  const newMessage = input.value;
  nsSocket.emit("newMessageToServer", { text: newMessage });
  input.value = "";
}

function buildHtmlMessage(msg) {
  const newDate = new Date(msg.time).toLocaleString();
  return `<li>
    <div class="user-image">
        <img src="${msg.avatar}" />
    </div>
    <div class="user-message">
        <div class="user-name-time">${msg.username} <span>${newDate}</span></div>
        <div class="message-text">${msg.text}</div>
    </div>
</li>`;
}
