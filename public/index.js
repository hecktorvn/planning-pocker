function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const urlSearch = new URLSearchParams(window.location.search);
const form = document.getElementById("newgame");
const room = document.getElementById("room");

if (!urlSearch.has("room")) {
  room.value = uuid();
} else {
  room.value = urlSearch.get("room");
}

if (urlSearch.has("shared")) {
  document.getElementById("newgameButton").innerHTML = "Join a Pocker";
}
