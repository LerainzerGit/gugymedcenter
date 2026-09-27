const media = {
  home: {
    kicker: "TONIGHT'S PICK",
    title: "The Long<br>Way Home",
    meta: "A GOODGUY ORIGINAL <span>•</span> 2025 <span>•</span> 1 HR 48 MIN",
    description: "Somewhere between here and the horizon, everything changes.",
    play: "Play",
    shelf: "Pick up where you left off",
    caption: "Your recently played",
    items: [
      ["The Blue Hour", "Movie · 42 min left", "card-one"],
      ["After the Rain", "Album · The Quiet Years", "card-two"],
      ["Northbound", "Movie · 1 hr 12 min left", "card-three"],
      ["City Lights", "Pictures · 18 photos", "card-four"]
    ]
  },
  movies: {
    kicker: "YOUR MOVIE LIBRARY",
    title: "Make it<br>a movie night",
    meta: "12 TITLES <span>•</span> 4 UNFINISHED",
    description: "All your favorites, right where you left them.",
    play: "Resume",
    shelf: "Continue watching",
    caption: "Movies you started",
    items: [
      ["The Blue Hour", "42 min left · Drama", "card-one"],
      ["Northbound", "1 hr 12 min left · Adventure", "card-three"],
      ["City Lights", "Watched recently · Classics", "card-four"],
      ["The Long Way Home", "New · Goodguy Original", "card-one"]
    ]
  },
  music: {
    kicker: "YOUR MUSIC LIBRARY",
    title: "Find your<br>favorite feeling",
    meta: "248 SONGS <span>•</span> 36 ALBUMS",
    description: "A soundtrack for whatever the evening brings.",
    play: "Play mix",
    shelf: "Recently played",
    caption: "Back in the rotation",
    items: [
      ["After the Rain", "The Quiet Years · Album", "card-two"],
      ["Midnight Radio", "The Sunday Drivers · Album", "card-four"],
      ["Soft Focus", "Goodguy Mix · 42 songs", "card-one"],
      ["Open Road", "Various artists · Playlist", "card-three"]
    ]
  },
  pictures: {
    kicker: "YOUR PICTURE LIBRARY",
    title: "Remember<br>the good days",
    meta: "86 PHOTOS <span>•</span> 12 VIDEOS",
    description: "The moments worth putting on the big screen.",
    play: "Start slideshow",
    shelf: "Favorite moments",
    caption: "From your picture library",
    items: [
      ["Coast weekend", "18 photos · August 2025", "card-one"],
      ["The open road", "12 photos · July 2025", "card-three"],
      ["After dark", "24 photos · June 2025", "card-four"],
      ["Little things", "9 photos · May 2025", "card-two"]
    ]
  },
  tv: {
    kicker: "LIVE & RECORDED",
    title: "Your seat<br>is waiting",
    meta: "TV + MORE <span>•</span> ALL YOUR ENTERTAINMENT",
    description: "Settle in with live moments and favorites on demand.",
    play: "Watch now",
    shelf: "On tonight",
    caption: "Ready when you are",
    items: [
      ["Evening News", "Live now · Channel 04", "card-four"],
      ["The Blue Hour", "Recorded · 42 min left", "card-one"],
      ["Open Road", "On demand · Adventure", "card-three"],
      ["Late Night", "Starts at 10:30 PM", "card-two"]
    ]
  }
};

const navItems = [...document.querySelectorAll(".nav-item[data-view]")];
const row = document.querySelector("#media-row");
let currentView = "home";
let isPlaying = false;
let soundSession = false;
let shuffleBag = [];
let lastSoundIndex = -1;
const soundFiles = [
  { title: "Womp womp", src: "./uploads/womp-womp_-made-with-Voicemod.mp3" },
  { title: "Momazos Diego", src: "./uploads/momazos-diego-made-with-Voicemod.mp3" },
  { title: "Whoa", src: "./uploads/whoa.mp3" }
];
const soundPlayer = new Audio();
soundPlayer.preload = "none";

function render(view) {
  currentView = view;
  const data = media[view];
  navItems.forEach(button => {
    const active = button.dataset.view === view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
  document.querySelector("#hero-kicker").textContent = data.kicker;
  document.querySelector("#hero-title").innerHTML = data.title;
  document.querySelector("#hero-meta").innerHTML = data.meta;
  document.querySelector("#hero-description").textContent = data.description;
  document.querySelector("#play-label").textContent = data.play;
  document.querySelector("#shelf-title").textContent = data.shelf;
  document.querySelector("#shelf-caption").textContent = data.caption;
  row.setAttribute("aria-label", data.caption);
  row.innerHTML = data.items.map(([title, subtitle, art], i) => `
    <button class="media-card" data-index="${i}" aria-label="Play ${title}">
      <span class="card-art ${art}"><span class="card-play" aria-hidden="true">▶</span></span>
      <span class="card-label">${title}<span class="card-subtitle">${subtitle}</span></span>
    </button>
  `).join("");
  document.querySelector("#hero-index").textContent = String(navItems.findIndex(item => item.dataset.view === view) + 1).padStart(2,"0");
  document.querySelector(".hero-progress i").style.width = `${(navItems.findIndex(item => item.dataset.view === view) + 1) * 19}%`;
}

function playItem(title, subtitle, art) {
  soundSession = false;
  soundPlayer.pause();
  const shuffleButton = document.querySelector("#shuffle-sounds");
  shuffleButton.setAttribute("aria-pressed", "false");
  shuffleButton.setAttribute("aria-label", "Play random sounds");
  shuffleButton.title = "Play random sounds";
  document.querySelector("#now-title").textContent = title;
  document.querySelector("#now-subtitle").textContent = subtitle;
  const artName = art || "card-one";
  document.querySelector("#now-art").className = `now-art ${artName}`;
  document.querySelector("#transport").textContent = "Ⅱ";
  document.querySelector("#transport").setAttribute("aria-label", "Pause");
  document.querySelector(".mini-track i").style.width = "23%";
  isPlaying = true;
}

function playNextSound() {
  if (shuffleBag.length === 0) {
    shuffleBag = soundFiles.map((_, index) => index);
    for (let index = shuffleBag.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffleBag[index], shuffleBag[swapIndex]] = [shuffleBag[swapIndex], shuffleBag[index]];
    }
    if (shuffleBag.length > 1 && shuffleBag[0] === lastSoundIndex) {
      [shuffleBag[0], shuffleBag[1]] = [shuffleBag[1], shuffleBag[0]];
    }
  }
  const soundIndex = shuffleBag.shift();
  const sound = soundFiles[soundIndex];
  lastSoundIndex = soundIndex;
  soundPlayer.src = sound.src;
  soundPlayer.currentTime = 0;
  document.querySelector("#now-title").textContent = sound.title;
  document.querySelector("#now-subtitle").textContent = "Random sounds";
  document.querySelector("#now-art").className = "now-art card-two";
  document.querySelector("#transport").textContent = "Ⅱ";
  document.querySelector("#transport").setAttribute("aria-label", "Pause");
  soundSession = true;
  isPlaying = true;
  const shuffleButton = document.querySelector("#shuffle-sounds");
  shuffleButton.setAttribute("aria-pressed", "true");
  shuffleButton.setAttribute("aria-label", "Stop this sound and play another");
  shuffleButton.title = "Press ??? again to stop this sound and play another one";
  soundPlayer.play().catch(error => {
    console.error("Could not play the selected sound:", error);
    document.querySelector("#now-subtitle").textContent = "Tap ??? to try again";
  });
}

navItems.forEach(button => button.addEventListener("click", () => render(button.dataset.view)));
document.querySelector("#shuffle-sounds").addEventListener("click", () => {
  if (soundSession) soundPlayer.pause();
  soundSession = true;
  playNextSound();
});
soundPlayer.addEventListener("ended", () => {
  if (!soundSession) return;
  soundSession = false;
  isPlaying = false;
  document.querySelector("#transport").textContent = "▶";
  document.querySelector("#transport").setAttribute("aria-label", "Play");
  document.querySelector("#now-subtitle").textContent = "Finished · Press ??? for another sound";
  const shuffleButton = document.querySelector("#shuffle-sounds");
  shuffleButton.setAttribute("aria-pressed", "false");
  shuffleButton.setAttribute("aria-label", "Play another random sound");
  shuffleButton.title = "Play another random sound";
});
soundPlayer.addEventListener("timeupdate", () => {
  if (!Number.isFinite(soundPlayer.duration) || soundPlayer.duration <= 0) return;
  const progress = soundPlayer.currentTime / soundPlayer.duration;
  document.querySelector(".mini-track i").style.width = `${progress * 100}%`;
  const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  document.querySelector(".track-time").textContent = `${formatTime(soundPlayer.currentTime)} / ${formatTime(soundPlayer.duration)}`;
});
row.addEventListener("click", event => {
  const card = event.target.closest(".media-card");
  if (!card) return;
  const [title, subtitle, art] = media[currentView].items[Number(card.dataset.index)];
  playItem(title, subtitle, art);
});
document.querySelector("#hero-play").addEventListener("click", () => {
  const d = media[currentView];
  playItem(d.title.replace("<br>", " "), d.meta.replace(/<[^>]+>/g, " · "), "card-one");
});
document.querySelector("#transport").addEventListener("click", event => {
  if (soundSession) {
    if (soundPlayer.paused) {
      soundPlayer.play().catch(error => console.error("Could not resume sound playback:", error));
      isPlaying = true;
    } else {
      soundPlayer.pause();
      isPlaying = false;
    }
    event.currentTarget.textContent = isPlaying ? "Ⅱ" : "▶";
    event.currentTarget.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
    return;
  }
  isPlaying = !isPlaying;
  event.currentTarget.textContent = isPlaying ? "Ⅱ" : "▶";
  event.currentTarget.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
});
document.querySelector("#hero-details").addEventListener("click", () => {
  document.querySelector("#shelf-title").textContent = media[currentView].kicker.replace("YOUR ", "").replace("TONIGHT'S PICK", "Tonight's pick");
  document.querySelector("#shelf-caption").textContent = media[currentView].description;
});
document.querySelector("#view-all").addEventListener("click", () => {
  const order = Object.keys(media);
  render(order[(order.indexOf(currentView) + 1) % order.length]);
});
document.querySelector(".brand").addEventListener("click", event => {
  event.preventDefault();
  render("home");
});
document.querySelector(".settings-button").addEventListener("click", event => {
  event.currentTarget.innerHTML = '<span class="settings-icon" aria-hidden="true">✓</span> Settings saved';
  window.setTimeout(() => { event.currentTarget.innerHTML = '<span class="settings-icon" aria-hidden="true">⚙</span> Settings'; }, 1400);
});
document.addEventListener("keydown", event => {
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
  const activeElement = document.activeElement;
  if (activeElement?.classList.contains("nav-item")) {
    event.preventDefault();
    const index = navItems.indexOf(activeElement);
    const next = (index + (event.key === "ArrowDown" ? 1 : navItems.length - 1)) % navItems.length;
    navItems[next].focus();
    render(navItems[next].dataset.view);
  }
});

const date = new Date();
document.querySelector("#welcome").textContent = new Intl.DateTimeFormat("en-US", { weekday:"long", month:"long", day:"numeric" }).format(date).toUpperCase();
document.querySelector("#clock").textContent = new Intl.DateTimeFormat("en-US", { hour:"numeric", minute:"2-digit" }).format(date);
render("home");
