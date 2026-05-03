// Lightweight visual effect hooks for muzzle flashes, impacts, and feedback.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  class EffectsView {
    weaponFired() {
      document.body.classList.add("screen-flash");
      setTimeout(() => document.body.classList.remove("screen-flash"), 45);
    }

    playerDamaged() {
      document.body.classList.add("danger-flash");
      setTimeout(() => document.body.classList.remove("danger-flash"), 120);
    }

    enemyHitHeadshot() {
      this.flashCrosshairClass("hit-headshot", 120);
    }

    enemyHitBody() {
      this.flashCrosshairClass("hit-body", 120);
    }

    flashCrosshairClass(className, durationMs) {
      const crosshair = document.getElementById("crosshair");
      if (!crosshair) return;

      crosshair.classList.remove("hit-headshot", "hit-body");
      crosshair.classList.add(className);
      clearTimeout(this._crosshairHitTimer);
      this._crosshairHitTimer = setTimeout(() => {
        crosshair.classList.remove(className);
      }, durationMs);
    }
  }

  TheGame.EffectsView = EffectsView;
})();
