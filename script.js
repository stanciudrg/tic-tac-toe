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

    return { getPanelContainer, displayOpponentType, displayOpponentDifficulty, getSquares, getOpponentButton, hideTurn, getResetButton, getPlayAgainButton, renderPanel, refreshPanel, updateScore, displayValue, displayTurn, displayWinner, hideWinner, displayWinningPath, removeWinningPath };

})();