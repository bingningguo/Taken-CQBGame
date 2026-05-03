// HUD rendering is isolated here so gameplay systems only update state.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  class UiSystem {
    constructor(elements, state, level, player) {
      this.elements = elements;
      this.state = state;
      this.level = level;
      this.player = player;
    }

    update() {
      const lockText = this.state.ui.pointerLocked ? "MOUSE LOCKED" : "CLICK TO LOCK MOUSE";
      const weaponStatus = this.state.weapon.status && this.state.weapon.status !== "READY"
        ? ` ${this.state.weapon.status}`
        : "";
      const hostageText = this.getHostageText();

      this.elements.health.textContent = String(this.state.player.hp);
      this.elements.ammo.textContent = `${this.state.weapon.ammoInMag}/${this.state.weapon.reserveAmmo}${weaponStatus}`;
      this.elements.weapon.textContent = this.state.weapon.name;
      this.elements.hostage.textContent = hostageText;
      this.elements.mouse.textContent = lockText;
      this.updatePrompt();
      this.updateCountdown();
      this.updateScopeHint();
    }

    updateScopeHint() {
      if (!this.elements.scopeHint) return;
      const w = this.state.weapon;
      const cfg = TheGame.WeaponConfig[w.currentId];
      const canScope = cfg && cfg.scopes && cfg.scopes.length > 0;
      const show = w.adsActive && canScope;
      if (show) {
        const opts = cfg.scopes.map((m) => m + "x").join(" · ");
        this.elements.scopeHint.textContent = `Wheel: zoom · Current ${w.scopeMagLabel || ""} (${opts})`;
      } else {
        this.elements.scopeHint.textContent = "";
      }
      this.elements.scopeHint.classList.toggle("is-hidden", !show);
    }

    getHostageText() {
      if (this.state.mode === "range") return "Range (no hostage mission)";
      if (this.state.hostage.status === "dead") return "Mission failed · Hostage KIA";
      if (this.state.hostage.status === "extracted") return "HOSTAGE EXTRACTED";
      if (this.state.hostage.status === "secured") {
        const p = this.state.hostage.prompt;
        return p ? `Hostage secured · ${p}` : "Hostage secured · Move to extraction";
      }
      const hp = this.state.hostage.hp;
      const max = this.state.hostage.maxHp ?? 50;
      const base = `Hostage HP ${hp}/${max}`;
      const p = this.state.hostage.prompt;
      return p ? `${base} · ${p}` : base;
    }

    updatePrompt() {
      if (!this.elements.prompt) return;

      const prompt = this.state.hostage.prompt === "Press E to secure hostage"
        ? this.state.hostage.prompt
        : "";
      this.elements.prompt.textContent = prompt;
      this.elements.prompt.classList.toggle("is-hidden", !prompt);
    }

    updateCountdown() {
      if (!this.elements.countdown) return;

      const remaining = this.state.hostage.extractionCountdown;
      const isCounting = remaining !== null && this.state.hostage.status === "secured";
      this.elements.countdown.textContent = isCounting ? `EXTRACTING ${Math.ceil(remaining)}` : "";
      this.elements.countdown.classList.toggle("is-hidden", !isCounting);
    }
  }

  TheGame.UiSystem = UiSystem;
})();
