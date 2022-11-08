const urlSearch = new URLSearchParams(window.location.search);

const uuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0;
    var v = c == "x" ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
};

class User {
  vote = 0;

  room = null;

  username = null;

  storage = null;

  constructor(callback = () => {}) {
    this.storage = window.sessionStorage;

    this.username = this.storage.getItem("username");

    this.room = urlSearch.get("room");

    callback(this.username);
  }

  login(username) {
    this.storage.setItem("username", username);

    this.username = username;
  }

  logout() {
    this.storage.removeItem("username");

    this.username = null;

    window.location.pathname = "index.html";
  }
}
