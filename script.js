// 1. 元素選取與初始變數
const cells = Array.from(document.querySelectorAll('.cell'));
const btnReset = document.getElementById('reset');
const btnResetAll = document.getElementById('reset-all'); 
const turnEl = document.getElementById('turn');
const stateEl = document.getElementById('state');

// 新增：無障礙輔助區域
const announcerEl = document.getElementById('announcer');

// 計分板元素
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawEl = document.getElementById('score-draw');

// 遊戲狀態變數
let board; 
let current; 
let active; 

// 計分用變數
let scoreX = 0;
let scoreO = 0;
let scoreDraw = 0;

// 三格成直線的勝利條件 (8種組合)
const WIN_LINES = [
    [0,1,2], [3,4,5], [6,7,8], 
    [0,3,6], [1,4,7], [2,5,8], 
    [0,4,8], [2,4,6] 
];

// 2. 核心函式
// 輔助函式：發布給無障礙閱讀器
function announce(message) {
    announcerEl.textContent = message;
}

// 起始/重設函式 (init)
function init(){
    board = Array(9).fill(''); 
    current = 'X'; 
    active = true; 
    
    cells.forEach(c=>{
        c.textContent = ''; 
        c.className = 'cell'; 
        c.disabled = false; 
    });
    
    turnEl.textContent = current; 
    stateEl.textContent = ''; 
    turnEl.classList.remove('x', 'o');
    turnEl.classList.add(current.toLowerCase()); // 讓 strong 標籤繼承顏色
    
    announce(`遊戲開始。目前輪到 ${current}。`);
}

// 更新計分板數字 (updateScoreboard)
function updateScoreboard(){
    scoreXEl.textContent = scoreX;
    scoreOEl.textContent = scoreO;
    scoreDrawEl.textContent = scoreDraw;
}

// 換手函式 (switchTurn)
function switchTurn(){
    current = current === 'X' ? 'O' : 'X'; 
    turnEl.textContent = current;
    turnEl.classList.remove('x', 'o');
    turnEl.classList.add(current.toLowerCase());
    
    announce(`換手，目前輪到 ${current}。`);
}

// 下手後計算是否成一線結束遊戲 (evaluate)
function evaluate(){
    for(const line of WIN_LINES){
        const [a,b,c] = line;
        if(board[a] && board[a] === board[b] && board[a] === board[c]){
            return { finished:true, winner:board[a], line }; 
        }
    }
    // 檢查棋盤是否填滿 (平手)
    if(board.every(v=>v)) return { finished:true, winner:null };
    
    return { finished:false }; 
}

// 遊戲結束, 處理勝利或平手 (endGame)
function endGame({winner, line}){
    active = false; 
    
    if (winner) { 
        stateEl.textContent = `${winner}勝利!`;
        stateEl.style.color = winner === 'X' ? 'var(--x)' : 'var(--o)';
        line.forEach(i=> cells[i].classList.add('win')); 
        
        if(winner === 'X') scoreX++; else scoreO++;
        announce(`${winner} 勝利！遊戲結束。`);
    }else{ 
        stateEl.textContent = '平手';
        stateEl.style.color = 'var(--text)'; // 平手使用一般文字色
        scoreDraw++;
        announce(`平手。遊戲結束。`);
    }
    
    updateScoreboard(); 
    cells.forEach(c=> c.disabled = true); 
}

// 下子/下棋函式 (place)
function place(idx){
    if(!active || board[idx]) return; 
    
    board[idx] = current; 
    const cell = cells[idx];
    cell.textContent = current; 
    cell.classList.add(current.toLowerCase()); 
    
    announce(`${current} 在格子 ${idx + 1} 下子。`); // 通知讀屏格子位置
    
    const result = evaluate();
    
    if (result.finished){
        endGame(result);
    }else{
        switchTurn();
    }
}


// 3. 事件綁定與啟動
// 綁定棋盤格點擊事件
cells.forEach(cell=>{
    cell.addEventListener('click', ()=>{
        const idx = +cell.getAttribute('data-idx'); 
        place(idx); 
    });
});

// 綁定事件: 重開遊戲 (保留分數)
btnReset.addEventListener('click', init);

// 綁定事件: 重置計分 (連同遊戲)
btnResetAll.addEventListener('click', ()=>{
    scoreX = scoreO = scoreDraw = 0;
    updateScoreboard();
    init();
    announce("分數已重置，遊戲開始。");
});

// 遊戲啟動
init();
updateScoreboard();