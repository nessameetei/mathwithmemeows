class MathGame {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.currentProblem = null;
        this.selectedAnswer = null;
        this.selectedTile = null;
        this.tilesDisabled = false;
        this.initializeElements();
        this.bindEvents();
        this.generateNewProblem();
        this.loadScore();
    }

    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.correctCountElement = document.getElementById('correct-count');
        this.wrongCountElement = document.getElementById('wrong-count');
        this.num1Element = document.getElementById('num1');
        this.operatorElement = document.getElementById('operator');
        this.num2Element = document.getElementById('num2');
        this.answerTilesContainer = document.getElementById('answer-tiles');
        this.submitBtn = document.getElementById('submit-btn');
        this.newProblemBtn = document.getElementById('new-problem-btn');
        this.resetScoreBtn = document.getElementById('reset-score-btn');
        this.feedbackElement = document.getElementById('feedback');
        this.emojiElement = document.getElementById('emoji');
        this.messageElement = document.getElementById('message');
    }

    bindEvents() {
        this.submitBtn.addEventListener('click', () => this.checkAnswer());
        this.newProblemBtn.addEventListener('click', () => this.generateNewProblem());
        this.resetScoreBtn.addEventListener('click', () => this.resetScore());
    }

    generateNewProblem() {
        this.tilesDisabled = false;
        const operators = ['+', '-', '×'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        let num1, num2, answer;
        const maxNumber = Math.min(10 + this.level * 5, 50);
        switch (operator) {
            case '+':
                num1 = Math.floor(Math.random() * maxNumber) + 1;
                num2 = Math.floor(Math.random() * maxNumber) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * maxNumber) + 10;
                num2 = Math.floor(Math.random() * num1) + 1;
                answer = num1 - num2;
                break;
            case '×':
                num1 = Math.floor(Math.random() * Math.min(12, maxNumber / 2)) + 1;
                num2 = Math.floor(Math.random() * Math.min(12, maxNumber / 2)) + 1;
                answer = num1 * num2;
                break;
        }
        this.currentProblem = { num1, num2, operator, answer };
        this.num1Element.textContent = num1;
        this.operatorElement.textContent = operator;
        this.num2Element.textContent = num2;
        this.selectedAnswer = null;
        this.selectedTile = null;
        this.renderAnswerTiles();
        this.hideFeedback();
    }

    renderAnswerTiles() {
        // Generate 20 random wrong answers and 1 correct answer
        const correct = this.currentProblem.answer;
        const answers = new Set([correct]);
        while (answers.size < 21) {
            let delta = Math.floor(Math.random() * 30) + 1;
            let wrong = Math.random() < 0.5 ? correct + delta : correct - delta;
            if (wrong < 0) wrong = Math.abs(wrong) + 1;
            answers.add(wrong);
        }
        // Shuffle answers
        const answerArr = Array.from(answers);
        for (let i = answerArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [answerArr[i], answerArr[j]] = [answerArr[j], answerArr[i]];
        }
        // Render tiles
        this.answerTilesContainer.innerHTML = '';
        answerArr.forEach(val => {
            const tile = document.createElement('div');
            tile.className = 'answer-tile';
            tile.textContent = val;
            tile.tabIndex = 0;
            tile.addEventListener('click', () => this.selectTile(tile, val));
            tile.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.selectTile(tile, val);
                }
            });
            this.answerTilesContainer.appendChild(tile);
        });
    }

    selectTile(tile, value) {
        if (this.tilesDisabled) return;
        // Remove selected from all tiles
        Array.from(this.answerTilesContainer.children).forEach(t => t.classList.remove('selected'));
        tile.classList.add('selected');
        this.selectedAnswer = value;
        this.selectedTile = tile;
    }

    checkAnswer() {
        if (this.selectedAnswer === null || !this.selectedTile) {
            this.showFeedback('Please select an answer tile!', '🤔', false);
            return;
        }
        this.tilesDisabled = true;
        const isCorrect = this.selectedAnswer === this.currentProblem.answer;
        // Reveal memeow or poop in the selected tile
        const revealDiv = document.createElement('div');
        revealDiv.className = 'tile-reveal';
        if (isCorrect) {
            revealDiv.innerHTML = '<img src="images/memeow.png" alt="Memeow" />';
        } else {
            revealDiv.textContent = '💩';
        }
        this.selectedTile.appendChild(revealDiv);
        // Usual feedback and scoring
        if (isCorrect) {
            this.score += 10;
            this.correctCount++;
            this.showFeedback('Great job! You got it right!', '🐱', true);
            this.puzzleCard.classList.add('success');
            if (this.score % 50 === 0) {
                this.level++;
                this.showLevelUpMessage();
            }
        } else {
            this.wrongCount++;
            this.showFeedback(`Oops! The correct answer was ${this.currentProblem.answer}`, '💩', false);
            this.puzzleCard.classList.add('error');
        }
        this.updateScore();
        this.saveScore();
        setTimeout(() => {
            this.puzzleCard.classList.remove('success', 'error');
        }, 600);
        setTimeout(() => {
            this.generateNewProblem();
        }, 2000);
    }

    showFeedback(message, emoji, isCorrect) {
        if (isCorrect) {
            this.emojiElement.innerHTML = '<img src="images/memeow.png" alt="Memeow" class="feedback-memeow" />';
        } else {
            this.emojiElement.textContent = emoji;
        }
        this.messageElement.textContent = message;
        this.messageElement.style.color = isCorrect ? '#27ae60' : '#e74c3c';
        this.feedbackElement.classList.add('show');
    }

    hideFeedback() {
        this.feedbackElement.classList.remove('show');
    }

    showLevelUpMessage() {
        const levelUpDiv = document.createElement('div');
        levelUpDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff9a9e, #fecfef);
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            font-size: 1.5rem;
            font-weight: bold;
            color: white;
            z-index: 1000;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: popIn 0.5s ease;
        `;
        levelUpDiv.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 10px;">🎉</div>
            <div>Level Up!</div>
            <div style="font-size: 1rem; margin-top: 10px;">You're now at level ${this.level}</div>
        `;
        document.body.appendChild(levelUpDiv);
        setTimeout(() => {
            document.body.removeChild(levelUpDiv);
        }, 3000);
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.correctCountElement.textContent = this.correctCount;
        this.wrongCountElement.textContent = this.wrongCount;
    }

    resetScore() {
        this.score = 0;
        this.level = 1;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.updateScore();
        this.saveScore();
        this.generateNewProblem();
        this.hideFeedback();
    }

    saveScore() {
        localStorage.setItem('mathGameScore', this.score.toString());
        localStorage.setItem('mathGameLevel', this.level.toString());
        localStorage.setItem('mathGameCorrect', this.correctCount.toString());
        localStorage.setItem('mathGameWrong', this.wrongCount.toString());
    }

    loadScore() {
        const savedScore = localStorage.getItem('mathGameScore');
        const savedLevel = localStorage.getItem('mathGameLevel');
        const savedCorrect = localStorage.getItem('mathGameCorrect');
        const savedWrong = localStorage.getItem('mathGameWrong');
        if (savedScore) {
            this.score = parseInt(savedScore);
        }
        if (savedLevel) {
            this.level = parseInt(savedLevel);
        }
        if (savedCorrect) {
            this.correctCount = parseInt(savedCorrect);
        }
        if (savedWrong) {
            this.wrongCount = parseInt(savedWrong);
        }
        this.updateScore();
    }

    get puzzleCard() {
        return document.querySelector('.puzzle-card');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MathGame();
});

// Add some fun sound effects (optional)
function playSound(type) {
    // This is a placeholder for sound effects
    // You could add actual sound files and play them here
    console.log(`Playing ${type} sound`);
}

// Add confetti effect for correct answers (optional)
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            pointer-events: none;
            z-index: 999;
            animation: fall 3s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            document.body.removeChild(confetti);
        }, 3000);
    }
}

// Add CSS for confetti animation
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
        }
    }
`;
document.head.appendChild(confettiStyle); 