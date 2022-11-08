const socket = io();
const points = "1,2,3,4,5,6,7,8,9,10";

let usersOnRoom = [];
let loggedUser = new User();
let showCards = false;
let average = 0;

const domPlayers = document.getElementById("players");
const room = loggedUser.room;

if (!loggedUser.username) {
  loggedUser.logout();
}

socket.emit("select_room", { ...loggedUser }, (data) => render(data));

socket.on("connect_player", (data) => render(data));
socket.on("player_vote", (data) => render(data));
socket.on("show_cards", (data) => render(data));

function render({ show, players }) {
  loggedUser.vote =
    players.find((player) => player.username === loggedUser.username).vote ?? 0;

  setShowCards(show);
  drawUsers(players);
  drawPoints();
}

function setShowCards(show = false) {
  showCards = show;
}

function drawUsers(users) {
  domPlayers.innerHTML = "";
  usersOnRoom = users;
  average = 0;

  disableButton(
    users.filter(({ vote }) => vote != 0).length <= 0 && !showCards
  );

  users.forEach((user) => {
    average += parseInt(user.vote);
    const color = user.vote != 0 && !showCards ? "bg-blue-500" : "bg-gray-300";

    domPlayers.innerHTML += `
        <div class="flex flex-col gap-3 items-center">
            <div class="p-2 rounded ${color} flex items-center justify-center font-bold card">
                ${
                  showCards
                    ? `<span class="text-xl">${user.vote ?? ""}</span>`
                    : ""
                }
            </div>

            <span class="text-xs text-ellipsis overflow-hidden whitespace-nowrap name">
                ${user.username}
            </span>
        </div>
    `;
  });

  if (showCards) {
    average = average / users.filter(({ vote }) => vote != 0).length;
    average = parseFloat(average).toFixed(2) * 1;
  } else {
    average = 0;
  }

  document.getElementById("average").innerText = average;
}

function disableButton(disable = true) {
  const button = document.getElementById("showCards");
  button.classList.remove("bg-gray-700", "hover:bg-gray-800");
  button.classList.remove("bg-blue-300", "hover:bg-blue-300");

  button.disabled = disable;
  button.innerText = disable ? "Waiting for a vote..." : "Show Cards";

  if (showCards) {
    button.innerText = "Restart voting";
    button.classList.add("bg-gray-700", "hover:bg-gray-800");

    return;
  }

  if (disable) {
    button.classList.add("bg-blue-300", "hover:bg-blue-300");
  }
}

function drawPoints() {
  const container = document.getElementById("points");
  container.innerHTML = "";

  points.split(",").forEach((point) => {
    const voted = loggedUser.vote != 0 && point == loggedUser.vote;
    const button = document.createElement("button");

    button.dataset.value = point;
    button.disabled = showCards;
    button.addEventListener("click", handlePoint);

    button.classList.value = `
      p-2 rounded bg-gray-100 flex items-center justify-center
      font-bold card point shadow select-none
    `;

    if (!voted && !showCards) {
      button.classList.add("hover:scale-125", "hover:-mt-8");
    }

    if (showCards) {
      button.classList.add("opacity-50", "blur-sm");
    }

    if (voted) {
      button.classList.add(
        "scale-125",
        "-mt-8",
        "bg-blue-500",
        "shadow-none",
        "text-white"
      );
    }

    button.innerText = point;
    container.appendChild(button);
  });
}

function handlePoint(event) {
  vote = event.target.dataset.value;

  if (vote) {
    socket.emit("select_point", { ...loggedUser, vote }, render);
  }
}

document.getElementById("showCards").addEventListener("click", () => {
  if (showCards) {
    socket.emit("reset", { room }, (data) => render(data));
    return;
  }

  socket.emit("show_cards", { showCard: true, room }, (data) => render(data));
});

const shareUrl = window.location.href.replace("game.html", "index.html");

document.getElementById("share").value = shareUrl;

document.getElementById("share").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(shareUrl + "&shared=true");
    alert("Link copied!");
  } catch (error) {
    console.error("Error to try copy share link!");
  }
});
