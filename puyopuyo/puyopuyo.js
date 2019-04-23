/**
 * @author Kyohei ANDO
 */
const CANVAS_SIZE_X = 180;
const CANVAS_SIZE_Y = 360;
const CANVAS_MARGIN_X = 0;
const CANVAS_MARGIN_Y = 0;
const BOARD_SIZE_X = 6;
const BOARD_SIZE_Y = 12;
const X_UNIT_SIZE = 30;
const Y_UNIT_SIZE = 30;
const X_UNIT_SIZE_IMG = 40;
const Y_UNIT_SIZE_IMG = 40;
const FRAME_INTERVAL_MSEC = 10;
const TOUCH_DRAG_SENSE = 50;


/*********************/
/**** Definitions ****/
/*********************/

// ぷよのツモの定義
var PuyoTumo = function(p1, p2){
	this.puyo = [p1, p2];
	this.rotateR = function(){
		var divX = this.puyo[1].x - this.puyo[0].x;
		var divY = this.puyo[1].y - this.puyo[0].y;
		
		this.puyo[1].x = this.puyo[0].x + divY;
		this.puyo[1].y = this.puyo[0].y - divX;
	};
	this.rotateL = function(){
		var divX = this.puyo[1].x - this.puyo[0].x;
		var divY = this.puyo[1].y - this.puyo[0].y;
		
		this.puyo[1].x = this.puyo[0].x - divY;
		this.puyo[1].y = this.puyo[0].y + divX;
	};
    this.getPuyoArray = function() {
        var tmp = new Array();
        tmp.push(this.puyo[0]);
        tmp.push(this.puyo[1]);
        return tmp;
    };
}

// ぷよのクラス定義
var Puyo = function(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
	
    this.draw = function(ctx) {
        ctx.fillStyle = "white";
        var i;
        for (i = 0; i < 4; i++) {
 	          ctx.fillRect(X_UNIT_SIZE * this.getXof(i) + 5, CANVAS_SIZE_Y - (Y_UNIT_SIZE * this.getYof(i)) - Y_UNIT_SIZE * 0.1, X_UNIT_SIZE * 0.8, Y_UNIT_SIZE * 0.8);
        }
    };
    this.clear = function(ctx) { // TODO  not implement yet
        var i;
        for (i = 0; i < 4; i++) {
 	          ctx.clearRect(x_unit * this.getXof(i) + 5, CANVAS_SIZE_Y - (Y_UNIT_SIZE * this.getYof(i)) + 35 - 70, 30, 30);
        }
    };
    this.clone = function() {
        return new Puyo(this.x, this.y, this.color);
    };
}

/* a～bをランダムで返す */
function randomFromTo(a, b) {
    return Math.floor((a-b+1) * Math.random() + b);
}

var PuyoRule = function() {
    // default values
    this.colorNum = 4;
    this.owanimoSize = 4;
    this.dropRate = 30;

    this.ojamaRate = 70;
}

// 得点計算
var chainBonus = new Array(0, 0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 480, 512);
var renketsuBonus = new Array(0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 10, 10, 10, 10, 10, 10, 10, 10);
var colorBonus = new Array(0, 0, 3, 6, 12, 24);
function calcScore(puyo_num, chain_num, renketsu_num, color_num) {
    return puyo_num * 10 * (chainBonus[chain_num] + renketsuBonus[renketsu_num] + colorBonus[color_num]);
}

/**************************/
/**** Global Valiables ****/
/**************************/

// Canvas要素と2Dのコンテキスト
var canvas_display; // 
var canvas; // 
var canvas_dropped; //落下済のぷよ
var canvas_back; //背景
var canvas_next; //
var ctx_display;
var ctx;
var ctx_dropped;
var ctx_back;
var ctx_next;

// 現在のツモ
var tumo;

// 連鎖カウント
var chainCount = 0;

// スコア
var score = 0;
var scoreOjama = 0;

// NEXTぷよ
var nextPuyoArray = new Array();

// ぷよマップ
var puyoMap;

// ぷよルール
var puyoRule;

// 下ボタンが押されている状態
var isPressDropKey = false;

// ぷよ画像
var puyoImage = new Image();
var _tmp;
function putPuyo (context, x, y, div, color, up, bottom, left, right, isRemove, zoom) {
    var dx = X_UNIT_SIZE * x;
    var dy = CANVAS_SIZE_Y - (Y_UNIT_SIZE * y) - Y_UNIT_SIZE + div;
    var dw = X_UNIT_SIZE;
    var dh = Y_UNIT_SIZE;

    var sx = color * X_UNIT_SIZE_IMG;
    var sy;
    if (!up && !bottom && !left && !right) {
        sy = 0 * Y_UNIT_SIZE_IMG;
    } else if (!up && !bottom && !left && right) {
        sy = 2 * Y_UNIT_SIZE_IMG;
    } else if (up && !bottom && !left && !right) {
        sy = 3 * Y_UNIT_SIZE_IMG;
    } else if (!up && !bottom && left && !right) {
        sy = 4 * Y_UNIT_SIZE_IMG;
    } else if (!up && bottom && !left && !right) {
        sy = 5 * Y_UNIT_SIZE_IMG;
    } else if (up && !bottom && !left && right) {
        sy = 6 * Y_UNIT_SIZE_IMG;
    } else if (up && !bottom && left && !right) {
        sy = 7 * Y_UNIT_SIZE_IMG;
    } else if (!up && bottom && left && !right) {
        sy = 8 * Y_UNIT_SIZE_IMG;
    } else if (!up && bottom && !left && right) {
        sy = 9 * Y_UNIT_SIZE_IMG;
    } else if (up && bottom && !left && !right) {
        sy = 10 * Y_UNIT_SIZE_IMG;
    } else if (!up && !bottom && left && right) {
        sy = 11 * Y_UNIT_SIZE_IMG;
    } else if (up && !bottom && left && right) {
        sy = 12 * Y_UNIT_SIZE_IMG;
    } else if (up && bottom && left && !right) {
        sy = 13 * Y_UNIT_SIZE_IMG;
    } else if (!up && bottom && left && right) {
        sy = 14 * Y_UNIT_SIZE_IMG;
    } else if (up && bottom && !left && right) {
        sy = 15 * Y_UNIT_SIZE_IMG;
    } else if (up && bottom && left && right) {
        sy = 16 * Y_UNIT_SIZE_IMG;
    } 

    if (isRemove) {
        sy = 1 * Y_UNIT_SIZE_IMG;
    }

    // Bound
    dx = dx - (X_UNIT_SIZE * (1 - zoom)/2) ;
    dy = dy + (Y_UNIT_SIZE * (1 - zoom));
    dw = dw + (X_UNIT_SIZE * (1 - zoom));
    dh = Y_UNIT_SIZE * zoom;

    context.drawImage(puyoImage, sx, sy, X_UNIT_SIZE_IMG, Y_UNIT_SIZE_IMG, dx, dy, dw, dh);

}

// キャラクター画像
var charaImageArray = [
    new Image(),
    new Image(),
    new Image(),
    new Image()
];

// 背景画像
var backgroundImage = new Image();

// アニメーションオブジェクトのリスト
var animationObjList = new Array();

// 連鎖アニメーションオブジェクト
var RensaCountTextAnimation = function(x, y, rensa_num) {
    this.count = 0;
    this.draw = function(ctx) {
        ctx.save();
    //    ctx.globalAlpha = 1 - this.count/70;
        ctx.font = "bold 32px Gothic";
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText(rensa_num + " Chains!!", x, y - this.count);
        this.count++;
        ctx.restore();
    };
    this.next = function() {
        return this.count < 70;
    };
}

// ぷよ削除アニメーション
var RemovePuyoAnimation = function(puyo) {
    this.count = 0;
    this.seed = randomFromTo(-2, 2);
    this.draw = function(ctx) {
        var dx = X_UNIT_SIZE * puyo.x;
        var dy = CANVAS_SIZE_Y - (Y_UNIT_SIZE * (puyo.y + 0.7));
        var dw = X_UNIT_SIZE;
        var dh = Y_UNIT_SIZE;

        var sx = puyo.color * X_UNIT_SIZE_IMG;
        var sy = 1 * Y_UNIT_SIZE_IMG;

        // Bound
        dx = dx - (X_UNIT_SIZE * (10 - this.count)/30);
        dy = dy - (Y_UNIT_SIZE * (10 - this.count)/30);
        dw = dw + (X_UNIT_SIZE * (10 - this.count)/30);
        dh = dh + (Y_UNIT_SIZE * (10 - this.count)/30);

        ctx.save();
    //    ctx.globalAlpha = 0.5 - this.count/60;
        ctx.rotate(this.seed * this.count/3/180*Math.PI);
        ctx.drawImage(puyoImage, sx, sy, X_UNIT_SIZE_IMG, Y_UNIT_SIZE_IMG, dx, dy, dw, dh);
        ctx.restore();
        this.count++;
    };
    this.next = function() {
        return this.count < 20;
    };
}

/*******************/
/**** Functions ****/
/*******************/

// Sound
var snd = new Object();
function playSE(name) {
    audio = new Audio(snd[name]);
    audio.play();
}

//var baseUrl="http://tomoraku-life.capoo.jp/myfile/puyo/"
var baseUrl=""
var waitForLoadNum = 0;
var loadedNum = 0;
function puyoInit() {

    // Sound
    if (new Audio().canPlayType("audio/mp3")) {
        snd['drop'] = baseUrl + 'mp3/sei_ge_awa01.mp3';
        snd['owanimo'] = baseUrl + 'mp3/ta_ta_pyuun01.mp3';
    } else if (new Audio().canPlayType("audio/ogg")) {
        snd['drop'] = baseUrl + 'mp3/sei_ge_awa01.ogg';
        snd['owanimo'] = baseUrl + 'mp3/ta_ta_pyuun01.ogg';
    }
    new Audio(snd['drop']).load(); // load to cache
    new Audio(snd['owanimo']).load();

    // Canvas要素生成
    var puyo_div = document.getElementById("puyo");
    puyo_div.innerHTML = '<canvas id="display" width="180" height="360" style="box-shadow: 1px 1px 3px #000;"></canvas>'
        +'<canvas id="canvas_back" width="180" height="360" style="display: none;"></canvas>'
        +'<canvas id="canvas" width="180" height="360" style="display: none;"></canvas>'
        +'<canvas id="canvas_dropped" width="180" height="360" style="display: none;"></canvas>'
        +'<canvas id="canvas_next" width="40" height="60" style="margin-bottom: 220px; margin-left: 20px;"></canvas>'
        +'<div id="scorediv"><b>SCORE: <span id="score">0</span></b></div>'
        +'<div id="status"></div>';
        

    // ぷよマップ
    puyoMap = new Array(BOARD_SIZE_X)
    for (var i = 0; i < BOARD_SIZE_X; i++) {
 	      puyoMap[i] = new Array(BOARD_SIZE_Y);
        for (var j = 0; j < BOARD_SIZE_Y; j++) {
            puyoMap[i][j] = null; //nullで初期化
        }
    }
    // ルール
    puyoRule = new PuyoRule();
	
    // 第一手
	  tumo = new PuyoTumo(
		new Puyo(BOARD_SIZE_X / 2 - 1, BOARD_SIZE_Y, randomFromTo(3,0)),
		new Puyo(BOARD_SIZE_X / 2 - 1, BOARD_SIZE_Y + 1, randomFromTo(3,0)));
    // NEXTぷよ
    for (var i = 0; i < 10; i++) {
        nextPuyoArray.push(new PuyoTumo(
		        new Puyo(BOARD_SIZE_X / 2 - 1, BOARD_SIZE_Y, randomFromTo(3,0)),
		        new Puyo(BOARD_SIZE_X / 2 - 1, BOARD_SIZE_Y + 1, randomFromTo(3,0))));
    }

    /* Canvas関連 */
    canvas_display = document.getElementById('display');
    ctx_display = canvas_display.getContext('2d');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas_dropped = document.getElementById('canvas_dropped');
    ctx_dropped = canvas_dropped.getContext('2d');
    canvas_back = document.getElementById('canvas_back');
    ctx_back = canvas_back.getContext('2d');
    canvas_next = document.getElementById('canvas_next');
    ctx_next = canvas_next.getContext('2d');
    /* canvas要素の存在チェックとCanvas未対応ブラウザの対処 */
    if (!canvas || !canvas.getContext) {
      return false;
    }

    // 画像読み込み
    //charaImageArray[0].src = "image/chara1.png";
    //backgroundImage.src = 'image/back.png';
    //puyoImage.src = "image/puyo-2.png";
    loadImage(charaImageArray[0], baseUrl + "image/chara1.png");
    loadImage(backgroundImage, baseUrl + 'image/back.png');
    loadImage(puyoImage, baseUrl + "image/puyo-2.png");

    // HTML関連
    /*
    document.getElementById('colorNumForm').value = puyoRule.colorNum;
    document.getElementById('owanimoSizeForm').value = puyoRule.owanimoSize;
    document.getElementById('dropRateForm').value = puyoRule.dropRate;
    */
}
function loadImage(imgObj, url) {
    waitForLoadNum++;
    imgObj.src = url;
    imgObj.onload = function() {
        console.log("image loaded : " + url);
        loadedNum++;
    };
}
// Entry Point
function puyoStart() {
    if (waitForLoadNum == loadedNum) {
        drawAll();
        doDropTumo();
    } else {
        // TOOD draw progress...
        console.log("loading images: " + loadedNum + " / " + waitForLoadNum);
        setTimeout(puyoStart, 100);
    }
}


// 落下できるか
function canDrop(x, y) {
    if (y == 0) {
        return 0;
    }
    if (puyoMap[x][y-1] != null) {
        return 0;
    }
    return 1;
}
function canDropBlock() {
    var i;
    for (i = 0; i < 2; i++) {
	    if (canDrop(tumo.puyo[i].x, tumo.puyo[i].y) == 0) {
    	    return false;
        }
    }

    return true;
}

// 消滅判定
function removePuyo() {
    var i,j, isDropped = false;
    for (i = 0; i < BOARD_SIZE_X; i++) {
        for (j = 0; j < BOARD_SIZE_Y; j++) {
            if (puyoMap[i][j] != null) {
				if (decideRemove(i, j)) {
					eliminatePuyo(i, j);
					isDropped = true;
				}
            }
        }
    }
	return isDropped;
}
function decideRemove(x, y) {
	return (countConnect(x, y, false) >= puyoRule.owanimoSize);
}
function eliminatePuyo(x, y) {
	countConnect(x, y, true);
}
function countConnect(x, y, isRemove) {
	var c = puyoMap[x][y];
	puyoMap[x][y] = null;
	
	var result = 1;
	if (x > 0                && puyoMap[x-1][y] != null && c.color == puyoMap[x-1][y].color) result += countConnect(x-1, y, isRemove);
	if (x < BOARD_SIZE_X - 1 && puyoMap[x+1][y] != null && c.color == puyoMap[x+1][y].color) result += countConnect(x+1, y, isRemove);
	if (y > 0                && puyoMap[x][y-1] != null && c.color == puyoMap[x][y-1].color) result += countConnect(x, y-1, isRemove);
	if (y < BOARD_SIZE_Y - 1 && puyoMap[x][y+1] != null && c.color == puyoMap[x][y+1].color) result += countConnect(x, y+1, isRemove);

	if (!isRemove) {
		puyoMap[x][y] = c;
	}
	return result;
}
function getRemovePuyoArray() {
	var removePuyoArray = new Array();
	
    var i,j;
    for (i = 0; i < BOARD_SIZE_X; i++) {
        for (j = 0; j < BOARD_SIZE_Y; j++) {
            if (puyoMap[i][j] != null) {
				if (decideRemove(i, j)) {
					removePuyoArray.push(puyoMap[i][j]);
					// TODO 判定済は省略可
				}
            }
        }
    }
	return removePuyoArray;
}

// 回転処理
function rotate(n) {
    if (n > 0) {
        tumo.rotateR();
    } if (n < 0) {
        tumo.rotateL();
    }
    
    // チェック
    if (tumo.puyo[1].x < 0) {
        if (!move_right()) {
            rotate(-n);
        }
        return;
    }
    if (tumo.puyo[1].x >= BOARD_SIZE_X) {
        if (!move_left()) {
            rotate(-n);
        }
        return;
    }
    if (tumo.puyo[1].y < 0) {
        //rotate(-n);
        tumo.puyo[0].y++;
        tumo.puyo[1].y++;
        return;
    }
    // 回転後にすでにブロックがあれば、戻す
    if (puyoMap[tumo.puyo[1].x][tumo.puyo[1].y] != null) {
        if (tumo.puyo[0].x < tumo.puyo[1].x) {
            if (!move_left()) {
                rotate(-n);
            }
            return;
        }
        if (tumo.puyo[1].x < tumo.puyo[0].x) {
            if (!move_right()) {
                rotate(-n);
            }
            return;
        }
        if (tumo.puyo[1].y < tumo.puyo[0].y) {
            tumo.puyo[0].y++;
            tumo.puyo[1].y++;
            return;
        }
    }
}

// 左へ移動
function move_left() {
    var i;
    for (i = 0; i < 2; i++) {        
        // 左端なら動かない.
        if (tumo.puyo[i].x == 0) {
            return false;
        }
        // 移動先にブロックがあれば, 動かない.
        if (puyoMap[tumo.puyo[i].x-1][tumo.puyo[i].y] != null) {
            return false;
        }
    }
    
    for (i = 0; i < 2; i++) {
        tumo.puyo[i].x--;
    }
    return true;
}


// 右へ移動
function move_right() {
    var i;
    for (i = 0; i < 2; i++) {        
        // 右端なら動かない.
        if (tumo.puyo[i].x == CANVAS_SIZE_X - 1) {
            return false;
        }
        // 移動先にブロックがあれば, 動かない.
        if (puyoMap[tumo.puyo[i].x+1][tumo.puyo[i].y] != null) {
            return false;
        }
    }
	
    for (i = 0; i < 2; i++) {
        tumo.puyo[i].x++;
    }
    return true;
}

// ハードドロップ
function hard_drop() {
    while (canDropBlock()) {
        tumo.puyo[0].y--;
        tumo.puyo[1].y--;
    }

    count = 10000;
    _fixCount = 10000;
}

// 表示
function drawPuyoArray(puyoArray, div, isRemove, zoom) {
    var i;
    for (i = 0; i < puyoArray.length; i++) {
        putPuyo(ctx, puyoArray[i].x, puyoArray[i].y, Y_UNIT_SIZE * div - Y_UNIT_SIZE, puyoArray[i].color, false, false, false, false, isRemove, zoom);
    }
}
function display(puyoArray, i, isRemove, zoom) {

    ctx.clearRect(0, 0, CANVAS_SIZE_X, CANVAS_SIZE_Y);
    drawPuyoArray(puyoArray, i, isRemove, zoom);
	
    // アニメーションオブジェクト
    for (var i = 0; i < animationObjList.length; i++) {
        animationObjList[i].draw(ctx);
        if (!animationObjList[i].next()) {
            animationObjList.splice(i, 1);
            i--; //削除したから調節 
        }
    }

    //ctx_display.clearRect(CANVAS_MARGIN_X, CANVAS_MARGIN_Y, CANVAS_SIZE_X, CANVAS_SIZE_Y);
    ctx_display.drawImage(canvas_back, CANVAS_MARGIN_X, CANVAS_MARGIN_Y, CANVAS_SIZE_X, CANVAS_SIZE_Y, CANVAS_MARGIN_X, CANVAS_MARGIN_Y, CANVAS_SIZE_X, CANVAS_SIZE_Y);
    //ctx_display.drawImage(canvas_dropped, 50, 50);
    ctx_display.drawImage(canvas, CANVAS_MARGIN_X, CANVAS_MARGIN_Y);
}
function displayTumo() {
    display(tumo.getPuyoArray(), count/puyoRule.dropRate, false, 1);
}
function drawAll() {
    drawBackground();
    drawNextPuyo(); 
    drawDroppedBlocks();
    ctx_display.drawImage(canvas_back, 0, 0);
    displayTumo();
}
function drawBackground() {
    //ctx_back.clearRect(CANVAS_MARGIN_X, CANVAS_MARGIN_Y, CANVAS_SIZE_X, CANVAS_SIZE_Y);

    //ctx_back.drawImage(backgroundImage, 0, 0);
    //ctx_back.drawImage(charaImageArray[0], 0, 0, CANVAS_SIZE_X, CANVAS_SIZE_Y, 50, 50, CANVAS_SIZE_X, CANVAS_SIZE_Y);
	
    //ctx_back.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx_back.fillStyle = "rgba(0, 0, 0)";
    ctx_back.fillRect(CANVAS_MARGIN_X, CANVAS_MARGIN_Y, CANVAS_SIZE_X, CANVAS_SIZE_Y);
}
function drawDroppedBlocks() {
	ctx_dropped.clearRect(0, 0, CANVAS_SIZE_X, CANVAS_SIZE_Y);
	
	var i, j;
    for (i = 0; i < BOARD_SIZE_X; i++) {
        for (j = 0; j < BOARD_SIZE_Y; j++) {
            if (puyoMap[i][j] != null) {

                var up = false, bottom = false, left = false, right = false;
                if (j < BOARD_SIZE_Y - 1 && puyoMap[i][j+1] != null && puyoMap[i][j].color == puyoMap[i][j+1].color) {
                    up = true;
                }
                if (j > 0 && puyoMap[i][j-1] != null && puyoMap[i][j].color == puyoMap[i][j-1].color) {
                    bottom = true;
                }
                if (i < BOARD_SIZE_X - 1 && puyoMap[i+1][j] != null && puyoMap[i][j].color == puyoMap[i+1][j].color) {
                    right = true;
                }
                if (i > 0 && puyoMap[i-1][j] != null && puyoMap[i][j].color == puyoMap[i-1][j].color) {
                    left = true;
                }

                putPuyo(ctx_dropped, i, j, 0, puyoMap[i][j].color, up, bottom, left, right, false, 1); 
            }
        }
    }
    ctx_back.drawImage(canvas_dropped, CANVAS_MARGIN_X, CANVAS_MARGIN_Y);
}
function drawNextPuyo() {
    ctx_next.fillStyle = "rgba(0, 0, 0)";
    ctx_next.fillRect(0, 0, 40, 60);
    for (var i = 0; i < 2; i++) {
        var sameColor = false;
        if (nextPuyoArray[i].puyo[0].color == nextPuyoArray[i].puyo[1].color) {
            sameColor = true;
        }
        for (var j = 0; j < 2; j++) {
            var div = 0;
            if (i != 0) div = FRAME_INTERVAL_MSEC;
            var up = (j == 0 && sameColor);
            var bottom  = (j != 0 && sameColor);

            putPuyo(ctx_next, i, 10 + j, div, nextPuyoArray[i].puyo[j].color, up, bottom, false, false, false, 1);
        }
    }
}

// TODO
function gameover() {
    document.getElementById('status').innerHTML = "Game Over!!";
}

// ****************
//      手続き
// ****************
// ループ
var count = 0; //カウンタ
var _fixCount = 0; var FixTime = 40;
function doDropTumo(){
    setTimeout(displayTumo, 0);

    // ゲームオーバー判定
    if (puyoMap[2][11] != null) {
        // Game Over
        gameover();
        return;
    }
    
    // 落下
    if (count >= puyoRule.dropRate) {
        if (canDropBlock()) {
            tumo.puyo[0].y--;
            tumo.puyo[1].y--;
            count = 0;
            setTimeout(doDropTumo, FRAME_INTERVAL_MSEC);
        } else {
            if (isPressDropKey || _fixCount > FixTime) {
                _fixCount = 0;
            
                fixBlock();
            
                // 落下・消滅判定・消滅, 繰り返して連鎖
                //setTimeout(doDropPuyo, FRAME_INTERVAL_MSEC);
                animateBoundPuyo(tumo.getPuyoArray(), doDropPuyo);
                return;
            } else {
                _fixCount++;
                setTimeout(doDropTumo, FRAME_INTERVAL_MSEC);
                return;
            }
        } 
    } else {
        count++;
        if (isPressDropKey) {
            score++; scoreOjama++;
            // TODO スコアを表示する場所を考える
            document.getElementById('score').innerHTML = score;

            count += puyoRule.dropRate/2;
            if (count > puyoRule.dropRate) count = puyoRule.dropRate;
        }
       
        setTimeout(doDropTumo, FRAME_INTERVAL_MSEC);
    }
}

function fixBlock() {
    var i;
    for (i = 0; i < 2; i++) {
        puyoMap[tumo.puyo[i].x][tumo.puyo[i].y] = tumo.puyo[i].clone();
    }
}

var _animateBoundPuyo_nextFunction;
var _animateBoundPuyo_puyoArray;
var _animateBoundPuyo_count;
function animateBoundPuyo(puyoArray, nextFunc) {
    _animateBoundPuyo_puyoArray = puyoArray;
    _animateBoundPuyo_nextFunction = nextFunc;
    _animateBoundPuyo_count = 8;
    
    setTimeout(animateBoundPuyoSub, FRAME_INTERVAL_MSEC);
}

function animateBoundPuyoSub() {
    if (_animateBoundPuyo_count <= 0) {
        setTimeout(_animateBoundPuyo_nextFunction, FRAME_INTERVAL_MSEC);
    } else {
        display(_animateBoundPuyo_puyoArray, 1, false, 1/_animateBoundPuyo_count);
        _animateBoundPuyo_count--;
        setTimeout(animateBoundPuyoSub, FRAME_INTERVAL_MSEC);
    }
}

// ぷよドロップ
function doDropPuyo() {
	var dropListArray = new Array();
	
	var i, j, k;
	for (i = 1; i < BOARD_SIZE_Y; i++) {
		for (j = 0; j < BOARD_SIZE_X; j++) {
			if (puyoMap[j][i] != null && puyoMap[j][i-1] == null) {
				puyoMap[j][i].y--;
				dropListArray.push(puyoMap[j][i]);
				puyoMap[j][i] = null;
			}
		}
	}
	
    // 落下するぷよがなければ終了;
    if (dropListArray.length == 0) {

        playSE('drop');
    
        var removePuyoArray = getRemovePuyoArray();
    
        if (removePuyoArray.length > 0) {
            // スコア計算
            var tmpScore = calcScore(removePuyoArray.length, chainCount + 1, 4, 1); //TODO renketsu_num, color_num
            score += tmpScore;
            scoreOjama += tmpScore;

            removePuyo();
            drawBackground();
            drawDroppedBlocks();
            animateRemovePuyo(removePuyoArray); 
            return;
        } else {
						
            // 次のぷよ  TODO NEXTぷよ。
            tumo = nextPuyoArray.shift(); 
            nextPuyoArray.push( new PuyoTumo(
                new Puyo(BOARD_SIZE_X / 2 - 1, BOARD_SIZE_Y, randomFromTo(puyoRule.colorNum - 1, 0)),
                new Puyo(BOARD_SIZE_X / 2 - 1, BOARD_SIZE_Y + 1, randomFromTo(puyoRule.colorNum - 1, 0))));
            chainCount = 0;
            scoreOjama = 0;
	
            // 表示更新
			      drawAll();

            // 次のツモまでの時間を待つ
            //var next_block_time_wait = puyoRule.dropRate * FRAME_INTERVAL_MSEC * 2;
            //setTimeout(doDropTumo, next_block_time_wait);
            setTimeout(doDropTumo, FRAME_INTERVAL_MSEC); // TODO もうちょっと長く待ちたい
        }
		
        return;
    }

    // 落下したぷよの表示更新
    drawBackground();
    drawDroppedBlocks(); 
	
    animateDrop(dropListArray);
}
var _puyoArray;
function animateDrop(puyoArray) {
	_puyoArray = puyoArray;
	setTimeout("animateDropSub("+0+")", 0);
}
function animateDropSub(i) {
    var Rate = 3;
    display(_puyoArray, i/Rate, false, 1);

    if (i >= Rate) {
        //落下したぷよを反映
        while (_puyoArray.length > 0) {
            var tmpPuyo = _puyoArray.pop();
            puyoMap[tmpPuyo.x][tmpPuyo.y] = tmpPuyo;
        }
        setTimeout(doDropPuyo, FRAME_INTERVAL_MSEC);
    } else {
        setTimeout("animateDropSub("+(i+1)+")", FRAME_INTERVAL_MSEC);
    }
}
var _removePuyoArray;
function animateRemovePuyo(removePuyoArray) {
	_removePuyoArray = removePuyoArray;
	setTimeout("animateRemovePuyoSub(" + 0 + ")", 0);
}
function animateRemovePuyoSub(i) {
    if (i > 20) {
        playSE('owanimo');

        display(new Array(), 0, false, 1);
		
        //落下したぷよを反映
        while (_removePuyoArray.length > 0) {
            var tmpPuyo = _removePuyoArray.pop();
            puyoMap[tmpPuyo.x][tmpPuyo.y] = null;

            //ぷよ削除アニメーション
            animationObjList.push(new RemovePuyoAnimation(tmpPuyo));
        }

        // TODO 落ちるぷよがなければ音を出さない。

        // TODO スコアを表示する場所を考える
        document.getElementById('score').innerHTML = score;
        //連鎖数表示アニメーション
        animationObjList.push(new RensaCountTextAnimation(100, 100, ++chainCount));

        setTimeout(doDropPuyo, FRAME_INTERVAL_MSEC);
    } else {
        if (i % 2 == 0) {
            display(_removePuyoArray, 1, true, 1);
		    } else {
            display(new Array(), 0, false, 1);
        }

		setTimeout("animateRemovePuyoSub("+ (i + 1) + ")", FRAME_INTERVAL_MSEC);
    }
}

// キー入力イベント
document.onkeypress = function(e) {
	//alert(e.charCode);
    switch(e.charCode) {
       //case 115 : drop();       break; //s
       case  97 : move_left();  break; //a
       case 100 : move_right(); break; //d
       case 119 : rotate(1)    ; break; //w
       case 106 : rotate(-1)    ; break; //j
       case 107 : rotate(1)    ; break; //k
    }
};
document.onkeydown = function(e) {
    switch(e.keyCode) {
       case 83 : isPressDropKey = true;    break; //s
    }
};
document.onkeyup = function(e) {
    switch(e.keyCode) {
       case 83 : isPressDropKey = false;       break; //s
    }
};


document.addEventListener("touchstart", touchStart, false);
document.addEventListener("touchmove", touchMove, false);
document.addEventListener("touchend", touchEnd, false);
window.onorientationchange = function() {
  //$('#dTurn').html(window.orientation);
}

// for iOS Safari
var touch_start_x;
var touch_start_y;
function touchStart(e) {
    touch_start_x = event.changedTouches[0].pageX;
    touch_start_y = event.changedTouches[0].pageY;
/*
    x = event.changedTouches[0].pageX;
    y = event.changedTouches[0].pageY;
    if (y < 100) {
        rotate(1);
    } else if (x < 180 ) {
        move_left();
    } else {
        move_right();
    }
    */
}

function touchMove(e) {
}

function touchEnd(e) {
    x = event.changedTouches[0].pageX;
    y = event.changedTouches[0].pageY;
    if ((x - touch_start_x) > TOUCH_DRAG_SENSE) {
        rotate(1);
    } else if ((x - touch_start_x) < (TOUCH_DRAG_SENSE * -1)) {
        rotate(-1);
    } else if ((y - touch_start_y) > TOUCH_DRAG_SENSE) {
        hard_drop();
    } else if ((y - touch_start_y) < (TOUCH_DRAG_SENSE * -1)) {
        rotate(1);
        rotate(1);
    } else if (x < 90 ) {
        move_left();
    } else {
        move_right();
    }
}

// 「変更ボタン」が押された
function changeButton() {
    puyoRule.colorNum = document.getElementById('colorNumForm').value;
    puyoRule.owanimoSize = document.getElementById('owanimoSizeForm').value;
    puyoRule.dropRate = document.getElementById('dropRateForm').value;


    puyoImage = new Image();
    puyoImage.src = document.getElementById('puyoImage').value;
}


// **** アニメーションAPI **** //


var AnimationObject = function() {

    this.frameNum;

    this.obj;

    this.draw;

    this.nextFunction;


}

