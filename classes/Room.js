class Room {
    constructor(roomId, roomTitle, namespance, privateRoom = false) {
        this.roomId = roomId;
        this.roomTitle = roomTitle;
        this.namespance = namespance;
        this.privateRoom = privateRoom;
        this.history = []
    }
    addMessage(message) {
        this.history.push(message)
    }
    clearHistory() {
        this.history = []
    }
}

module.exports = Room;