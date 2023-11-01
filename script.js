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