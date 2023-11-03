const Game = (function () {

    // Panel module, responsible for creating the internal game

    const Panel = (function () {

        let _panel = [];

        // Pushes 9 elements into the panel array, each set to the value of null. The resulting array is where
        // the game is being played internally.

        const createPanel = () => {

            for (let i = 0; i < 9; i += 1) {

                _panel[i] = null;

            }

        }

        // Adds a the value of the currentPlayer (x or zero) at the specified panel array index

        const addValue = (index, currentPlayer) => {

            _panel[index] = currentPlayer.getValue();

        }

        const getPanel = () => _panel;

        return { createPanel, addValue, getPanel };

    })();

    // Players module, responsible for creating and managing the two Players

    const Players = (function () {

        // The default playerOne, which is always a "Human" type (in this case, the User), 
        // and has a value of "x", as he is always playing the first move

        const _playerOne = _createPlayer('Human', 'none', 'x', 0);

        // The default playerTwo, which is always second, and always has a value of "zero". In contrast 
        // with the firstPlayer, playerTwo can also be of "Computer" type, and can also have a difficulty 
        // level (easy, medium, unbeatable);

        const _playerTwo = _createPlayer('Human', 'none', 'zero', 0);

        // The createPlayer constructor function, which creates the player object with multiple methods

        function _createPlayer(type, difficulty, value, score) {

            // setType method allows for the type of the player to be changed between "Human" and "Computer"

            const setType = (newType) => type = newType;
            const getType = () => type;

            // setDifficulty method sets the difficulty of the player when the player type is of "Computer"

            const setDifficulty = (newDifficulty) => difficulty = newDifficulty;
            const getDifficulty = () => difficulty

            const getValue = () => value;

            // getScore returns the score or '-' when the score is 0
            // addScore method increments the score by 1 when called

            const getScore = () => score > 0 ? score : "-";
            const addScore = () => score++;
            const resetScore = () => score = 0;

            return { setType, getType, setDifficulty, getDifficulty, getValue, addScore, getScore, resetScore };

        }

        const getPlayerOne = () => _playerOne;
        const getPlayerTwo = () => _playerTwo;

        return { getPlayerOne, getPlayerTwo }

    })();

    // The Controller module, responsible for taking input and using it to control the internal
    // state of the game, while reflecting all changes to the Renderer module

    const Controller = (function () {

        // Keep track of the current player
        let _currentPlayer = Players.getPlayerOne();

        // Change the opponent type and difficulty (if applicable), and send the changes to the Renderer
        const changeOpponent = () => {

            const opponent = Players.getPlayerTwo()
            const opponentType = opponent.getType();
            const opponentDifficulty = opponent.getDifficulty();

            const setValues = (type, difficulty) => {

                opponent.setType(type);
                opponent.setDifficulty(difficulty);

            }

            if (opponentType == 'Human') { setValues('Computer', 'easy') }

            if (opponentDifficulty == 'easy') { setValues('Computer', 'medium') }

            if (opponentDifficulty == 'medium') { setValues('Computer', 'unbeatable') }

            if (opponentType == 'Computer' && opponentDifficulty == 'unbeatable') { setValues('Human', '') }

            Renderer.displayOpponentType(opponent.getType())
            Renderer.displayOpponentDifficulty(opponent.getDifficulty())

            resetGame();
            resetScore();

        }

        // Use the values provided by the InputHandler module to add the value of the current player
        // in the selected square, both on screen and within the internal game, then check the status of
        // the game to see whether a winner is found or if there are any available squares left.
        const _makeMove = (target) => {

            Renderer.displayValue(target, _currentPlayer);
            InputHandler.disableSquare(target);
            Panel.addValue(target, _currentPlayer);

        }

        const playTurn = (e) => {

            _makeMove(e.target.dataset.index);
            _checkGame();

            // If after checking the game and calling the switchPlayer() function the current player became "Computer"
            if (_currentPlayer.getType() == 'Computer') {

                // Disable input for "Human" while playing computer turn
                InputHandler.disablePanel();
                // Ask the Computer module to generate a value based on the Panel status and difficulty level and store the value
                const generatedValue = Computer.generateValue(Panel.getPanel(), _currentPlayer.getDifficulty());
                setTimeout(() => {

                    // Use the values provided by the Computer module to add the value of the current player
                    // in the selected square, both on screen and within the internal game, then check the status of
                    // the game to see whether a winner is found or if there are any available squares left.
                    _makeMove(generatedValue)
                    InputHandler.enablePanel();
                    _checkGame();

                }, 500)

            }

        }

        // A more complicated version of the checkGame function
        const _checkGame = () => {

            // If a winner or a tie is found, gameEnded becomes true
            let gameEnded;
            const panel = Panel.getPanel();
            const currentPlayerValue = _currentPlayer.getValue();

            // Winning combinations - horizontal, vertical, diagonal
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
                    // If a winner is found, send the winning combination to Renderer so it can display the winning path
                    gameEnded = true;
                    Renderer.displayWinningPath(first, second, third);
                    _endGame("winner");

                }

            }

            for (const filter of filters) {

                if (gameEnded) break;

                findWinner(...filter);

            }

            // If a winner is not found but no available squares are left, assume it's a tie and endGame()
            if (!gameEnded && panel.every(value => value != null)) {

                gameEnded = true;
                _endGame();

            }

            // While the game is running, keep switching the player turn after each game check, and notify the Renderer
            // that it also needs to reflect the current player on screen

            if (!gameEnded) {

                _switchPlayerTurn();
                Renderer.displayTurn(_currentPlayer);

            }

        }

        const _switchPlayerTurn = () => {

            _currentPlayer == Players.getPlayerOne() ?
                _currentPlayer = Players.getPlayerTwo() :
                _currentPlayer = Players.getPlayerOne();

        }

        const resetScore = () => {

            Players.getPlayerOne().resetScore();
            Players.getPlayerTwo().resetScore();
            Renderer.updateScore(Players.getPlayerOne(), Players.getPlayerTwo());

        }

        const resetGame = () => {

            Renderer.refreshPanel();
            Renderer.removeWinningPath();
            Renderer.hideWinner(_currentPlayer);
            _currentPlayer = Players.getPlayerOne();
            Renderer.displayTurn(_currentPlayer);
            // Re-enable input for panel and its squares
            InputHandler.attachClickEvents();
            InputHandler.enablePanel();
            // Disable input for Play Again button
            InputHandler.disablePlayButton();
            // Create new internal panel
            Panel.createPanel();

        }

        const _endGame = (condition) => {

            InputHandler.disablePanel();

            const gameWon = () => {

                _currentPlayer.addScore();
                Renderer.displayWinner(_currentPlayer);
                Renderer.updateScore(Players.getPlayerOne(), Players.getPlayerTwo());

            }

            // If the game ended with a tie, stop showing the turn of the current player. With the help of CSS,
            // this will remove the color that represents the fact that a certain player is currently playing,
            // making both players look the same on screen, which signifies a tie
            const tie = () => { Renderer.hideTurn(_currentPlayer); }

            condition == 'winner' ? gameWon() : tie();

            // Re-enable input for "Play again" button
            InputHandler.enablePlayButton();

        }

        return { changeOpponent, resetGame, resetScore, playTurn };

    })();

    // The Renderer module, responsible for displaying the internal status of the game on screen

    const Renderer = (function () {

        // Caching the DOM
        const _opponentButton = document.querySelector('.change-opponent');
        const _opponentTypeInfo = _opponentButton.querySelector('.opponent-type');
        const _opponentDifficultyInfo = _opponentButton.querySelector('.opponent-difficulty');
        const _resetButton = document.querySelector('.reset-score');
        const _playAgainButton = document.querySelector('.play-again');
        const _xInfo = document.querySelector('#x');
        const _xScore = _xInfo.querySelector('.score');
        const _zeroInfo = document.querySelector('#zero');
        const _zeroScore = _zeroInfo.querySelector('.score');
        const _panelContainer = document.querySelector('.panel-container');
        const _squares = _panelContainer.getElementsByClassName('square');

        const getOpponentButton = () => _opponentButton;
        const getResetButton = () => _resetButton;
        const getPlayAgainButton = () => _playAgainButton;
        const getPanelContainer = () => _panelContainer;
        const getSquares = () => _squares;

        // Create a square element for each panel array item and set the index for each square element to the index
        // of its corresponding array item
        const renderPanel = () => {

            _panelContainer.textContent = "";

            Panel.getPanel().forEach((value, index) => {

                const square = document.createElement("button");
                square.dataset.index = index;
                square.classList.add("square");
                _panelContainer.appendChild(square);

            })

        };

        const refreshPanel = () => {

            for (let square of _squares) {

                square.classList.remove('x');
                square.classList.remove('zero');
                square.textContent = "";

            }

        }

        const displayOpponentType = (opponentType) => {

            if (opponentType == 'Human') { _opponentTypeInfo.textContent = "Player"; }
            else { _opponentTypeInfo.textContent = opponentType }

        }

        const displayOpponentDifficulty = (opponentDifficulty) => {

            _opponentDifficultyInfo.textContent = opponentDifficulty;

        }

        const displayValue = (index, currentPlayer) => {

            _squares[index].classList.add(currentPlayer.getValue());
            // Adding '.' to the square element ensures that the CSS :empty selector no longer works, which is used
            // to add a hover effect that should only be working when the square is empty
            _squares[index].textContent = ".";

        }


        const displayTurn = (currentPlayer) => {

            currentPlayer.getValue() == "x" ?
                _xInfo.classList.add('show') & _zeroInfo.classList.remove('show') :
                _zeroInfo.classList.add('show') & _xInfo.classList.remove('show');

        }

        const hideTurn = (currentPlayer) => {

            currentPlayer.getValue() == "x" ?
                _xInfo.classList.remove('show') :
                _zeroInfo.classList.remove('show');

        }

        const updateScore = (playerOne, playerTwo) => {

            _xScore.textContent = playerOne.getScore();
            _zeroScore.textContent = playerTwo.getScore();

        }

        const displayWinner = (winner) => {

            winner.getValue() == 'x' ?
                _xInfo.classList.add('winner') :
                _zeroInfo.classList.add('winner')

        }

        const hideWinner = (winner) => {

            winner.getValue() == 'x' ?
                _xInfo.classList.remove('winner') :
                _zeroInfo.classList.remove('winner')

        }

        const displayWinningPath = (first, second, third) => {

            _squares[first].classList.add('winner');
            _squares[second].classList.add('winner');
            _squares[third].classList.add('winner');

        }

        const removeWinningPath = () => {

            for (let square of _squares) {

                square.classList.remove('winner');

            }

        }

        return { getOpponentButton, getResetButton, getPlayAgainButton, getPanelContainer, getSquares, displayOpponentType, displayOpponentDifficulty, renderPanel, refreshPanel, displayTurn, hideTurn, updateScore, displayValue, displayWinner, hideWinner, displayWinningPath, removeWinningPath };

    })();

    // The InputHandler module, which is responsible for gathering all the elements provided by the Renderer
    // and adding Event Listeners to them. The event listeners are further responsible for sending
    // input information to the Controller module, which controls the flow of the game

    const InputHandler = (function () {

        Renderer.getOpponentButton().addEventListener('click', Controller.changeOpponent);;
        Renderer.getResetButton().addEventListener('click', Controller.resetScore);

        const attachClickEvents = () => {

            for (let square of Renderer.getSquares()) {

                square.addEventListener('click', Controller.playTurn);
                square.removeAttribute('inert');

            }

        }

        const enablePlayButton = () => {

            setTimeout(() => {

                Renderer.getPlayAgainButton().addEventListener('click', Controller.resetGame);
                Renderer.getPlayAgainButton().classList.add('clickable');
                Renderer.getPlayAgainButton().removeAttribute('inert', 'false');
                Renderer.getPlayAgainButton().focus();

            }, 300)

        }

        const disablePlayButton = () => {

            setTimeout(() => {

                Renderer.getPlayAgainButton().removeEventListener('click', Controller.resetGame);
                Renderer.getPlayAgainButton().classList.remove('clickable');
                Renderer.getPlayAgainButton().setAttribute('inert', 'true');
                Renderer.getPlayAgainButton().blur();

            }, 300)

        }

        const enablePanel = () => {

            Renderer.getPanelContainer().removeAttribute('inert');

        }

        const disablePanel = () => {

            Renderer.getPanelContainer().setAttribute('inert', 'true');

        }


        const disableSquare = (index) => {

            Renderer.getSquares()[index].removeEventListener('click', Controller.playTurn);
            Renderer.getSquares()[index].setAttribute('inert', 'true');
            Renderer.getSquares()[index].blur();

        }

        return { attachClickEvents, enablePanel, disablePanel, disableSquare, enablePlayButton, disablePlayButton };

    })()

    // Computer module, responsible for generating the Computer move when the opponent type is set to "Computer"

    const Computer = (function () {

        // Generates a random value from all available values

        const _generateRandomValue = () => {

            const mappedSquares = Panel.getPanel().map((square, index) => { if (square == null) { return index } });
            const filteredSquares = mappedSquares.filter(square => square != undefined);
            return filteredSquares[~~(Math.random() * filteredSquares.length)];

        }

        // The main generateValue function, which takes the current panel status and the difficulty level as arguments, and generates
        // different moves based on the difficulty

        // All non random moves are generated using the minimax algorithm, which makes the Computer unbeatable unless the
        // first move it makes is random

        const generateValue = (panel, difficulty) => {

            switch (difficulty) {

                // When difficulty is set to easy, generate only random moves

                case "easy":

                    return _generateRandomValue()
                    break;

                // When difficulty is set to medium, make sure that the first move is always random, and then start generating moves
                // using the minimax algorithm. This ensures that the player has a chance of winning

                case "medium":

                    if (panel.filter(square => square == 'x').length <= 1) { return _generateRandomValue() }

                    else {

                        // The beginning of the minimax algorithm

                        // Start from the lowest possible score
                        let bestScore = -Infinity;
                        // Store the best move generated by the current iteration
                        let bestMove;
                        // Store the score of all moves
                        let moveScores = [];

                        // Loop through the internal game panel

                        for (let i = 0; i < panel.length; i++) {

                            // If the current square is empty
                            if (panel[i] == null) {

                                // Set the value of the current square to "zero"
                                panel[i] = Players.getPlayerTwo().getValue();
                                // Start recursion to find the score of this move
                                let score = _minimax(panel, 0, false);
                                // Push the score of this move into moveScores
                                moveScores.push(score);
                                // After the score is found, set the current square value back to null
                                panel[i] = null;
                                // If the score of the current move is better than the bestScore, replace it, and select the current
                                // move as the best move
                                if (score > bestScore) {

                                    bestScore = score;
                                    bestMove = i;

                                }

                            }

                            // Repeat

                        }

                        // Since the first move is always random, there are multiple situations in which the Computer will be set to lose from
                        // the beginning. In the case where the Human has two ways to win the game, the minimax algorithm calculates all possible
                        // moves and realizes that no matter what, a win or a draw is no longer possible, and "gives up". This is triggered by the fact
                        // that all the moves available to the computer will return the same score, as no matter what move it takes it will always lose.
                        // Since all moves have the same losing score (which is -99), the method through which the minimax algorithm choses a best move
                        // is practically dead, and the first available move is chosen, since no other move has a score high or low enough to replace
                        // it. To solve this issue, the following if statement checks to see if all moves share the same losing score, and goes through
                        // the minimax process again, but this time bestScore starts at the maximum possible value, the value of panel[i] is set to
                        // "x" on each iteration, and score is replaced by best score when bestScore is LOWER.

                        if (moveScores.every(moveScore => moveScore === -99)) {

                            bestScore = Infinity;

                            for (let i = 0; i < panel.length; i++) {

                                if (panel[i] == null) {

                                    panel[i] = Players.getPlayerOne().getValue();
                                    let score = _minimax(panel, 0, true);
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

                // When the difficulty is set to unbeatable, generate all moves using the minimax algorithm
                // Since no random move is introduced, the Computer is never faced with a situation in which the Human
                // has two ways of winning, therefore in this situation it is no longer needed to check if all moves 
                // have the same score as the above if statement

                case "unbeatable":

                    let bestScore = -Infinity;
                    let bestMove;
                    let moveScores = [];

                    for (let i = 0; i < panel.length; i++) {

                        if (panel[i] == null) {

                            panel[i] = Players.getPlayerTwo().getValue();
                            let score = _minimax(panel, 0, false);
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

        // A simplified version of checkGame function, which is responsible for finding a winner or a tie

        const _checkGame = (panel, player) => {

            // If winner is found, the foundWinner variable is set to true
            let foundWinner;;

            // Winning combinations - horizontal, vertical, diagonal
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

        const _minimax = (panel, depth, isMaximizing) => {

            // Get all currently available squares
            const availableSquares = panel.filter(square => square == null);

            // If this current move makes the Computer win, return a positive score
            // If this current move makes the Human win, return a negative score
            // If it's a tie, return 0
            // Depth is used to help the minimax algorithm choose the quickest path towards winning
            // and the longest path towards losing
            if (_checkGame(panel, Players.getPlayerTwo().getValue())) { return 100 - depth; }
            else if (_checkGame(panel, Players.getPlayerOne().getValue())) { return -100 + depth; }
            else if (availableSquares.length === 0) { return 0; }

            if (isMaximizing) {

                let bestScore = -Infinity;

                for (let i = 0; i < panel.length; i++) {

                    if (panel[i] == null) {

                        panel[i] = Players.getPlayerTwo().getValue();
                        // Increase depth with each recursion
                        let score = _minimax(panel, depth + 1, false);
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
                        // Increase depth with each recursion
                        let score = _minimax(panel, depth + 1, true);
                        panel[i] = null;
                        bestScore = Math.min(score, bestScore);

                    }

                }

                return bestScore;

            }

        }

        return { generateValue }

    })();

    Panel.createPanel();
    Renderer.renderPanel();
    Renderer.displayOpponentType(Players.getPlayerTwo().getType());
    Renderer.displayTurn(Players.getPlayerOne());
    InputHandler.attachClickEvents();

})();