const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const albumDisplay = document.getElementById('albumDisplay');
const albumCoverDisplay = document.getElementById('albumCoverDisplay');
const albumSongDisplay = document.getElementById('albumSongDisplay');
const albumBandDisplay = document.getElementById('albumBandDisplay');
const idleText = document.getElementById('idleText');
const CELL = 20;
const COLS = 20;
const ROWS = 20;
const SONGS = [

    { song: "Marmalade", band: "System of a Down", cover: "covers/soad.webp", audio: "audio/soad.mp3" },
    { song: "Spirit Crusher", band: "Death", cover: "covers/death.webp", audio: "audio/death.mp3" },
    { song: "Onedari Daisakusen", band: "BABYMETAL", cover: "covers/babymetal.webp", audio: "audio/babymetal.mp3" },
    { song: "Snuff", band: "Slipknot", cover: "covers/slipknot.webp", audio: "audio/slipknot.mp3" },
    { song: "Comfortable Liar", band: "Chevelle", cover: "covers/chevelle.webp", audio: "audio/chevelle.mp3" },
    { song: "Walk", band: "Pantera", cover: "covers/pantera.webp", audio: "audio/pantera.mp3" },
    { song: "You Know You're Right", band: "Nirvana", cover: "covers/nirvana.webp", audio: "audio/nirvana.mp3" },
    { song: "Creep", band: "Radiohead", cover: "covers/radiohead.webp", audio: "audio/radiohead.mp3" },
    { song: "Come Out and Play", band: "The Offspring", cover: "covers/offspring.webp", audio: "audio/offspring.mp3" },
    { song: "Black", band: "Pearl Jam", cover: "covers/pearljam.webp", audio: "audio/pearljam.mp3" },
    { song: "Soul of Cinder", band: "Dark Souls 3", cover: "covers/darksouls.webp", audio: "audio/soulofcinder.mp3" },
    { song: "Flock Off", band: "Devil May Cry 1", cover: "covers/dmc.webp", audio: "audio/flockoff.mp3" },
    { song: "Black Catcher", band: "Vickeblanka", cover: "covers/blackcatcher.webp", audio: "audio/blackcatcher.mp3" },
    { song: "When the Sun Hits", band: "Slowdive", cover: "covers/slowdive.webp", audio: "audio/slowdive.mp3" },
    { song: "Brianstorm", band: "Arctic Monkeys", cover: "covers/arcticmonkeys.webp", audio: "audio/brainstorm.mp3" }

];


const imagesCache = {};
SONGS.forEach(s => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = s.cover;
    imagesCache[s.song] = img;
});

let snake;
let dir;
let nextDir;
let food;
let score;
let gameLoop;
let paused;
let started;
let dead;
let songQueue;
let currentAudio = null;

function playAudio(src) {

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(src);
    currentAudio.volume = 0.5;
    currentAudio.play();

}

function stopAudio() {

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

}

function initState() {

    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    paused = false;
    dead = false;
    started = false;
    songQueue = [...SONGS].sort(() => Math.random() - 0.5);
    scoreDisplay.textContent = '0';
    idleText.style.display = 'block';
    albumDisplay.classList.remove('visible');
    placeFood();

}

function placeFood() {

    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));

    if (songQueue.length === 0) {
        songQueue = [...SONGS].sort(() => Math.random() - 0.5);
    }

    food = { ...pos, songData: songQueue.pop() };

}

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL, 0);
        ctx.lineTo(x * CELL, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL);
        ctx.lineTo(canvas.width, y * CELL);
        ctx.stroke();
    }

    if (food) {

        const img = imagesCache[food.songData.song];
        const fx = food.x * CELL;
        const fy = food.y * CELL;

        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, fx + 1, fy + 1, CELL - 2, CELL - 2);
        }

        ctx.strokeStyle = '#e63946';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(fx + 1, fy + 1, CELL - 2, CELL - 2);

    }

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#1a1a1a';

    snake.forEach((seg, i) => {

        const sx = seg.x * CELL;
        const sy = seg.y * CELL;
        const isHead = i === 0;

        if (isHead) {
            ctx.fillStyle = '#ff6b35';
        } else {
            ctx.fillStyle = `rgba(180, 30, 40, ${Math.max(0.3, 1 - i * 0.04)})`;
        }

        ctx.fillRect(sx + 2, sy + 2, CELL - 4, CELL - 4);

    });

    if (dead) {

        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#e63946';
        ctx.font = "bold 28px 'Metal Mania', cursive";
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);

        ctx.fillStyle = '#666666';
        ctx.font = "16px 'Rajdhani', sans-serif";
        ctx.fillText(`pontos: ${score}`, canvas.width / 2, canvas.height / 2 + 15);

        ctx.fillStyle = '#444444';
        ctx.font = "13px 'Rajdhani', sans-serif";
        ctx.fillText('pressione R para reiniciar', canvas.width / 2, canvas.height / 2 + 40);

        ctx.textAlign = 'left';

    }

}

function tick() {

    if (paused || dead) return;

    dir = { ...nextDir };

    const head = {
        x: snake[0].x + dir.x,
        y: snake[0].y + dir.y
    };

    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        endGame();
        return;
    }

    if (snake.some(s => s.x === head.x && s.y === head.y)) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;
        collect(food.songData);
        placeFood();
    } else {
        snake.pop();
    }

    draw();

}

function collect(songData) {

    idleText.style.display = 'none';
    albumCoverDisplay.src = songData.cover;
    albumSongDisplay.textContent = songData.song;
    albumBandDisplay.textContent = songData.band;
    albumDisplay.classList.remove('visible');
    setTimeout(() => {
        albumDisplay.classList.add('visible');
    }, 100);
    playAudio(songData.audio);

}

function endGame() {

    dead = true;
    clearInterval(gameLoop);
    stopAudio();
    draw();

}


function startGame() {

    initState();
    started = true;
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(tick, 140);
    draw();

}

document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp': if (dir.y !== 1) nextDir = { x: 0, y: -1 }; break;
        case 'ArrowDown': if (dir.y !== -1) nextDir = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if (dir.x !== 1) nextDir = { x: -1, y: 0 }; break;
        case 'ArrowRight': if (dir.x !== -1) nextDir = { x: 1, y: 0 }; break;
        case 'p': case 'P':
            if (started && !dead) paused = !paused;
            break;
        case 'r': case 'R':
            startGame();
            break;
    }
});