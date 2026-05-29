// 面向对象 河内塔游戏类 满足课程要求
class HanoiGame {
    constructor() {
        // 游戏状态对象 要求必写结构
        this.gameState = {
            disksCount: 5,
            pegs: [[], [], []], // 三根柱子 栈数组
            moveCount: 0,
            isAutoSolving: false,
            selectedPegIndex: null,
            selectedDiskSize: null
        };

        // DOM元素
        this.pegEls = document.querySelectorAll('.peg');
        this.warnEl = document.getElementById('warnText');
        this.winEl = document.getElementById('winText');
        this.moveNumEl = document.getElementById('moveNum');
        this.diskNumEl = document.getElementById('diskNum');
        this.sliderEl = document.getElementById('diskSlider');
        this.resetBtn = document.getElementById('resetBtn');
        this.autoSolveBtn = document.getElementById('autoSolveBtn');

        this.initEvent();
        this.initGame(5);
    }

    // 初始化事件监听
    initEvent() {
        // 滑块改变圆盘数量
        this.sliderEl.addEventListener('change', () => {
            const num = parseInt(this.sliderEl.value);
            this.diskNumEl.innerText = num;
            this.initGame(num);
        });

        // 柱子点击事件
        this.pegEls.forEach(peg => {
            peg.addEventListener('click', () => {
                if (this.gameState.isAutoSolving) return;
                const idx = parseInt(peg.dataset.index);
                this.handlePegClick(idx);
            });
        });

        // 重置按钮
        this.resetBtn.addEventListener('click', () => {
            if (this.gameState.isAutoSolving) return;
            this.initGame(this.gameState.disksCount);
        });

        // 自动解题按钮
        this.autoSolveBtn.addEventListener('click', () => {
            if (this.gameState.isAutoSolving) return;
            this.autoSolve();
        });
    }

    // 初始化游戏 重置状态
    initGame(count) {
        // 清空DOM圆盘
        this.clearDiskDom();

        // 重置状态
        this.gameState.disksCount = count;
        this.gameState.moveCount = 0;
        this.gameState.isAutoSolving = false;
        this.gameState.selectedPegIndex = null;
        this.gameState.selectedDiskSize = null;
        this.gameState.pegs = [[], [], []];

        // 初始化A柱圆盘 3~8个 从小到大入栈
        for (let i = count; i >= 1; i--) {
            this.gameState.pegs[0].push(i);
        }

        this.moveNumEl.innerText = 0;
        this.warnEl.style.opacity = 0;
        this.winEl.style.display = 'none';

        // 渲染圆盘
        this.renderDisk();
    }

    // 清空所有圆盘DOM
    clearDiskDom() {
        this.pegEls.forEach(peg => peg.innerHTML = '');
    }

    // 渲染所有圆盘 用到forEach
    renderDisk() {
        this.clearDiskDom();
        const maxWidth = 180;
        const minWidth = 60;
        const step = (maxWidth - minWidth) / (this.gameState.disksCount - 1);

        // 遍历三根柱子 forEach 必用数组方法
        this.gameState.pegs.forEach((pegStack, pegIdx) => {
            const pegEl = this.pegEls[pegIdx];
            // 遍历当前柱子圆盘
            pegStack.forEach((size, diskIdx) => {
                const disk = document.createElement('div');
                disk.className = 'disk';
                // 圆盘宽度按大小比例
                const width = minWidth + (size - 1) * step;
                disk.style.width = `${width}px`;
                // 定位堆叠
                disk.style.bottom = `${diskIdx * 30 + 10}px`;
                disk.dataset.size = size;
                pegEl.appendChild(disk);

                // 选中样式
                if (this.gameState.selectedPegIndex === pegIdx 
                    && this.gameState.selectedDiskSize === size) {
                    disk.classList.add('selected');
                }
            });
        });
    }

    // 柱子点击逻辑：选盘 / 放盘
    handlePegClick(pegIdx) {
        const { selectedPegIndex, pegs } = this.gameState;

        // 未选中任何盘子 → 选中当前柱子最上面盘子
        if (selectedPegIndex === null) {
            if (pegs[pegIdx].length === 0) return;
            // pop取栈顶 不修改原数组 先获取
            const topDisk = pegs[pegIdx][pegs[pegIdx].length - 1];
            this.gameState.selectedPegIndex = pegIdx;
            this.gameState.selectedDiskSize = topDisk;
            this.renderDisk();
            return;
        }

        // 已选中盘子 → 尝试放置到目标柱子
        if (selectedPegIndex === pegIdx) {
            // 点击同一柱子 取消选中
            this.gameState.selectedPegIndex = null;
            this.gameState.selectedDiskSize = null;
            this.renderDisk();
            return;
        }

        // 校验走法是否合法
        if (!this.isValidMove(selectedPegIndex, pegIdx)) {
            this.showWarn('⚠️ 无法放置更大的圆盘！');
            return;
        }

        // 执行合法移动
        this.executeMove(selectedPegIndex, pegIdx);
    }

    // 校验移动规则：大盘不能放小盘上
    isValidMove(fromIdx, toIdx) {
        const fromStack = this.gameState.pegs[fromIdx];
        const toStack = this.gameState.pegs[toIdx];
        const topFrom = fromStack[fromStack.length - 1];
        const topTo = toStack.length ? toStack[toStack.length - 1] : null;

        return topTo === null || topFrom < topTo;
    }

    // 执行移动 push/pop 必用数组方法
    executeMove(fromIdx, toIdx) {
        const fromStack = this.gameState.pegs[fromIdx];
        const toStack = this.gameState.pegs[toIdx];

        // 出栈、入栈
        const disk = fromStack.pop();
        toStack.push(disk);

        // 步数+1
        this.gameState.moveCount++;
        this.moveNumEl.innerText = this.gameState.moveCount;

        // 清空选中状态
        this.gameState.selectedPegIndex = null;
        this.gameState.selectedDiskSize = null;

        // 重新渲染
        this.renderDisk();

        // 检测是否胜利
        this.checkWin();
    }

    // 显示警告文字+动画
    showWarn(text) {
        this.warnEl.innerText = text;
        this.warnEl.style.opacity = 1;
        setTimeout(() => {
            this.warnEl.style.opacity = 0;
        }, 1200);
    }

    // 检测胜利：所有圆盘到第三根柱子
    checkWin() {
        const total = this.gameState.disksCount;
        const targetStack = this.gameState.pegs[2];
        if (targetStack.length === total) {
            setTimeout(() => {
                this.winEl.style.display = 'block';
            }, 500);
        }
    }

    // 递归自动解题 + 延迟分步演示
    async autoSolve() {
        this.gameState.isAutoSolving = true;
        // 禁用按钮
        this.resetBtn.disabled = true;
        this.autoSolveBtn.disabled = true;

        // 先重置到初始状态
        this.initGame(this.gameState.disksCount);
        await this.sleep(600);

        // 递归求解
        await this.hanoiRecursive(
            this.gameState.disksCount,
            0, 2, 1
        );

        // 结束恢复
        this.gameState.isAutoSolving = false;
        this.resetBtn.disabled = false;
        this.autoSolveBtn.disabled = false;
    }

    // 递归核心算法
    async hanoiRecursive(n, from, to, temp) {
        if (n === 0) return;
        await this.hanoiRecursive(n - 1, from, temp, to);
        
        // 执行一步移动
        if (this.isValidMove(from, to)) {
            this.executeMove(from, to);
            await this.sleep(700);
        }

        await this.hanoiRecursive(n - 1, temp, to, from);
    }

    // 延时工具
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 页面加载初始化游戏
window.onload = () => {
    new HanoiGame();
};