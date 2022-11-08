const form = document.querySelector("form");
const user = new User((username) => (form.username.value = username));
const room = form.room;

if (!urlSearch.has("room")) {
  room.value = uuid();
} else {
  room.value = urlSearch.get("room");
}

if (urlSearch.has("room")) {
  document.getElementById("newgame").innerHTML = "Join a Pocker";
}

form.onsubmit = () => {
  if (form.username.value.length > 0) {
    user.login(form.username.value);
  }
};
