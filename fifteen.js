// on page load, start game
window.addEventListener("load", setup);

// global variables initialized during setup
let puzzle_size;
let puzzle_x = '';
let puzzle_y = '';
let allTiles = '';
let trophy;
const mapStrNum = {"zero": 0, "one": 1, "two": 2, "three": 3};

// extra feature: background selection
let imgChoice = Math.floor(Math.random() * 3) + 1;
const mapIndexImage = {1: 'backgrounds/background.jpg', 2: 'backgrounds/background2.jpg', 3: 'backgrounds/background3.jpg'};

// calculate position of given element
function getPosition(element) {
    const tile = element.getBoundingClientRect();

    // return left and top positions
    return {
        left: tile.left - puzzle_x,
        top: tile.top - puzzle_y
    };
}

// parse out the class associated with the tile's position
function getRowCol(tile) {
    const classes = tile.className.split(" ");
    const pos = classes[classes.length - 1].split("_");
    return {
        class: classes[classes.length - 1],
        row: mapStrNum[pos[0]],
        col: parseInt(pos[1])
    }
}

// find tiles that share a border with given tile
function findNeighbors(tile) {
    const position = getPosition(tile);

    // all the possible coordinates of neighbor tiles
    const coords = [[(puzzle_x + position.left - 100), (puzzle_y + position.top)],
                    [(puzzle_x + position.left), (puzzle_y + position.top - 100)],
                    [(puzzle_x + position.left + 100), (puzzle_y + position.top)],
                    [(puzzle_x + position.left), (puzzle_y + position.top + 100)]];

    let neighbors = [];
    
    // populate neighbor array if the coordinates exist on the board
    // (tiles can only be in (0,0) and (400,400))
    for (let j = 0; j < coords.length; j++) {
        const xy = coords[j];

        if (!(xy[0] < puzzle_x) && !(xy[0] > puzzle_x + 301) 
            && !(xy[1] < puzzle_y) && !(xy[1] > puzzle_y + 301)) {
            neighbors.push(document.elementFromPoint(xy[0], xy[1]));
        }
    }

    // return array of neighbors
    return neighbors;
}

// swap the class to swap the tile locations
function moveTile(tile, emptyTile) {
    const tileRC = getRowCol(tile);
    const emptyRC = getRowCol(emptyTile);

    tile.classList.replace(tileRC.class, emptyRC.class);
    emptyTile.classList.replace(emptyRC.class, tileRC.class);
}

// show hover effect when mouseover
function hoverTile(tile) {
    tile.style.outlineColor = "red"; 
    tile.style.color = "#006600"; 
    tile.style.textDecoration = "underline";
    tile.style.zIndex = "2";
}
// clear hover styling when mouseout
function clearHover(tile) {
    tile.style.outlineColor = "black"; 
    tile.style.color = "black"; 
    tile.style.textDecoration = "none";
    tile.style.zIndex = "1";
}

// when tile is clicked
function tileClicked(tile) {
    changeTile(tile, "click");
    let end = checkSolved();
    if(end) {
        gameEnd(true);
    };
}

// perform action on given tile
function changeTile(tile, action) {
    // find neighboring tiles
    const neighbors = findNeighbors(tile);
    
    // if you can move given tile to empty spot
    for (let k = 0; k < neighbors.length; k++) {
        // if one of the neighboring tiles is empty
        if(neighbors[k].id == "empty") {
            // if the action is hover, change tile style
            if (action == "hover") {
                hoverTile(tile);
            }
            // if the action is click, move the tiles 
            else if (action == "click") {
                console.log("register click")
                var emptyTile = neighbors[k];
                moveTile(tile, emptyTile);
                break; 
            }
        }
    }
}

// check to see if puzzle is solved
function checkSolved() {
    const currentTileOrder = document.getElementsByClassName("tile");
    let ind = 0;

    for (let m = 0; m < puzzle_size; m++) {
        for(let n = 0; n < puzzle_size; n++) {
            let rowCol = getRowCol(currentTileOrder[ind]);
            
            // if the tiles are in order, then the row and column class
            // should correspond to a nested for loop traversal
            // if not, end check due to it still being unsolved
            if(!(m == rowCol.row && n == rowCol.col)) {
                return false;
            }
            ind += 1;
        } 
    }
    return true;
}

// extra feature: end-game notification
function endTrophy() {
    trophy = document.createElement("div");
    trophy.id = "hide";
    trophy.innerHTML = ""

    document.body.insertBefore(trophy, document.body.childNodes[0]);
    return false;
}

// extra feature: end-game notification
function gameEnd(won) {
    // show award/sorry msg if user won/lost
    endTrophy();
    let playAgain = document.createElement("button");
    playAgain.innerText = "Play Again"
    playAgain.className = "btn";

    if (won) {
        trophy.innerHTML = "<h1>Congrats! You Won!</h1>";
    }

    var inputs = document.getElementsByTagName("input"); 
    for (var i = 0; i < inputs.length; i++) { 
        inputs[i].disabled = true;
    }

    // when play again is clicked, refresh page
    playAgain.onclick = resetGame;
    trophy.appendChild(playAgain);

    trophy.id = "trophy";
    
    return false;
}

// extra feature: end-game notification
// refresh page to reset game
function resetGame() { 
    location.reload();
}

// setup the board on page load
function setup() {
    // get location of puzzle on the screen
    puzzle_size = 4;
    puzzle_x = document.getElementById("puzzle").getBoundingClientRect().x;
    puzzle_y = document.getElementById("puzzle").getBoundingClientRect().y;

    // extra feature: background selection
    document.querySelectorAll("input[value='" + imgChoice.toString() + "']")[0].checked = true;

    // get all the tiles
    allTiles = document.getElementsByClassName("tile");

    // for each tile
    for (let i = 0; i < allTiles.length; i++) {
        const tile = allTiles[i];
        // determine it's position in relation to the puzzle container
        let pos = getPosition(tile);
        // so long as it's not the last block that should be empty
        if(!(pos.left >= 300 && pos.top >= 300)) {
            // extra feature: background selection
            tile.style.backgroundImage = "url(" + mapIndexImage[imgChoice] + ")";
            // save part of the background to the tile 
            tile.style.backgroundPosition = "" + (400 - pos.left) + "px " + (400 - pos.top) + "px";

            // add event listeners to handle clicks and hovering
            tile.addEventListener("click", () => {tileClicked(tile)});
            tile.addEventListener("mouseover", () => {changeTile(tile, "hover")});
            tile.addEventListener("mouseout", () => {clearHover(tile)});
        }
    }
}

// extra feature: background selection
function processForm() {
    imgChoice = parseInt(document.forms["chooseBackground"]["bg_img"].value);
    setup();
    return false;
}