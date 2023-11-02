const Game = (function () {

    const Panel = (function () {

        let panel = [];

        const createPanel = () => {

            for (let i = 0; i < 9; i += 1) {

                panel[i] = null;

            }

        }

        const addValue = (index, currentPlayer) => {

            panel[index] = currentPlayer.getValue();

        }

        const getPanel = () => panel;

        return { createPanel, addValue, getPanel };

    })();

    const Players = (function () {

        const playerOne = createPlayer();
        playerOne.setType("Player");
        playerOne.setValue("x");

        const playerTwo = createPlayer();
        playerTwo.setType("Player");
        playerTwo.setValue("zero");

        function createPlayer() {

            let type;
            const setType = (newType) => type = newType;
            const getType = () => type;

            let difficulty;
            const setDifficulty = (newDifficulty) => difficulty = newDifficulty;
            const getDifficulty = () => difficulty

            let value;
            const setValue = (newValue) => value = newValue;
            const getValue = () => value;

            let score = 0;
            const getScore = () => score > 0 ? score : "-";
            const addScore = () => score++;
            const resetScore = () => score = 0;

            return { setType, getType, setDifficulty, getDifficulty, getValue, setValue, addScore, getScore, resetScore };

        }

        const getPlayerOne = () => playerOne;
        const getPlayerTwo = () => playerTwo;

        return { getPlayerOne, getPlayerTwo }

    })();

    const Computer = (function () {

        const generateRandomValue = () => {

            const mappedSquares = Panel.getPanel().map((square, index) => { if (square == null) { return index } });
            const filteredSquares = mappedSquares.filter(square => square != undefined);
            return filteredSquares[~~(Math.random() * filteredSquares.length)];

        }

        const generateValue = (panel, difficulty) => {

            switch (difficulty) {

                case "easy":

                    return generateRandomValue()
                    break;

                case "medium":

                    if (panel.filter(square => square == 'x').length <= 1) { return generateRandomValue() }

                    else {

                        let bestScore = -Infinity;
                        let bestMove;
                        let moveScores = [];

                        for (let i = 0; i < panel.length; i++) {

                            if (panel[i] == null) {

                                panel[i] = Players.getPlayerTwo().getValue();
                                let score = minimax(panel, 0, false);
                                moveScores.push(score);
                                panel[i] = null;

                                if (score > bestScore) {

                                    bestScore = score;
                                    bestMove = i;

                                }

                            }

                        }

                        if (moveScores.every(moveScore => moveScore === -99)) {

                            bestScore = Infinity;

                            for (let i = 0; i < panel.length; i++) {

                                if (panel[i] == null) {

                                    panel[i] = Players.getPlayerOne().getValue();
                                    let score = minimax(panel, 0, true);
                                    panel[i] = null;

                                    if (score < bestScore) {

                                        bestScore = score;
                                        bestMove = i;

                                    }

                                }

                            }

                        }

                        return bestMove;

                    }

                    break;

                case "unbeatable":

                    let bestScore = -Infinity;
                    let bestMove;
                    let moveScores = [];

                    for (let i = 0; i < panel.length; i++) {

                        if (panel[i] == null) {

                            panel[i] = Players.getPlayerTwo().getValue();
                            let score = minimax(panel, 0, false);
                            moveScores.push(score);
                            panel[i] = null;

                            if (score > bestScore) {

                                bestScore = score;
                                bestMove = i;

                            }

                        }

                    }

                    return bestMove;

            }

        }

        const checkGame = (panel, player) => {

            let foundWinner;;

            const filters = [

                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                [2, 4, 6],
                [0, 4, 8]

            ];

            const findWinner = (first, second, third) => {

                panel[first] == player && panel[second] == player && panel[third] == player ? foundWinner = true : foundWinner = false;

            }

            for (const filter of filters) {

                if (foundWinner) break;
                findWinner(...filter);

            }

            return foundWinner;

        }

        const minimax = (panel, depth, isMaximizing) => {

            const availableSquares = panel.filter(square => square == null);

            if (checkGame(panel, Players.getPlayerTwo().getValue())) { return 100 - depth; }
            else if (checkGame(panel, Players.getPlayerOne().getValue())) { return -100 + depth; }
            else if (availableSquares.length === 0) { return 0; }

            if (isMaximizing) {

                let bestScore = -Infinity;

                for (let i = 0; i < panel.length; i++) {

                    if (panel[i] == null) {

                        panel[i] = Players.getPlayerTwo().getValue();
                        let score = minimax(panel, depth + 1, false);
                        panel[i] = null;
                        bestScore = Math.max(score, bestScore);

                    }

                }

                return bestScore;

            } else {

                let bestScore = Infinity;

                for (let i = 0; i < panel.length; i++) {

                    if (panel[i] == null) {

                        panel[i] = Players.getPlayerOne().getValue();
                        let score = minimax(panel, depth + 1, true);
                        panel[i] = null;
                        bestScore = Math.min(score, bestScore);

                    }

                }

                return bestScore;

            }

        }

        return { generateValue }

    })();

    const Controller = (function () {

        let currentPlayer = Players.getPlayerOne();

        const changeOpponent = () => {

            const opponent = Players.getPlayerTwo()
            const opponentType = opponent.getType();
            const opponentDifficulty = opponent.getDifficulty();

            const setValues = (type, difficulty) => {

                opponent.setType(type);
                opponent.setDifficulty(difficulty);

            }

            if (opponentType == 'Player') { setValues('Computer', 'easy') }

            if (opponentDifficulty == 'easy') { setValues('Computer', 'medium') }

            if (opponentDifficulty == 'medium') { setValues('Computer', 'unbeatable') }

            if (opponentType == 'Computer' && opponentDifficulty == 'unbeatable') { setValues('Player', '') }

            Renderer.displayOpponentType(opponent.getType())
            Renderer.displayOpponentDifficulty(opponent.getDifficulty())

            resetGame();
            resetScore();

        }

        const playTurn = (e) => {

            Renderer.displayValue(e.target.dataset.index, currentPlayer);
            InputHandler.disableSquare(e.target.dataset.index);
            Panel.addValue(e.target.dataset.index, currentPlayer);
            checkGame();

            if (currentPlayer.getType() == 'Computer') { playComputerTurn() }

        }

        const playComputerTurn = () => {

            InputHandler.disablePanel();

            const generatedValue = Computer.generateValue(Panel.getPanel(), currentPlayer.getDifficulty());

            setTimeout(() => {

                Renderer.displayValue(generatedValue, currentPlayer);
                InputHandler.disableSquare(generatedValue);
                Panel.addValue(generatedValue, currentPlayer);
                InputHandler.enablePanel();
                checkGame();

            }, 500)

        }

        const checkGame = () => {

            let gameEnded;
            const panel = Panel.getPanel();
            const currentPlayerValue = currentPlayer.getValue();

            const filters = [

                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                [2, 4, 6],
                [0, 4, 8]

            ];

            const findWinner = (first, second, third) => {

                if (

                    panel[first] == currentPlayerValue &&
                    panel[second] == currentPlayerValue &&
                    panel[third] == currentPlayerValue

                ) {

                    gameEnded = true;
                    Renderer.displayWinningPath(first, second, third);
                    endGame("winner");

                }

            }

            for (const filter of filters) {

                if (gameEnded) break;

                findWinner(...filter);

            }

            if (!gameEnded && panel.every(value => value != null)) {

                gameEnded = true;
                endGame();

            }

            if (!gameEnded) {

                switchPlayerTurn();
                Renderer.displayTurn(currentPlayer);

            }

        }

        const switchPlayerTurn = () => {

            currentPlayer == Players.getPlayerOne() ?
                currentPlayer = Players.getPlayerTwo() :
                currentPlayer = Players.getPlayerOne();

        }

        const resetScore = () => {

            Players.getPlayerOne().resetScore();
            Players.getPlayerTwo().resetScore();
            Renderer.updateScore(Players.getPlayerOne(), Players.getPlayerTwo());

        }

        const resetGame = () => {

            Renderer.refreshPanel();
            Renderer.removeWinningPath();
            Renderer.hideWinner(currentPlayer);
            currentPlayer = Players.getPlayerOne();
            Renderer.displayTurn(currentPlayer);
            InputHandler.enablePanel();
            InputHandler.enableSquares();
            InputHandler.disablePlayButton();
            Panel.createPanel();

        }

        const endGame = (condition) => {

            InputHandler.disablePanel();

            const gameWon = () => {

                currentPlayer.addScore();
                Renderer.displayWinner(currentPlayer);
                Renderer.updateScore(Players.getPlayerOne(), Players.getPlayerTwo());

            }

            const tie = () => { Renderer.hideTurn(currentPlayer); }

            condition == 'winner' ? gameWon() : tie();

            InputHandler.enablePlayButton();

        }

        return { changeOpponent, resetGame, resetScore, playTurn };

    })();

    const Renderer = (function () {

        const opponentButton = document.querySelector('.change-opponent');
        const resetButton = document.querySelector('.reset-score');
        const playAgainButton = document.querySelector('.play-again');
        const panelContainer = document.querySelector('.panel-container');
        const squares = panelContainer.getElementsByClassName('square');

        const getOpponentButton = () => opponentButton;
        const getResetButton = () => resetButton;
        const getPlayAgainButton = () => playAgainButton;
        const getPanelContainer = () => panelContainer;
        const getSquares = () => squares;


        const renderPanel = () => {

            panelContainer.textContent = "";

            Panel.getPanel().forEach((value, index) => {

                const square = document.createElement("button");
                square.dataset.index = index;
                square.classList.add("square");
                panelContainer.appendChild(square);

            })

        };

        const refreshPanel = () => {

            for (let square of squares) {

                square.classList.remove('x');
                square.classList.remove('zero');
                square.textContent = "";

            }

        }

        const displayOpponentType = (opponentType) => {

            opponentButton.querySelector('.opponent-type').textContent = opponentType;

        }

        const displayOpponentDifficulty = (opponentDifficulty) => {

            opponentButton.querySelector('.opponent-difficulty').textContent = opponentDifficulty;

        }

        const displayValue = (index, currentPlayer) => {

            squares[index].classList.add(currentPlayer.getValue());
            squares[index].textContent = ".";

        }


        const displayTurn = (currentPlayer) => {

            document.getElementById(currentPlayer.getValue()).classList.add('show');
            document.getElementById(currentPlayer.getValue() == "x" ? "zero" : "x").classList.remove('show');

        }

        const hideTurn = (currentPlayer) => {

            document.getElementById(currentPlayer.getValue()).classList.remove('show');

        }

        const updateScore = (playerOne, playerTwo) => {

            document.getElementById(playerOne.getValue()).lastElementChild.textContent = playerOne.getScore();
            document.getElementById(playerTwo.getValue()).firstElementChild.textContent = playerTwo.getScore();

        }

        const displayWinner = (winner) => {

            document.getElementById(winner.getValue()).classList.add('winner');

        }

        const hideWinner = (winner) => {

            document.getElementById(winner.getValue()).classList.remove('winner');

        }

        const displayWinningPath = (first, second, third) => {

            squares[first].classList.add('winner');
            squares[second].classList.add('winner');
            squares[third].classList.add('winner');

        }

        const removeWinningPath = () => {

            for (let square of squares) {

                square.classList.remove('winner');

            }

        }

        return { getOpponentButton, getResetButton, getPlayAgainButton, getPanelContainer, getSquares, displayOpponentType, displayOpponentDifficulty, renderPanel, refreshPanel, displayTurn, hideTurn, updateScore, displayValue, displayWinner, hideWinner, displayWinningPath, removeWinningPath };

    })();

    const InputHandler = (function () {

        Renderer.getOpponentButton().addEventListener('click', Controller.changeOpponent);;
        Renderer.getResetButton().addEventListener('click', Controller.resetScore);
        Renderer.getPlayAgainButton().addEventListener('click', Controller.resetGame);

        const attachClickEvents = () => {

            for (let square of Renderer.getSquares()) {

                square.addEventListener('click', Controller.playTurn);

            }

        }

        const enablePlayButton = () => {

            setTimeout(() => {

                Renderer.getPlayAgainButton().classList.add('clickable');
                Renderer.getPlayAgainButton().style.pointerEvents = "auto";

            }, 300)

        }

        const disablePlayButton = () => {

            setTimeout(() => {

                Renderer.getPlayAgainButton().classList.remove('clickable');
                Renderer.getPlayAgainButton().style.pointerEvents = "none";

            }, 300)

        }

        const enablePanel = () => {
            Renderer.getPanelContainer().style.pointerEvents = "auto";
        }

        const disablePanel = () => {
            Renderer.getPanelContainer().style.pointerEvents = "none";
        }


        const disableSquare = (index) => {

            Renderer.getSquares()[index].style.pointerEvents = "none";

        }

        const enableSquares = () => {

            for (const square of Renderer.getSquares()) {
                square.style.pointerEvents = "inherit"
            }

        }

        return { attachClickEvents, enablePanel, disablePanel, enableSquares, disableSquare, enablePlayButton, disablePlayButton };

    })()

    Panel.createPanel();
    Renderer.renderPanel();
    Renderer.displayOpponentType(Players.getPlayerTwo().getType());
    Renderer.displayTurn(Players.getPlayerOne());
    InputHandler.attachClickEvents();

})();

