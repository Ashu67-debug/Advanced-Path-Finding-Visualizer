const rows = 20, cols = 30;
let grid = [];
let start = { r: 10, c: 5 };
let end = { r: 10, c: 25 };

const container = document.getElementById("grid");
container.style.gridTemplateColumns = `repeat(${cols}, 25px)`;

function createGrid() {
  container.innerHTML = "";
  grid = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      const el = document.createElement("div");
      el.className = "cell";

      if (r === start.r && c === start.c) el.classList.add("start");
      if (r === end.r && c === end.c) el.classList.add("end");
      el.onclick = () => toggleWall(r, c);

      container.appendChild(el);
      grid[r][c] = { el, wall: false, visited: false, dist: Infinity, parent: null };
    }
  }
}

function toggleWall(r, c) {
  if ((r === start.r && c === start.c) || (r === end.r && c === end.c)) return;
  grid[r][c].wall = !grid[r][c].wall;
  grid[r][c].el.classList.toggle("wall");
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function neighbors(r, c) {
  return [[1,0],[-1,0],[0,1],[0,-1]]
    .map(([dr, dc]) => [r+dr, c+dc])
    .filter(([nr, nc]) => nr>=0 && nc>=0 && nr<rows && nc<cols);
}
async function bfs() {
  let q = [start];
  grid[start.r][start.c].visited = true;

  while (q.length) {
    let { r, c } = q.shift();
    if (r === end.r && c === end.c) return;

    for (let [nr, nc] of neighbors(r,c)) {
      let node = grid[nr][nc];
      if (!node.visited && !node.wall) {
        node.visited = true;
        node.parent = { r, c };
        q.push({ r: nr, c: nc });
        node.el.classList.add("visited");
        await sleep(10);
      }
    }
  }
}
async function dfs() {
  let stack = [start];
  while (stack.length) {
    let { r, c } = stack.pop();
    let node = grid[r][c];
    if (node.visited) continue;
    node.visited = true;

    if (r === end.r && c === end.c) return;

    node.el.classList.add("visited");
    await sleep(10);

    for (let [nr, nc] of neighbors(r,c)) {
      let next = grid[nr][nc];
      if (!next.visited && !next.wall) {
        next.parent = { r, c };
        stack.push({ r: nr, c: nc });
      }
    }
  }
}
async function dijkstra() {
  grid[start.r][start.c].dist = 0;
  let unvisited = [];
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) unvisited.push({r,c});

  while (unvisited.length) {
    unvisited.sort((a,b)=>grid[a.r][a.c].dist-grid[b.r][b.c].dist);
    let { r, c } = unvisited.shift();
    let node = grid[r][c];

    if (node.wall) continue;
    if (node.dist === Infinity) return;

    node.el.classList.add("visited");
    if (r === end.r && c === end.c) return;

    for (let [nr, nc] of neighbors(r,c)) {
      let neighbor = grid[nr][nc];
      let alt = node.dist + 1;
      if (alt < neighbor.dist) {
        neighbor.dist = alt;
        neighbor.parent = { r, c };
      }
    }
    await sleep(5);
  }
}

function heuristic(a,b){ return Math.abs(a.r-b.r)+Math.abs(a.c-b.c); }

async function astar() {
  let open = [start];
  grid[start.r][start.c].dist = 0;

  while (open.length) {
    open.sort((a,b)=> (grid[a.r][a.c].dist+heuristic(a,end)) - (grid[b.r][b.c].dist+heuristic(b,end)));
    let current = open.shift();
    let { r, c } = current;

    let node = grid[r][c];
    if (node.visited) continue;
    node.visited = true;

    node.el.classList.add("visited");
    if (r === end.r && c === end.c) return;
    for (let [nr, nc] of neighbors(r,c)) {
      let neighbor = grid[nr][nc];
      if (neighbor.wall) continue;

      let temp = node.dist + 1;
      if (temp < neighbor.dist) {
        neighbor.dist = temp;
        neighbor.parent = { r, c };
        open.push({ r: nr, c: nc });
      }
    }
    await sleep(5);
  }
}

async function drawPath() {
  let curr = end;
  while (curr) {
    let node = grid[curr.r][curr.c];
    node.el.classList.add("path");
    curr = node.parent;
    await sleep(20);
  }
}
async function runAlgorithm() {
  let algo = document.getElementById("algo").value;
  if (algo === "bfs") await bfs();
  if (algo === "dfs") await dfs();
  if (algo === "dijkstra") await dijkstra();
  if (algo === "astar") await astar();
  await drawPath();
}

function resetGrid() { createGrid(); }

createGrid();