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