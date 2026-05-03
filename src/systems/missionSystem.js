// Mission system placeholder. Later objectives can update state.mission here.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  class MissionSystem {
    constructor(state) {
      this.state = state;
    }

    update() {}
  }

  TheGame.MissionSystem = MissionSystem;
})();
