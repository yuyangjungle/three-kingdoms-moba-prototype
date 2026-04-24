(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const heroSelect = document.getElementById("heroSelect");
  const heroCardsEl = document.getElementById("heroCards");
  const heroStatsEl = document.getElementById("heroStats");
  const startButton = document.getElementById("startButton");
  const endOverlay = document.getElementById("endOverlay");
  const endTitle = document.getElementById("endTitle");
  const endText = document.getElementById("endText");
  const restartButton = document.getElementById("restartButton");
  const shopButtons = Array.from(document.querySelectorAll("[data-item]"));
  const bodyEl = document.body;

  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const TAU = Math.PI * 2;
  const WORLD = { width: 2400, height: 1600 };
  const BLUE = "blue";
  const RED = "red";
  const LANES = ["top", "mid", "bot"];
  const TEAM_COLORS = {
    [BLUE]: { main: "#6ac8ff", fill: "#133951", glow: "#9ce4ff" },
    [RED]: { main: "#ff766e", fill: "#4a1d24", glow: "#ffc1a2" }
  };
  const DAMAGE_COLORS = {
    physical: "#ffd87d",
    magic: "#98dcff",
    heal: "#7ef0b2"
  };
  const XP_LEVELS = [0, 0, 240, 560, 960, 1460, 2060, 2760, 3580, 4520, 5580];
  const WAVE_INTERVAL = 11;
  const ALTAR_RADIUS = 150;
  const ALTAR_POS = { x: WORLD.width / 2, y: WORLD.height / 2 };

  const BLUE_PATHS = {
    top: [
      { x: 270, y: 1330 },
      { x: 270, y: 250 },
      { x: 2130, y: 250 }
    ],
    mid: [
      { x: 270, y: 1330 },
      { x: 1200, y: 800 },
      { x: 2130, y: 250 }
    ],
    bot: [
      { x: 270, y: 1330 },
      { x: 2130, y: 1330 },
      { x: 2130, y: 250 }
    ]
  };

  const HERO_TEMPLATES = {
    guanyu: {
      key: "guanyu",
      playable: true,
      name: "关羽",
      title: "美髯战将",
      role: "战士",
      kit: "fighter",
      attackType: "melee",
      basicDamageType: "physical",
      blurb: "直冲敌阵的推线战士，开团、续航和乱战能力都很稳。",
      flavor: "温酒未凉，敌阵先乱。",
      stats: {
        maxHp: 980,
        attackDamage: 78,
        abilityPower: 0,
        armor: 18,
        magicResist: 12,
        moveSpeed: 252,
        attackSpeed: 1.02,
        attackRange: 92
      },
      growth: {
        maxHp: 126,
        attackDamage: 5.2,
        abilityPower: 0,
        armor: 2.6,
        magicResist: 1.3,
        attackSpeed: 0.03
      },
      skills: {
        q: "青龙突骑",
        w: "忠义号令",
        e: "单骑破阵"
      },
      skillTips: [
        "Q 冲锋穿阵，先手开团非常顺手。",
        "W 能给自己和附近友军回一口状态。",
        "E 开起来就要顶住，适合在塔前和兵堆里搅局。"
      ]
    },
    zhaoyun: {
      key: "zhaoyun",
      playable: true,
      name: "赵云",
      title: "白马先锋",
      role: "突击",
      kit: "lancer",
      attackType: "melee",
      basicDamageType: "physical",
      blurb: "高机动切入英雄，擅长追击残血与侧翼突袭。",
      flavor: "来去如龙，阵里阵外都由我挑。",
      stats: {
        maxHp: 900,
        attackDamage: 74,
        abilityPower: 0,
        armor: 15,
        magicResist: 11,
        moveSpeed: 270,
        attackSpeed: 1.06,
        attackRange: 100
      },
      growth: {
        maxHp: 110,
        attackDamage: 4.9,
        abilityPower: 0,
        armor: 2.2,
        magicResist: 1.1,
        attackSpeed: 0.04
      },
      skills: {
        q: "七进七出",
        w: "龙胆回马",
        e: "常胜飞袭"
      },
      skillTips: [
        "Q 可以穿过兵线直接贴脸。",
        "W 强化三次普攻，适合追杀或打塔。",
        "E 是范围起手技，切后排特别快。"
      ]
    },
    zhugeliang: {
      key: "zhugeliang",
      playable: true,
      name: "诸葛亮",
      title: "卧龙军师",
      role: "谋士",
      kit: "mage",
      attackType: "ranged",
      basicDamageType: "magic",
      blurb: "远程法师，团战控场强，适合中路清线和远程消耗。",
      flavor: "风起阵开，借你一场大火。",
      stats: {
        maxHp: 780,
        attackDamage: 52,
        abilityPower: 76,
        armor: 11,
        magicResist: 14,
        moveSpeed: 245,
        attackSpeed: 0.96,
        attackRange: 235
      },
      growth: {
        maxHp: 98,
        attackDamage: 2.8,
        abilityPower: 8.4,
        armor: 1.6,
        magicResist: 1.8,
        attackSpeed: 0.025
      },
      skills: {
        q: "火计",
        w: "八阵图",
        e: "借东风"
      },
      skillTips: [
        "Q 是稳定清兵和消耗手段。",
        "W 能在地形关键口给敌人减速，帮队友拉扯。",
        "E 提前预判人群位置，收益最高。"
      ]
    },
    lubu: {
      key: "lubu",
      playable: false,
      name: "吕布",
      title: "虎牢无双",
      role: "战士",
      kit: "fighter",
      attackType: "melee",
      basicDamageType: "physical",
      blurb: "爆发更凶的近战霸主。",
      flavor: "方天一出，谁来都要抖一抖。",
      stats: {
        maxHp: 1020,
        attackDamage: 84,
        abilityPower: 0,
        armor: 17,
        magicResist: 12,
        moveSpeed: 255,
        attackSpeed: 1.0,
        attackRange: 96
      },
      growth: {
        maxHp: 130,
        attackDamage: 5.8,
        abilityPower: 0,
        armor: 2.4,
        magicResist: 1.2,
        attackSpeed: 0.03
      },
      skills: {
        q: "辕门狂袭",
        w: "飞将怒喝",
        e: "无双破军"
      }
    },
    xiahoudun: {
      key: "xiahoudun",
      playable: false,
      name: "夏侯惇",
      title: "铁壁先锋",
      role: "战士",
      kit: "fighter",
      attackType: "melee",
      basicDamageType: "physical",
      blurb: "更耐打的前排压线手。",
      flavor: "先过我这关，再谈推进。",
      stats: {
        maxHp: 1080,
        attackDamage: 72,
        abilityPower: 0,
        armor: 22,
        magicResist: 13,
        moveSpeed: 248,
        attackSpeed: 0.98,
        attackRange: 92
      },
      growth: {
        maxHp: 140,
        attackDamage: 4.7,
        abilityPower: 0,
        armor: 2.9,
        magicResist: 1.4,
        attackSpeed: 0.025
      },
      skills: {
        q: "重锋突阵",
        w: "铁军令",
        e: "血战横扫"
      }
    },
    zhouyu: {
      key: "zhouyu",
      playable: false,
      name: "周瑜",
      title: "赤壁都督",
      role: "谋士",
      kit: "mage",
      attackType: "ranged",
      basicDamageType: "magic",
      blurb: "火焰型法师，远程压制很强。",
      flavor: "风向刚好，火也刚好。",
      stats: {
        maxHp: 800,
        attackDamage: 50,
        abilityPower: 82,
        armor: 10,
        magicResist: 15,
        moveSpeed: 248,
        attackSpeed: 0.95,
        attackRange: 240
      },
      growth: {
        maxHp: 102,
        attackDamage: 2.6,
        abilityPower: 9.1,
        armor: 1.5,
        magicResist: 1.9,
        attackSpeed: 0.025
      },
      skills: {
        q: "赤焰流火",
        w: "焚营火阵",
        e: "江东风祭"
      }
    }
  };

  const SHOP_ITEMS = {
    warblade: {
      name: "铁骑长枪",
      cost: 450,
      apply(hero) {
        hero.permanent.attackDamage += 18;
        hero.permanent.moveSpeedPercent += 0.06;
      }
    },
    bulwark: {
      name: "玄甲重铠",
      cost: 500,
      apply(hero) {
        hero.permanent.maxHp += 240;
        hero.permanent.armor += 14;
      }
    },
    warbook: {
      name: "奇门兵书",
      cost: 520,
      apply(hero) {
        hero.permanent.abilityPower += 28;
        hero.permanent.cooldownReduction += 0.1;
      }
    }
  };

  let entityId = 1;

  function nextId() {
    entityId += 1;
    return entityId;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function pointDistance(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  function normalize(x, y) {
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len, len };
  }

  function reversePath(points) {
    return [...points].reverse().map((point) => ({ x: point.x, y: point.y }));
  }

  function formatTime(seconds) {
    const value = Math.max(0, Math.floor(seconds));
    const m = Math.floor(value / 60);
    const s = `${value % 60}`.padStart(2, "0");
    return `${m}:${s}`;
  }

  function applyResistance(amount, value) {
    if (value >= 0) {
      return amount * (100 / (100 + value));
    }
    return amount * (2 - 100 / (100 - value));
  }

  function laneSpawnOffset(path, lateral, along) {
    const start = path[0];
    const next = path[1];
    const dir = normalize(next.x - start.x, next.y - start.y);
    const perp = { x: -dir.y, y: dir.x };
    return {
      x: start.x + dir.x * along + perp.x * lateral,
      y: start.y + dir.y * along + perp.y * lateral
    };
  }

  function roundedRectPath(drawCtx, x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, width / 2, height / 2));
    drawCtx.beginPath();
    drawCtx.moveTo(x + r, y);
    drawCtx.arcTo(x + width, y, x + width, y + height, r);
    drawCtx.arcTo(x + width, y + height, x, y + height, r);
    drawCtx.arcTo(x, y + height, x, y, r);
    drawCtx.arcTo(x, y, x + width, y, r);
    drawCtx.closePath();
  }

  class Entity {
    constructor(game, config) {
      this.game = game;
      this.id = nextId();
      this.kind = config.kind || "entity";
      this.team = config.team || null;
      this.name = config.name || this.kind;
      this.x = config.x || 0;
      this.y = config.y || 0;
      this.radius = config.radius || 20;
      this.maxHp = config.maxHp || 100;
      this.hp = config.hp == null ? this.maxHp : config.hp;
      this.alive = true;
      this.armor = config.armor || 0;
      this.magicResist = config.magicResist || 0;
      this.attackRange = config.attackRange || 0;
      this.lastDamager = null;
      this.lastDamageAt = -999;
      this.bounty = config.bounty || 0;
      this.xpValue = config.xpValue || 0;
    }

    getArmor() {
      return this.armor;
    }

    getMagicResist() {
      return this.magicResist;
    }

    takeDamage(source, amount, type = "physical", options = {}) {
      if (!this.alive) {
        return 0;
      }

      let damage = amount;
      if (!options.trueDamage) {
        if (type === "physical") {
          damage = applyResistance(damage, this.getArmor());
        } else if (type === "magic") {
          damage = applyResistance(damage, this.getMagicResist());
        }
      }

      damage = Math.max(1, damage);

      if (this.damageTakenMultiplier) {
        damage *= this.damageTakenMultiplier;
      }

      this.hp = Math.max(0, this.hp - damage);
      this.lastDamager = source || null;
      this.lastDamageAt = this.game.time;
      this.onDamaged(source, damage, type, options);

      this.game.addFloatingText(
        this.x,
        this.y - this.radius - 8,
        `-${Math.round(damage)}`,
        DAMAGE_COLORS[type] || "#ffffff"
      );

      if (this.hp <= 0) {
        this.die(source, options);
      }

      return damage;
    }

    heal(amount) {
      if (!this.alive || amount <= 0) {
        return 0;
      }

      const healed = Math.min(this.maxHp - this.hp, amount);
      if (healed <= 0) {
        return 0;
      }

      this.hp += healed;
      this.game.addFloatingText(
        this.x,
        this.y - this.radius - 8,
        `+${Math.round(healed)}`,
        DAMAGE_COLORS.heal
      );
      return healed;
    }

    onDamaged() {}

    onDeath() {}

    die(killer, options = {}) {
      if (!this.alive) {
        return;
      }

      this.alive = false;
      this.onDeath(killer, options);
      this.game.handleEntityDeath(this, killer, options);
    }
  }

  class Hero extends Entity {
    constructor(game, template, team, lane, options = {}) {
      const spawn = team === BLUE ? game.baseSpawns[BLUE] : game.baseSpawns[RED];
      super(game, {
        kind: "hero",
        team,
        name: template.name,
        x: spawn.x + (options.spawnOffsetX || 0),
        y: spawn.y + (options.spawnOffsetY || 0),
        radius: 26,
        maxHp: template.stats.maxHp,
        hp: template.stats.maxHp,
        armor: template.stats.armor,
        magicResist: template.stats.magicResist,
        attackRange: template.stats.attackRange,
        bounty: 260,
        xpValue: 220
      });

      this.template = template;
      this.lane = lane;
      this.isPlayer = !!options.isPlayer;
      this.roleIndex = options.roleIndex || 0;
      this.level = 1;
      this.exp = 0;
      this.gold = options.isPlayer ? 650 : 0;
      this.route = game.paths[team][lane];
      this.routeIndex = 1;
      this.spawn = { x: this.x, y: this.y };
      this.facing = { x: team === BLUE ? 1 : -1, y: 0 };
      this.vx = 0;
      this.vy = 0;
      this.attackCooldown = 0;
      this.cooldowns = { q: 0, w: 0, e: 0 };
      this.effects = [];
      this.effectTotals = this.createEffectTotals();
      this.recallTimer = 0;
      this.respawnTimer = 0;
      this.permanent = {
        maxHp: 0,
        attackDamage: 0,
        abilityPower: 0,
        armor: 0,
        magicResist: 0,
        moveSpeedPercent: 0,
        attackSpeed: 0,
        cooldownReduction: 0
      };
      this.inventory = [];
      this.basicAttackBonus = 0;
      this.basicAttackBonusHits = 0;
      this.basicAttackMagic = false;
      this.damageTakenMultiplier = 1;
      this.target = null;
      this.passiveGoldTicker = 0;
      this.stateText = "";
      this.aiThink = Math.random() * 0.2;
      this.currentWaypoint = 1;
      this.dash = null;
    }

    createEffectTotals() {
      return {
        moveMult: 1,
        attackSpeedMult: 1,
        damageTakenMult: 1,
        physicalMult: 1,
        magicMult: 1,
        bonusArmor: 0,
        bonusMagicResist: 0,
        bonusAttackDamage: 0,
        bonusAbilityPower: 0,
        healPerSecond: 0,
        cooldownReduction: 0
      };
    }

    getMaxHp() {
      const base = this.template.stats.maxHp + this.template.growth.maxHp * (this.level - 1);
      return base + this.permanent.maxHp;
    }

    getAttackDamage() {
      return (
        this.template.stats.attackDamage +
        this.template.growth.attackDamage * (this.level - 1) +
        this.permanent.attackDamage +
        this.effectTotals.bonusAttackDamage
      );
    }

    getAbilityPower() {
      return (
        this.template.stats.abilityPower +
        this.template.growth.abilityPower * (this.level - 1) +
        this.permanent.abilityPower +
        this.effectTotals.bonusAbilityPower
      );
    }

    getArmor() {
      return (
        this.template.stats.armor +
        this.template.growth.armor * (this.level - 1) +
        this.permanent.armor +
        this.effectTotals.bonusArmor
      );
    }

    getMagicResist() {
      return (
        this.template.stats.magicResist +
        this.template.growth.magicResist * (this.level - 1) +
        this.permanent.magicResist +
        this.effectTotals.bonusMagicResist
      );
    }

    getMoveSpeed() {
      const altarBoost = this.game.teamBuffs[this.team].altar > 0 ? 1.05 : 1;
      const base = this.template.stats.moveSpeed;
      const value =
        base *
        (1 + this.permanent.moveSpeedPercent) *
        this.effectTotals.moveMult *
        altarBoost;
      return value;
    }

    getAttackSpeed() {
      return (
        this.template.stats.attackSpeed +
        this.template.growth.attackSpeed * (this.level - 1) +
        this.permanent.attackSpeed
      ) * this.effectTotals.attackSpeedMult;
    }

    getCooldownMultiplier() {
      const total =
        this.permanent.cooldownReduction + this.effectTotals.cooldownReduction;
      return clamp(1 - total, 0.55, 1);
    }

    getOutgoingMultiplier(type) {
      const altarBoost = this.game.teamBuffs[this.team].altar > 0 ? 1.12 : 1;
      const table = type === "magic" ? this.effectTotals.magicMult : this.effectTotals.physicalMult;
      return table * altarBoost;
    }

    getAttackInterval() {
      return 1 / Math.max(0.45, this.getAttackSpeed());
    }

    getAimPoint(maxRange = 9999) {
      if (this.isPlayer) {
        const mouse = this.game.input.mouseWorld;
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dir = normalize(dx, dy);
        const clamped = Math.min(dir.len, maxRange);
        return { x: this.x + dir.x * clamped, y: this.y + dir.y * clamped };
      }

      if (this.target && this.target.alive) {
        return { x: this.target.x, y: this.target.y };
      }

      const next = this.route[this.currentWaypoint] || this.route[this.route.length - 1];
      return { x: next.x, y: next.y };
    }

    setFacingTo(point) {
      const dir = normalize(point.x - this.x, point.y - this.y);
      if (dir.len > 0.001) {
        this.facing.x = dir.x;
        this.facing.y = dir.y;
      }
    }

    addEffect(effect) {
      this.effects.push({
        ...effect,
        remaining: effect.duration,
        tickLeft: effect.interval || 0
      });
    }

    updateEffects(dt) {
      this.effectTotals = this.createEffectTotals();

      for (let i = this.effects.length - 1; i >= 0; i -= 1) {
        const effect = this.effects[i];
        effect.remaining -= dt;

        if (effect.interval && effect.onTick) {
          effect.tickLeft -= dt;
          while (effect.tickLeft <= 0) {
            effect.tickLeft += effect.interval;
            effect.onTick(this);
          }
        }

        if (effect.moveMult) {
          this.effectTotals.moveMult *= effect.moveMult;
        }
        if (effect.attackSpeedMult) {
          this.effectTotals.attackSpeedMult *= effect.attackSpeedMult;
        }
        if (effect.damageTakenMult) {
          this.effectTotals.damageTakenMult *= effect.damageTakenMult;
        }
        if (effect.physicalMult) {
          this.effectTotals.physicalMult *= effect.physicalMult;
        }
        if (effect.magicMult) {
          this.effectTotals.magicMult *= effect.magicMult;
        }
        if (effect.bonusArmor) {
          this.effectTotals.bonusArmor += effect.bonusArmor;
        }
        if (effect.bonusMagicResist) {
          this.effectTotals.bonusMagicResist += effect.bonusMagicResist;
        }
        if (effect.bonusAttackDamage) {
          this.effectTotals.bonusAttackDamage += effect.bonusAttackDamage;
        }
        if (effect.bonusAbilityPower) {
          this.effectTotals.bonusAbilityPower += effect.bonusAbilityPower;
        }
        if (effect.healPerSecond) {
          this.effectTotals.healPerSecond += effect.healPerSecond;
        }
        if (effect.cooldownReduction) {
          this.effectTotals.cooldownReduction += effect.cooldownReduction;
        }

        if (effect.remaining <= 0) {
          if (effect.onExpire) {
            effect.onExpire(this);
          }
          this.effects.splice(i, 1);
        }
      }

      this.damageTakenMultiplier = this.effectTotals.damageTakenMult;
    }

    onDamaged() {
      this.recallTimer = 0;
    }

    die(killer) {
      if (!this.alive) {
        return;
      }

      this.recallTimer = 0;
      this.respawnTimer = 8 + this.level * 1.5;
      super.die(killer);
    }

    onDeath(killer) {
      const killerName = killer ? killer.name : "无名之辈";
      this.game.announce(`${this.name} 被 ${killerName} 击倒`, this.team === BLUE ? RED : BLUE);
    }

    respawn() {
      this.alive = true;
      this.hp = this.getMaxHp();
      const spawn = this.game.baseSpawns[this.team];
      this.x = spawn.x + (this.team === BLUE ? 60 : -60);
      this.y = spawn.y + (this.lane === "top" ? -40 : this.lane === "bot" ? 40 : 0);
      this.routeIndex = 1;
      this.currentWaypoint = 1;
      this.target = null;
      this.cooldowns.q = 0;
      this.cooldowns.w = 0;
      this.cooldowns.e = 0;
      this.effects = [];
      this.dash = null;
      this.recallTimer = 0;
      this.game.announce(`${this.name} 已重新出阵`, this.team);
    }

    gainGold(amount) {
      if (!this.isPlayer || amount <= 0) {
        return;
      }
      this.gold += amount;
    }

    gainExp(amount) {
      if (amount <= 0) {
        return;
      }

      this.exp += amount;
      while (this.level < XP_LEVELS.length - 1 && this.exp >= XP_LEVELS[this.level + 1]) {
        this.level += 1;
        this.hp = Math.min(this.getMaxHp(), this.hp + 120);
        this.game.addFloatingText(this.x, this.y - 34, `Lv.${this.level}`, "#f6d78d");
        this.game.announce(`${this.name} 升到 ${this.level} 级`, this.team);
      }
    }

    atFountain() {
      return pointDistance(this.x, this.y, this.game.baseSpawns[this.team].x, this.game.baseSpawns[this.team].y) < 160;
    }

    buy(itemKey) {
      const item = SHOP_ITEMS[itemKey];
      if (!item || !this.atFountain() || this.gold < item.cost) {
        return false;
      }
      this.gold -= item.cost;
      item.apply(this);
      this.inventory.push(item.name);
      this.game.announce(`${this.name} 购入 ${item.name}`, this.team);
      return true;
    }

    startRecall() {
      if (!this.alive || this.atFountain()) {
        return;
      }
      this.recallTimer = 2.4;
      this.stateText = "回城中";
    }

    completeRecall() {
      const spawn = this.game.baseSpawns[this.team];
      this.x = spawn.x;
      this.y = spawn.y;
      this.hp = Math.min(this.getMaxHp(), this.hp + this.getMaxHp() * 0.4);
      this.recallTimer = 0;
      this.stateText = "";
      this.game.announce(`${this.name} 已回城整备`, this.team);
    }

    startDash(targetPoint, distanceCap, duration, onHit) {
      const dir = normalize(targetPoint.x - this.x, targetPoint.y - this.y);
      const distanceValue = Math.min(distanceCap, dir.len);
      if (distanceValue < 10) {
        return false;
      }

      this.dash = {
        dirX: dir.x,
        dirY: dir.y,
        speed: distanceValue / duration,
        remaining: duration,
        onHit,
        hitIds: new Set()
      };
      this.setFacingTo(targetPoint);
      return true;
    }

    performDash(dt) {
      if (!this.dash) {
        return;
      }

      const step = Math.min(dt, this.dash.remaining);
      this.x += this.dash.dirX * this.dash.speed * step;
      this.y += this.dash.dirY * this.dash.speed * step;
      this.dash.remaining -= step;

      const enemies = this.game.getEnemiesInRadius(this.team, this.x, this.y, this.radius + 28);
      enemies.forEach((enemy) => {
        if (!this.dash.hitIds.has(enemy.id) && enemy.kind !== "base") {
          this.dash.hitIds.add(enemy.id);
          if (this.dash.onHit) {
            this.dash.onHit(enemy);
          }
        }
      });

      if (this.dash.remaining <= 0) {
        this.dash = null;
      }
    }

    basicAttack(target) {
      this.attackCooldown = this.getAttackInterval();
      this.setFacingTo(target);

      let amount = this.getAttackDamage();
      let type = this.template.basicDamageType;
      if (this.basicAttackBonusHits > 0) {
        amount += this.basicAttackBonus;
        type = this.basicAttackMagic ? "magic" : type;
        this.basicAttackBonusHits -= 1;
      }

      if (this.template.attackType === "ranged") {
        this.game.projectiles.push(
          new Projectile(this.game, {
            x: this.x + this.facing.x * 28,
            y: this.y + this.facing.y * 28,
            radius: 7,
            speed: 620,
            target,
            team: this.team,
            color: type === "magic" ? "#8fdfff" : "#f8d37d",
            source: this,
            damage: amount,
            damageType: type
          })
        );
      } else {
        this.game.dealDamage(this, target, amount, type);
      }
    }

    tryAutoAttack() {
      if (!this.alive || this.recallTimer > 0 || this.dash) {
        return;
      }

      if (this.attackCooldown > 0) {
        return;
      }

      if (!this.target || !this.target.alive || this.target.team === this.team) {
        this.target = this.game.findNearestEnemy(this, 320, { preferHero: true });
      }

      if (!this.target) {
        return;
      }

      const dist = distance(this, this.target);
      if (dist <= this.attackRange + this.target.radius) {
        this.basicAttack(this.target);
      }
    }

    castQ() {
      if (this.cooldowns.q > 0) {
        return false;
      }

      if (this.template.kit === "fighter") {
        const aim = this.getAimPoint(260);
        const damage = 60 + this.getAttackDamage() * 1.05;
        const success = this.startDash(aim, 260, 0.22, (enemy) => {
          this.game.dealDamage(this, enemy, damage, "physical");
          if (enemy.kind === "hero") {
            enemy.addEffect({ duration: 1.2, moveMult: 0.84 });
          }
        });
        if (!success) {
          return false;
        }
        this.cooldowns.q = 7.5 * this.getCooldownMultiplier();
        this.game.flashArc(this.x, this.y, 64, this.facing, this.team);
        return true;
      }

      if (this.template.kit === "lancer") {
        const aim = this.getAimPoint(300);
        const damage = 52 + this.getAttackDamage() * 1.15;
        const success = this.startDash(aim, 300, 0.18, (enemy) => {
          this.game.dealDamage(this, enemy, damage, "physical");
        });
        if (!success) {
          return false;
        }
        this.cooldowns.q = 6.2 * this.getCooldownMultiplier();
        return true;
      }

      if (this.template.kit === "mage") {
        const targetPoint = this.getAimPoint(520);
        const direction = normalize(targetPoint.x - this.x, targetPoint.y - this.y);
        this.game.projectiles.push(
          new Projectile(this.game, {
            x: this.x + direction.x * 32,
            y: this.y + direction.y * 32,
            radius: 10,
            speed: 540,
            direction,
            team: this.team,
            color: this.template.key === "zhouyu" ? "#ff9b6e" : "#9de7ff",
            source: this,
            damage: 82 + this.getAbilityPower() * 0.78,
            damageType: "magic",
            blastRadius: 92
          })
        );
        this.cooldowns.q = 6 * this.getCooldownMultiplier();
        return true;
      }

      return false;
    }

    castW() {
      if (this.cooldowns.w > 0) {
        return false;
      }

      if (this.template.kit === "fighter") {
        const allies = this.game.getAlliesInRadius(this.team, this.x, this.y, 210, (unit) => unit.kind === "hero");
        allies.forEach((ally) => {
          ally.heal(68 + this.level * 8);
          ally.addEffect({
            duration: 4,
            moveMult: 1.16,
            bonusArmor: 12
          });
        });
        this.game.zones.push(
          new Zone(this.game, {
            x: this.x,
            y: this.y,
            radius: 200,
            duration: 0.35,
            color: "rgba(228,181,92,0.28)",
            label: this.template.skills.w
          })
        );
        this.cooldowns.w = 13.5 * this.getCooldownMultiplier();
        return true;
      }

      if (this.template.kit === "lancer") {
        this.basicAttackBonus = 36 + this.getAttackDamage() * 0.35;
        this.basicAttackBonusHits = 3;
        this.basicAttackMagic = false;
        this.addEffect({
          duration: 5,
          attackSpeedMult: 1.45,
          moveMult: 1.12
        });
        this.cooldowns.w = 11 * this.getCooldownMultiplier();
        return true;
      }

      if (this.template.kit === "mage") {
        const aim = this.getAimPoint(340);
        this.game.zones.push(
          new Zone(this.game, {
            x: aim.x,
            y: aim.y,
            radius: 155,
            duration: 4.8,
            interval: 0.6,
            color: this.template.key === "zhouyu" ? "rgba(255,140,92,0.18)" : "rgba(118,199,255,0.18)",
            team: this.team,
            label: this.template.skills.w,
            onTick: (zone) => {
              const allies = this.game.getAlliesInRadius(this.team, zone.x, zone.y, zone.radius, (unit) => unit.kind === "hero");
              allies.forEach((ally) => ally.heal(20 + this.getAbilityPower() * 0.1));
              const enemies = this.game.getEnemiesInRadius(this.team, zone.x, zone.y, zone.radius);
              enemies.forEach((enemy) => {
                this.game.dealDamage(this, enemy, 18 + this.getAbilityPower() * 0.22, "magic");
                if (enemy.kind === "hero" || enemy.kind === "minion") {
                  enemy.addEffect({ duration: 0.8, moveMult: 0.8 });
                }
              });
            }
          })
        );
        this.cooldowns.w = 13 * this.getCooldownMultiplier();
        return true;
      }

      return false;
    }

    castE() {
      if (this.cooldowns.e > 0) {
        return false;
      }

      if (this.template.kit === "fighter") {
        this.addEffect({
          duration: 2.6,
          damageTakenMult: 0.82,
          moveMult: 1.08
        });
        this.game.zones.push(
          new Zone(this.game, {
            x: this.x,
            y: this.y,
            radius: 150,
            duration: 2.6,
            interval: 0.36,
            team: this.team,
            follow: this,
            color: "rgba(239,196,100,0.14)",
            label: this.template.skills.e,
            onTick: (zone) => {
              const enemies = this.game.getEnemiesInRadius(this.team, zone.x, zone.y, zone.radius);
              enemies.forEach((enemy) => {
                this.game.dealDamage(this, enemy, 54 + this.getAttackDamage() * 0.58, "physical");
              });
            }
          })
        );
        this.cooldowns.e = 22 * this.getCooldownMultiplier();
        return true;
      }

      if (this.template.kit === "lancer") {
        const aim = this.getAimPoint(360);
        const success = this.startDash(aim, 360, 0.26, null);
        if (!success) {
          return false;
        }
        this.game.schedule(0.28, () => {
          this.game.zones.push(
            new Zone(this.game, {
              x: this.x,
              y: this.y,
              radius: 145,
              duration: 0.26,
              color: "rgba(102, 194, 255, 0.24)",
              label: this.template.skills.e
            })
          );
          const enemies = this.game.getEnemiesInRadius(this.team, this.x, this.y, 145);
          enemies.forEach((enemy) => {
            this.game.dealDamage(this, enemy, 110 + this.getAttackDamage() * 0.92, "physical");
          });
        });
        this.cooldowns.e = 19 * this.getCooldownMultiplier();
        return true;
      }

      if (this.template.kit === "mage") {
        const aim = this.getAimPoint(460);
        for (let index = 0; index < 4; index += 1) {
          const angle = (index / 4) * TAU;
          const offset = index === 0 ? 0 : 52;
          const targetX = aim.x + Math.cos(angle) * offset;
          const targetY = aim.y + Math.sin(angle) * offset;
          const delay = 0.7 + index * 0.3;
          this.game.zones.push(
            new Zone(this.game, {
              x: targetX,
              y: targetY,
              radius: 120,
              duration: delay,
              color: "rgba(255, 180, 124, 0.12)",
              label: this.template.skills.e
            })
          );
          this.game.schedule(delay, () => {
            this.game.zones.push(
              new Zone(this.game, {
                x: targetX,
                y: targetY,
                radius: 128,
                duration: 0.25,
                color: this.template.key === "zhouyu" ? "rgba(255, 120, 68, 0.24)" : "rgba(143, 219, 255, 0.24)"
              })
            );
            const enemies = this.game.getEnemiesInRadius(this.team, targetX, targetY, 128);
            enemies.forEach((enemy) => {
              this.game.dealDamage(this, enemy, 62 + this.getAbilityPower() * 0.58, "magic");
            });
          });
        }
        this.cooldowns.e = 23 * this.getCooldownMultiplier();
        return true;
      }

      return false;
    }

    attemptSkills(target) {
      if (!target || !target.alive || this.recallTimer > 0 || this.dash) {
        return;
      }

      const dist = distance(this, target);
      if (this.template.kit === "fighter") {
        if (this.cooldowns.e <= 0 && this.game.getEnemiesInRadius(this.team, this.x, this.y, 130).length >= 2) {
          this.castE();
          return;
        }
        if (this.cooldowns.w <= 0 && this.hp / this.getMaxHp() < 0.75) {
          this.castW();
          return;
        }
        if (this.cooldowns.q <= 0 && dist < 240) {
          this.castQ();
        }
      } else if (this.template.kit === "lancer") {
        if (this.cooldowns.w <= 0 && dist < 190) {
          this.castW();
        }
        if (this.cooldowns.e <= 0 && dist < 320) {
          this.castE();
          return;
        }
        if (this.cooldowns.q <= 0 && dist < 260) {
          this.castQ();
        }
      } else if (this.template.kit === "mage") {
        if (this.cooldowns.e <= 0 && dist < 430) {
          this.castE();
          return;
        }
        if (this.cooldowns.w <= 0 && dist < 320) {
          this.castW();
        }
        if (this.cooldowns.q <= 0 && dist < 470) {
          this.castQ();
        }
      }
    }

    updatePlayer(dt) {
      const keys = this.game.input.keys;
      let moveX = 0;
      let moveY = 0;

      if (keys.has("KeyW")) moveY -= 1;
      if (keys.has("KeyS")) moveY += 1;
      if (keys.has("KeyA")) moveX -= 1;
      if (keys.has("KeyD")) moveX += 1;

      const dir = normalize(moveX, moveY);
      const speed = this.getMoveSpeed();
      this.vx = dir.x * speed;
      this.vy = dir.y * speed;

      const aim = this.getAimPoint();
      this.setFacingTo(aim);

      if (this.game.consumeKey("KeyJ")) {
        this.castQ();
      }
      if (this.game.consumeKey("KeyK")) {
        this.castW();
      }
      if (this.game.consumeKey("KeyL")) {
        this.castE();
      }
      if (this.game.consumeKey("KeyB")) {
        this.startRecall();
      }

      this.target = this.game.findNearestEnemy(this, 320, { preferHero: true });
    }

    advanceAlongLane(dt) {
      const waypoint = this.route[this.currentWaypoint];
      if (!waypoint) {
        this.vx = 0;
        this.vy = 0;
        return;
      }

      const dir = normalize(waypoint.x - this.x, waypoint.y - this.y);
      this.vx = dir.x * this.getMoveSpeed() * 0.92;
      this.vy = dir.y * this.getMoveSpeed() * 0.92;
      if (dir.len < 58 && this.currentWaypoint < this.route.length - 1) {
        this.currentWaypoint += 1;
      }
    }

    retreatToBase() {
      const base = this.game.baseSpawns[this.team];
      const dir = normalize(base.x - this.x, base.y - this.y);
      this.vx = dir.x * this.getMoveSpeed();
      this.vy = dir.y * this.getMoveSpeed();
      this.setFacingTo(base);
    }

    updateBot(dt) {
      this.aiThink -= dt;
      const lowHp = this.hp / this.getMaxHp() < 0.32;
      const sight = this.template.kit === "mage" ? 500 : 380;

      if (!lowHp) {
        this.target = this.game.findNearestEnemy(this, sight, { preferHero: true });
      }

      if (lowHp && !this.atFountain()) {
        this.retreatToBase();
        return;
      }

      if (this.atFountain() && this.hp < this.getMaxHp() * 0.72) {
        this.vx = 0;
        this.vy = 0;
        return;
      }

      if (this.target && this.target.alive) {
        const dist = distance(this, this.target);
        if (this.aiThink <= 0) {
          this.aiThink = 0.2 + Math.random() * 0.25;
          this.attemptSkills(this.target);
        }

        if (this.template.kit === "mage") {
          const preferred = 255;
          if (dist > preferred) {
            const dir = normalize(this.target.x - this.x, this.target.y - this.y);
            this.vx = dir.x * this.getMoveSpeed() * 0.85;
            this.vy = dir.y * this.getMoveSpeed() * 0.85;
          } else if (dist < 180) {
            const dir = normalize(this.x - this.target.x, this.y - this.target.y);
            this.vx = dir.x * this.getMoveSpeed() * 0.8;
            this.vy = dir.y * this.getMoveSpeed() * 0.8;
          } else {
            this.vx = 0;
            this.vy = 0;
          }
        } else {
          if (dist > this.attackRange + this.target.radius + 8) {
            const dir = normalize(this.target.x - this.x, this.target.y - this.y);
            this.vx = dir.x * this.getMoveSpeed() * 0.95;
            this.vy = dir.y * this.getMoveSpeed() * 0.95;
          } else {
            this.vx = 0;
            this.vy = 0;
          }
        }
        this.setFacingTo(this.target);
        return;
      }

      this.advanceAlongLane(dt);
    }

    update(dt) {
      if (!this.alive) {
        this.respawnTimer -= dt;
        if (this.respawnTimer <= 0) {
          this.respawn();
        }
        return;
      }

      if (this.attackCooldown > 0) {
        this.attackCooldown -= dt;
      }
      this.cooldowns.q = Math.max(0, this.cooldowns.q - dt);
      this.cooldowns.w = Math.max(0, this.cooldowns.w - dt);
      this.cooldowns.e = Math.max(0, this.cooldowns.e - dt);

      if (this.isPlayer) {
        this.passiveGoldTicker += dt;
        while (this.passiveGoldTicker >= 1) {
          this.passiveGoldTicker -= 1;
          this.gold += 3;
        }
      }

      this.maxHp = this.getMaxHp();
      if (this.hp > this.maxHp) {
        this.hp = this.maxHp;
      }

      this.updateEffects(dt);

      if (this.effectTotals.healPerSecond > 0) {
        this.heal(this.effectTotals.healPerSecond * dt);
      }

      if (this.atFountain()) {
        this.heal(this.maxHp * 0.18 * dt + 18);
      }

      if (this.recallTimer > 0) {
        const moving = Math.abs(this.vx) + Math.abs(this.vy) > 0.5;
        if (moving) {
          this.recallTimer = 0;
          this.stateText = "";
        } else {
          this.recallTimer -= dt;
          if (this.recallTimer <= 0) {
            this.completeRecall();
          }
        }
      }

      if (this.dash) {
        this.vx = 0;
        this.vy = 0;
        this.performDash(dt);
      } else {
        if (this.isPlayer) {
          this.updatePlayer(dt);
        } else {
          this.updateBot(dt);
        }
        this.x += this.vx * dt;
        this.y += this.vy * dt;
      }

      this.x = clamp(this.x, 32, WORLD.width - 32);
      this.y = clamp(this.y, 32, WORLD.height - 32);

      this.tryAutoAttack();
    }

    render(ctx, camera) {
      if (!this.alive) {
        return;
      }

      const screenX = this.x - camera.x;
      const screenY = this.y - camera.y;
      const colors = TEAM_COLORS[this.team];

      ctx.save();
      ctx.translate(screenX, screenY);

      ctx.fillStyle = colors.fill;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6, 0, TAU);
      ctx.fill();

      if (this.isPlayer) {
        ctx.strokeStyle = "#f7d38a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 10, 0, TAU);
        ctx.stroke();
      }

      ctx.fillStyle = colors.main;
      ctx.beginPath();
      if (this.template.kit === "mage") {
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(this.radius, 0);
        ctx.lineTo(0, this.radius);
        ctx.lineTo(-this.radius, 0);
        ctx.closePath();
      } else {
        ctx.arc(0, 0, this.radius, 0, TAU);
      }
      ctx.fill();

      ctx.strokeStyle = colors.glow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.facing.x * (this.radius + 12), this.facing.y * (this.radius + 12));
      ctx.stroke();
      ctx.restore();

      this.game.drawHpBar(screenX, screenY - this.radius - 18, 72, this.hp / this.maxHp, this.team);

      ctx.fillStyle = "#f8f2e6";
      ctx.font = "13px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(`${this.name}  Lv.${this.level}`, screenX, screenY - this.radius - 28);

      if (this.recallTimer > 0) {
        ctx.fillStyle = "#ecd294";
        ctx.fillText(`回城 ${this.recallTimer.toFixed(1)}s`, screenX, screenY + this.radius + 24);
      }
    }
  }

  class Minion extends Entity {
    constructor(game, config) {
      super(game, {
        kind: "minion",
        team: config.team,
        name: config.typeName,
        x: config.x,
        y: config.y,
        radius: config.radius,
        maxHp: config.maxHp,
        hp: config.maxHp,
        armor: config.armor,
        magicResist: config.magicResist,
        attackRange: config.attackRange,
        bounty: config.bounty,
        xpValue: config.xpValue
      });
      this.typeName = config.typeName;
      this.attackDamage = config.attackDamage;
      this.attackType = config.attackType;
      this.damageType = config.damageType;
      this.speed = config.speed;
      this.attackInterval = config.attackInterval;
      this.attackCooldown = Math.random() * this.attackInterval;
      this.route = config.route;
      this.routeIndex = 1;
      this.target = null;
    }

    getOutgoingMultiplier() {
      return this.game.teamBuffs[this.team].altar > 0 ? 1.08 : 1;
    }

    stepAlongLane(dt) {
      const waypoint = this.route[this.routeIndex];
      if (!waypoint) {
        return;
      }
      const dir = normalize(waypoint.x - this.x, waypoint.y - this.y);
      this.x += dir.x * this.speed * dt;
      this.y += dir.y * this.speed * dt;
      if (dir.len < 28 && this.routeIndex < this.route.length - 1) {
        this.routeIndex += 1;
      }
    }

    update(dt) {
      if (!this.alive) {
        return;
      }
      this.attackCooldown -= dt;

      if (this.target && (!this.target.alive || distance(this, this.target) > 260)) {
        this.target = null;
      }

      if (!this.target) {
        this.target = this.game.findNearestEnemy(this, 210, { preferHero: false });
      }

      if (this.target && this.target.alive) {
        const dist = distance(this, this.target);
        if (dist <= this.attackRange + this.target.radius) {
          if (this.attackCooldown <= 0) {
            this.attackCooldown = this.attackInterval;
            if (this.attackType === "ranged") {
              this.game.projectiles.push(
                new Projectile(this.game, {
                  x: this.x,
                  y: this.y,
                  radius: 6,
                  speed: 430,
                  target: this.target,
                  team: this.team,
                  color: "#d4d4d4",
                  source: this,
                  damage: this.attackDamage,
                  damageType: this.damageType
                })
              );
            } else {
              this.game.dealDamage(this, this.target, this.attackDamage, this.damageType);
            }
          }
        } else if (dist < 250) {
          const dir = normalize(this.target.x - this.x, this.target.y - this.y);
          this.x += dir.x * this.speed * dt;
          this.y += dir.y * this.speed * dt;
        } else {
          this.stepAlongLane(dt);
        }
      } else {
        this.stepAlongLane(dt);
      }
    }

    render(ctx, camera) {
      if (!this.alive) {
        return;
      }
      const screenX = this.x - camera.x;
      const screenY = this.y - camera.y;
      const colors = TEAM_COLORS[this.team];

      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.fillStyle = colors.fill;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = colors.main;
      ctx.beginPath();
      if (this.attackType === "ranged") {
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(this.radius, this.radius);
        ctx.lineTo(-this.radius, this.radius);
      } else {
        ctx.rect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      this.game.drawHpBar(screenX, screenY - this.radius - 12, 36, this.hp / this.maxHp, this.team);
    }
  }

  class Tower extends Entity {
    constructor(game, config) {
      super(game, {
        kind: "tower",
        team: config.team,
        name: config.name,
        x: config.x,
        y: config.y,
        radius: 32,
        maxHp: config.maxHp,
        hp: config.maxHp,
        armor: 18,
        magicResist: 16,
        attackRange: config.attackRange,
        bounty: 180,
        xpValue: 90
      });
      this.attackDamage = config.attackDamage;
      this.attackInterval = config.attackInterval;
      this.attackCooldown = Math.random() * this.attackInterval;
    }

    update(dt) {
      if (!this.alive) {
        return;
      }

      this.attackCooldown -= dt;
      const target = this.game.findStructureTarget(this.team, this.x, this.y, this.attackRange);
      if (target && this.attackCooldown <= 0) {
        this.attackCooldown = this.attackInterval;
        this.game.projectiles.push(
          new Projectile(this.game, {
            x: this.x,
            y: this.y,
            radius: 8,
            speed: 520,
            target,
            team: this.team,
            color: this.team === BLUE ? "#8edfff" : "#ffb08d",
            source: this,
            damage: this.attackDamage,
            damageType: "physical"
          })
        );
      }
    }

    render(ctx, camera) {
      if (!this.alive) {
        return;
      }
      const screenX = this.x - camera.x;
      const screenY = this.y - camera.y;
      const colors = TEAM_COLORS[this.team];

      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.fillStyle = colors.fill;
      ctx.beginPath();
      ctx.rect(-30, -30, 60, 60);
      ctx.fill();
      ctx.fillStyle = colors.main;
      ctx.beginPath();
      ctx.moveTo(0, -34);
      ctx.lineTo(34, 0);
      ctx.lineTo(0, 34);
      ctx.lineTo(-34, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      this.game.drawHpBar(screenX, screenY - 42, 90, this.hp / this.maxHp, this.team);
      ctx.fillStyle = "#efe8d5";
      ctx.font = "12px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(this.name, screenX, screenY - 52);
    }
  }

  class BaseCore extends Entity {
    constructor(game, config) {
      super(game, {
        kind: "base",
        team: config.team,
        name: config.name,
        x: config.x,
        y: config.y,
        radius: 46,
        maxHp: 5200,
        hp: 5200,
        armor: 20,
        magicResist: 20
      });
      this.attackDamage = 180;
      this.attackRange = 370;
      this.attackInterval = 1.35;
      this.attackCooldown = 0.8;
    }

    update(dt) {
      if (!this.alive) {
        return;
      }

      this.attackCooldown -= dt;
      const target = this.game.findStructureTarget(this.team, this.x, this.y, this.attackRange);
      if (target && this.attackCooldown <= 0) {
        this.attackCooldown = this.attackInterval;
        this.game.projectiles.push(
          new Projectile(this.game, {
            x: this.x,
            y: this.y,
            radius: 10,
            speed: 580,
            target,
            team: this.team,
            color: this.team === BLUE ? "#a3f2ff" : "#ffb18b",
            source: this,
            damage: this.attackDamage,
            damageType: "magic"
          })
        );
      }
    }

    die(killer, options = {}) {
      if (!this.alive) {
        return;
      }
      super.die(killer, options);
      this.game.endGame(this.team === BLUE ? RED : BLUE);
    }

    render(ctx, camera) {
      if (!this.alive) {
        return;
      }

      const screenX = this.x - camera.x;
      const screenY = this.y - camera.y;
      const colors = TEAM_COLORS[this.team];
      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.fillStyle = colors.fill;
      ctx.beginPath();
      ctx.arc(0, 0, 62, 0, TAU);
      ctx.fill();
      ctx.fillStyle = colors.main;
      ctx.beginPath();
      ctx.moveTo(0, -52);
      ctx.lineTo(46, 0);
      ctx.lineTo(0, 52);
      ctx.lineTo(-46, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = colors.glow;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 56, 0, TAU);
      ctx.stroke();
      ctx.restore();
      this.game.drawHpBar(screenX, screenY - 66, 132, this.hp / this.maxHp, this.team);
      ctx.fillStyle = "#fff4d8";
      ctx.font = "bold 14px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(this.name, screenX, screenY - 80);
    }
  }

  class Projectile {
    constructor(game, config) {
      this.game = game;
      this.id = nextId();
      this.x = config.x;
      this.y = config.y;
      this.radius = config.radius || 6;
      this.speed = config.speed || 400;
      this.team = config.team;
      this.color = config.color || "#ffffff";
      this.source = config.source || null;
      this.target = config.target || null;
      this.direction = config.direction || null;
      this.damage = config.damage || 0;
      this.damageType = config.damageType || "physical";
      this.blastRadius = config.blastRadius || 0;
      this.alive = true;
      this.life = 2.2;
    }

    update(dt) {
      if (!this.alive) {
        return;
      }

      this.life -= dt;
      if (this.life <= 0) {
        this.alive = false;
        return;
      }

      let dir;
      if (this.target && this.target.alive) {
        dir = normalize(this.target.x - this.x, this.target.y - this.y);
      } else if (this.direction) {
        dir = this.direction;
      } else {
        this.alive = false;
        return;
      }

      this.x += dir.x * this.speed * dt;
      this.y += dir.y * this.speed * dt;

      let hitTarget =
        this.target && this.target.alive && pointDistance(this.x, this.y, this.target.x, this.target.y) < this.radius + this.target.radius + 4
          ? this.target
          : null;

      if (!hitTarget && !this.target) {
        hitTarget =
          this.game
            .getEnemiesInRadius(this.team, this.x, this.y, this.radius + 4)
            .sort(
              (a, b) =>
                pointDistance(this.x, this.y, a.x, a.y) -
                pointDistance(this.x, this.y, b.x, b.y)
            )[0] || null;
      }

      if (hitTarget) {
        if (this.blastRadius > 0) {
          this.game.zones.push(
            new Zone(this.game, {
              x: hitTarget.x,
              y: hitTarget.y,
              radius: this.blastRadius,
              duration: 0.22,
              color: "rgba(255, 214, 126, 0.18)"
            })
          );
          const enemies = this.game.getEnemiesInRadius(this.team, hitTarget.x, hitTarget.y, this.blastRadius);
          enemies.forEach((enemy) => {
            this.game.dealDamage(this.source, enemy, this.damage, this.damageType);
          });
        } else {
          this.game.dealDamage(this.source, hitTarget, this.damage, this.damageType);
        }
        this.alive = false;
      }
    }

    render(ctx, camera) {
      if (!this.alive) {
        return;
      }
      const screenX = this.x - camera.x;
      const screenY = this.y - camera.y;
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  class Zone {
    constructor(game, config) {
      this.game = game;
      this.id = nextId();
      this.x = config.x;
      this.y = config.y;
      this.radius = config.radius || 100;
      this.duration = config.duration || 0.5;
      this.interval = config.interval || 0;
      this.tickLeft = this.interval;
      this.team = config.team || null;
      this.color = config.color || "rgba(255,255,255,0.12)";
      this.follow = config.follow || null;
      this.label = config.label || "";
      this.onTick = config.onTick || null;
      this.alive = true;
    }

    update(dt) {
      if (!this.alive) {
        return;
      }

      if (this.follow) {
        if (!this.follow.alive) {
          this.alive = false;
          return;
        }
        this.x = this.follow.x;
        this.y = this.follow.y;
      }

      if (this.interval && this.onTick) {
        this.tickLeft -= dt;
        while (this.tickLeft <= 0) {
          this.tickLeft += this.interval;
          this.onTick(this);
        }
      }

      this.duration -= dt;
      if (this.duration <= 0) {
        this.alive = false;
      }
    }

    render(ctx, camera) {
      if (!this.alive) {
        return;
      }

      const screenX = this.x - camera.x;
      const screenY = this.y - camera.y;
      ctx.save();
      ctx.strokeStyle = this.color;
      ctx.fillStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius, 0, TAU);
      ctx.fill();
      ctx.stroke();
      if (this.label && this.follow && this.duration > 1) {
        ctx.fillStyle = "#efe6d0";
        ctx.font = "12px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText(this.label, screenX, screenY - this.radius - 6);
      }
      ctx.restore();
    }
  }

  class FloatingText {
    constructor(x, y, text, color) {
      this.x = x;
      this.y = y;
      this.text = text;
      this.color = color;
      this.life = 0.85;
    }

    update(dt) {
      this.life -= dt;
      this.y -= 28 * dt;
    }

    render(ctx, camera) {
      if (this.life <= 0) {
        return;
      }
      const alpha = clamp(this.life / 0.85, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.font = "bold 14px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(this.text, this.x - camera.x, this.y - camera.y);
      ctx.restore();
    }
  }

  class Game {
    constructor(canvasNode) {
      this.canvas = canvasNode;
      this.ctx = ctx;
      this.width = 1280;
      this.height = 720;
      this.camera = { x: 0, y: 0 };
      this.time = 0;
      this.lastTimestamp = performance.now();
      this.state = "menu";
      this.events = [];
      this.messages = [];
      this.floatingTexts = [];
      this.flashes = [];
      this.heroes = [];
      this.minions = [];
      this.towers = [];
      this.bases = [];
      this.projectiles = [];
      this.zones = [];
      this.paths = {
        [BLUE]: BLUE_PATHS,
        [RED]: {
          top: reversePath(BLUE_PATHS.top),
          mid: reversePath(BLUE_PATHS.mid),
          bot: reversePath(BLUE_PATHS.bot)
        }
      };
      this.baseSpawns = {
        [BLUE]: { x: BLUE_PATHS.top[0].x, y: BLUE_PATHS.top[0].y },
        [RED]: { x: this.paths[RED].top[0].x, y: this.paths[RED].top[0].y }
      };
      this.teamBuffs = { [BLUE]: { altar: 0 }, [RED]: { altar: 0 } };
      this.altar = { owner: null, captor: null, progress: 0 };
      this.waveNumber = 0;
      this.nextWaveAt = 2.2;
      this.player = null;
      this.selectedHero = null;
      this.input = {
        keys: new Set(),
        pressed: new Set(),
        mouseScreen: { x: 0, y: 0 },
        mouseWorld: { x: 0, y: 0 }
      };
      this.setupInput();
      this.resize();
      window.addEventListener("resize", () => this.resize());
      requestAnimationFrame((ts) => this.loop(ts));
    }

    setupInput() {
      window.addEventListener("keydown", (event) => {
        if (!this.input.keys.has(event.code)) {
          this.input.pressed.add(event.code);
        }
        this.input.keys.add(event.code);
      });

      window.addEventListener("keyup", (event) => {
        this.input.keys.delete(event.code);
      });

      this.canvas.addEventListener("mousemove", (event) => {
        const rect = this.canvas.getBoundingClientRect();
        this.input.mouseScreen.x = event.clientX - rect.left;
        this.input.mouseScreen.y = event.clientY - rect.top;
        this.input.mouseWorld.x = this.input.mouseScreen.x + this.camera.x;
        this.input.mouseWorld.y = this.input.mouseScreen.y + this.camera.y;
      });

      shopButtons.forEach((button) => {
        button.addEventListener("click", () => {
          if (this.player && this.player.buy(button.dataset.item)) {
            this.updateSidebar();
          }
        });
      });
    }

    consumeKey(code) {
      if (this.input.pressed.has(code)) {
        this.input.pressed.delete(code);
        return true;
      }
      return false;
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = Math.max(900, Math.floor(rect.width || 1280));
      this.canvas.height = Math.max(540, Math.floor(rect.height || 720));
      this.width = this.canvas.width;
      this.height = this.canvas.height;
    }

    schedule(delay, callback) {
      this.events.push({ at: this.time + delay, callback });
    }

    announce(text, team = null) {
      this.messages.push({
        text,
        team,
        life: 3.2
      });
    }

    addFloatingText(x, y, text, color) {
      this.floatingTexts.push(new FloatingText(x, y, text, color));
    }

    flashArc(x, y, radius, facing, team) {
      this.flashes.push({
        x,
        y,
        radius,
        facing,
        team,
        life: 0.18
      });
    }

    clearBoard() {
      this.events = [];
      this.messages = [];
      this.floatingTexts = [];
      this.flashes = [];
      this.heroes = [];
      this.minions = [];
      this.towers = [];
      this.bases = [];
      this.projectiles = [];
      this.zones = [];
      this.teamBuffs = { [BLUE]: { altar: 0 }, [RED]: { altar: 0 } };
      this.altar = { owner: null, captor: null, progress: 0 };
      this.waveNumber = 0;
      this.nextWaveAt = 2.2;
      this.time = 0;
      bodyEl.classList.remove("playing");
    }

    startMatch(heroKey) {
      this.clearBoard();
      this.selectedHero = heroKey;

      this.bases.push(
        new BaseCore(this, { team: BLUE, name: "蜀营帅帐", x: 230, y: 1370 }),
        new BaseCore(this, { team: RED, name: "魏营帅帐", x: 2170, y: 230 })
      );

      const towerDefs = [
        { team: BLUE, name: "上路楼橹", x: 270, y: 900 },
        { team: BLUE, name: "中路楼橹", x: 540, y: 1180 },
        { team: BLUE, name: "下路楼橹", x: 760, y: 1330 },
        { team: BLUE, name: "帅帐箭台", x: 420, y: 1190 },
        { team: RED, name: "上路楼橹", x: 1640, y: 250 },
        { team: RED, name: "中路楼橹", x: 1860, y: 440 },
        { team: RED, name: "下路楼橹", x: 2130, y: 720 },
        { team: RED, name: "帅帐箭台", x: 1980, y: 410 }
      ];

      towerDefs.forEach((definition) => {
        this.towers.push(
          new Tower(this, {
            ...definition,
            maxHp: definition.name.includes("箭台") ? 2400 : 1950,
            attackRange: definition.name.includes("箭台") ? 340 : 315,
            attackDamage: definition.name.includes("箭台") ? 170 : 152,
            attackInterval: definition.name.includes("箭台") ? 1.15 : 1.05
          })
        );
      });

      const playerTemplate = HERO_TEMPLATES[heroKey];
      this.player = new Hero(this, playerTemplate, BLUE, "mid", {
        isPlayer: true,
        spawnOffsetX: -30
      });

      const allyKeys = ["guanyu", "zhaoyun", "zhugeliang"].filter((key) => key !== heroKey);
      const allyLanes = ["top", "bot"];

      this.heroes.push(this.player);

      allyKeys.forEach((key, index) => {
        this.heroes.push(
          new Hero(this, HERO_TEMPLATES[key], BLUE, allyLanes[index], {
            spawnOffsetX: 20 + index * 34,
            spawnOffsetY: allyLanes[index] === "top" ? -32 : 34
          })
        );
      });

      this.heroes.push(
        new Hero(this, HERO_TEMPLATES.lubu, RED, "top", { spawnOffsetX: -20 }),
        new Hero(this, HERO_TEMPLATES.zhouyu, RED, "mid", { spawnOffsetX: 10 }),
        new Hero(this, HERO_TEMPLATES.xiahoudun, RED, "bot", { spawnOffsetX: 40 })
      );

      heroSelect.classList.add("hidden");
      endOverlay.classList.add("hidden");
      this.state = "playing";
      bodyEl.classList.add("playing");
      this.announce("战鼓响起，兵分三路。", null);
      this.updateSidebar();
    }

    endGame(winnerTeam) {
      if (this.state === "ended") {
        return;
      }
      this.state = "ended";
      const victory = winnerTeam === BLUE;
      endTitle.textContent = victory ? "蜀军得胜" : "敌军攻破帅帐";
      endText.textContent = victory
        ? "你们已经摧毁敌方帅帐，这一局群雄峡谷归你了。"
        : "己方帅帐被击破了。别慌，这个原型支持马上重开再打一把。";
      endOverlay.classList.remove("hidden");
    }

    dealDamage(source, target, amount, type = "physical", options = {}) {
      if (!target || !target.alive) {
        return 0;
      }

      const multiplier =
        source && typeof source.getOutgoingMultiplier === "function"
          ? source.getOutgoingMultiplier(type)
          : 1;

      return target.takeDamage(source, amount * multiplier, type, options);
    }

    getAllUnits() {
      return [...this.heroes, ...this.minions, ...this.towers, ...this.bases];
    }

    getEnemiesInRadius(team, x, y, radius, predicate = null) {
      return this.getAllUnits().filter((unit) => {
        if (!unit.alive || unit.team === team) {
          return false;
        }
        if (predicate && !predicate(unit)) {
          return false;
        }
        return pointDistance(x, y, unit.x, unit.y) <= radius + unit.radius;
      });
    }

    getAlliesInRadius(team, x, y, radius, predicate = null) {
      return this.getAllUnits().filter((unit) => {
        if (!unit.alive || unit.team !== team) {
          return false;
        }
        if (predicate && !predicate(unit)) {
          return false;
        }
        return pointDistance(x, y, unit.x, unit.y) <= radius + unit.radius;
      });
    }

    findNearestEnemy(source, range, options = {}) {
      const pool = [];
      pool.push(...this.heroes, ...this.minions, ...this.towers, ...this.bases);
      let chosen = null;
      let best = Infinity;

      for (const unit of pool) {
        if (!unit.alive || unit.team === source.team || unit.id === source.id) {
          continue;
        }
        const dist = distance(source, unit);
        if (dist > range + unit.radius) {
          continue;
        }
        let score = dist;
        if (options.preferHero && unit.kind === "hero") {
          score -= 90;
        }
        if (unit.kind === "tower" || unit.kind === "base") {
          score += 40;
        }
        if (score < best) {
          best = score;
          chosen = unit;
        }
      }
      return chosen;
    }

    findStructureTarget(team, x, y, range) {
      const enemies = this.getAllUnits().filter((unit) => {
        if (!unit.alive || unit.team === team) {
          return false;
        }
        return pointDistance(x, y, unit.x, unit.y) <= range + unit.radius;
      });

      const minions = enemies.filter((unit) => unit.kind === "minion");
      const pool = minions.length ? minions : enemies;
      pool.sort(
        (a, b) => pointDistance(x, y, a.x, a.y) - pointDistance(x, y, b.x, b.y)
      );
      return pool[0] || null;
    }

    spawnWave(team) {
      const waveStrength = 1 + this.waveNumber * 0.035 + (this.teamBuffs[team].altar > 0 ? 0.12 : 0);
      LANES.forEach((lane) => {
        const path = this.paths[team][lane];
        const formation = [
          { typeName: "刀盾兵", role: "melee", lateral: -18, along: 10 },
          { typeName: "刀盾兵", role: "melee", lateral: 18, along: 42 },
          { typeName: this.waveNumber % 3 === 2 ? "冲车" : "弩手", role: this.waveNumber % 3 === 2 ? "siege" : "ranged", lateral: 0, along: 76 }
        ];

        formation.forEach((slot) => {
          const pos = laneSpawnOffset(path, slot.lateral, slot.along);
          const isSiege = slot.role === "siege";
          const isRanged = slot.role === "ranged";
          this.minions.push(
            new Minion(this, {
              team,
              typeName: slot.typeName,
              x: pos.x,
              y: pos.y,
              route: path,
              radius: isSiege ? 18 : 14,
              maxHp: (isSiege ? 390 : isRanged ? 220 : 280) * waveStrength,
              armor: isSiege ? 10 : 6,
              magicResist: isSiege ? 8 : 4,
              attackRange: isSiege ? 250 : isRanged ? 225 : 82,
              attackDamage: (isSiege ? 60 : isRanged ? 35 : 28) * waveStrength,
              attackType: isSiege || isRanged ? "ranged" : "melee",
              damageType: "physical",
              speed: isSiege ? 108 : 132,
              attackInterval: isSiege ? 1.55 : isRanged ? 1.25 : 0.95,
              bounty: isSiege ? 54 : isRanged ? 36 : 28,
              xpValue: isSiege ? 70 : 48
            })
          );
        });
      });
    }

    handleEntityDeath(entity, killer) {
      if (entity.kind === "minion") {
        const team = killer ? killer.team : null;
        if (team) {
          this.heroes
            .filter((hero) => hero.team === team && hero.alive && distance(hero, entity) < 420)
            .forEach((hero) => {
              hero.gainExp(entity.xpValue);
              if (hero.isPlayer) {
                hero.gainGold(Math.round(entity.bounty * (hero === killer ? 1 : 0.55)));
              }
            });
        }
      } else if (entity.kind === "hero") {
        const team = killer ? killer.team : null;
        if (team) {
          this.heroes
            .filter((hero) => hero.team === team && hero.alive)
            .forEach((hero) => {
              hero.gainExp(hero === killer ? 210 : 140);
              if (hero.isPlayer) {
                hero.gainGold(hero === killer ? 260 : 110);
              }
            });
        }
      } else if (entity.kind === "tower") {
        this.announce(`${entity.name} 被攻破`, entity.team === BLUE ? RED : BLUE);
        const winners = this.heroes.filter((hero) => hero.team !== entity.team && hero.alive);
        winners.forEach((hero) => {
          hero.gainExp(90);
          if (hero.isPlayer) {
            hero.gainGold(120);
          }
        });
      }
      this.updateSidebar();
    }

    updateAltar(dt) {
      const blueHeroes = this.heroes.filter(
        (hero) => hero.alive && hero.team === BLUE && pointDistance(hero.x, hero.y, ALTAR_POS.x, ALTAR_POS.y) < ALTAR_RADIUS
      );
      const redHeroes = this.heroes.filter(
        (hero) => hero.alive && hero.team === RED && pointDistance(hero.x, hero.y, ALTAR_POS.x, ALTAR_POS.y) < ALTAR_RADIUS
      );

      if (blueHeroes.length && !redHeroes.length) {
        if (this.altar.captor !== BLUE) {
          this.altar.captor = BLUE;
          this.altar.progress = Math.max(0, this.altar.progress - dt * 0.8);
        } else {
          this.altar.progress += dt;
        }
      } else if (redHeroes.length && !blueHeroes.length) {
        if (this.altar.captor !== RED) {
          this.altar.captor = RED;
          this.altar.progress = Math.max(0, this.altar.progress - dt * 0.8);
        } else {
          this.altar.progress += dt;
        }
      } else {
        this.altar.progress = Math.max(0, this.altar.progress - dt * 0.35);
      }

      if (this.altar.progress >= 4) {
        this.altar.owner = this.altar.captor;
        this.teamBuffs[this.altar.owner].altar = 55;
        this.altar.progress = 0;
        this.announce(
          this.altar.owner === BLUE ? "祭坛被我方夺下，全军士气高涨。" : "敌军占下祭坛，推进会更凶。",
          this.altar.owner
        );
      }
    }

    updateSidebar() {
      if (!this.player) {
        heroStatsEl.textContent = "选将后会在这里显示实时属性、经济和背包。";
        return;
      }

      const player = this.player;
      const inventory = player.inventory.length
        ? `<div class="inventory">${player.inventory.map((name) => `<span>${name}</span>`).join("")}</div>`
        : `<div class="stats-empty">背包还是空的，回基地后可以购买装备。</div>`;

      heroStatsEl.innerHTML = `
        <div class="stat-grid">
          <div class="stat-card"><strong>${player.name}</strong><span>${player.template.title} · ${player.template.role}</span></div>
          <div class="stat-card"><strong>等级 ${player.level}</strong><span>经验 ${Math.floor(player.exp)} / ${XP_LEVELS[Math.min(player.level + 1, XP_LEVELS.length - 1)]}</span></div>
          <div class="stat-card"><strong>生命 ${Math.ceil(player.hp)} / ${Math.ceil(player.maxHp)}</strong><span>护甲 ${Math.round(player.getArmor())} · 法抗 ${Math.round(player.getMagicResist())}</span></div>
          <div class="stat-card"><strong>金币 ${Math.floor(player.gold)}</strong><span>攻 ${Math.round(player.getAttackDamage())} · 谋 ${Math.round(player.getAbilityPower())}</span></div>
          <div class="stat-card"><strong>移速 ${Math.round(player.getMoveSpeed())}</strong><span>攻速 ${player.getAttackSpeed().toFixed(2)} 次/秒</span></div>
          <div class="stat-card"><strong>${player.atFountain() ? "营中整备" : "前线作战"}</strong><span>${player.atFountain() ? "可回血并购买装备" : "注意塔下和祭坛时机"}</span></div>
          <div class="stat-card"><strong>祭坛增益 ${this.teamBuffs[BLUE].altar > 0 ? `${Math.ceil(this.teamBuffs[BLUE].altar)}s` : "无"}</strong><span>在中央祭坛站住即可争夺</span></div>
        </div>
        <div>
          <h3>技能提示</h3>
          <ul class="notes">
            ${player.template.skillTips.map((tip) => `<li>${tip}</li>`).join("")}
          </ul>
        </div>
        <div>
          <h3>背包</h3>
          ${inventory}
        </div>
      `;

      shopButtons.forEach((button) => {
        const item = SHOP_ITEMS[button.dataset.item];
        const canBuy = player.atFountain() && player.gold >= item.cost;
        button.disabled = !canBuy;
        button.classList.toggle("available", canBuy);
      });
    }

    update(dt) {
      this.time += dt;

      this.teamBuffs[BLUE].altar = Math.max(0, this.teamBuffs[BLUE].altar - dt);
      this.teamBuffs[RED].altar = Math.max(0, this.teamBuffs[RED].altar - dt);
      this.updateAltar(dt);

      if (this.time >= this.nextWaveAt) {
        this.waveNumber += 1;
        this.spawnWave(BLUE);
        this.spawnWave(RED);
        this.nextWaveAt += WAVE_INTERVAL;
      }

      for (let i = this.events.length - 1; i >= 0; i -= 1) {
        if (this.events[i].at <= this.time) {
          const callback = this.events[i].callback;
          this.events.splice(i, 1);
          callback();
        }
      }

      this.heroes.forEach((hero) => hero.update(dt));
      this.minions.forEach((minion) => minion.update(dt));
      this.towers.forEach((tower) => tower.update(dt));
      this.bases.forEach((base) => base.update(dt));
      this.projectiles.forEach((projectile) => projectile.update(dt));
      this.zones.forEach((zone) => zone.update(dt));
      this.floatingTexts.forEach((text) => text.update(dt));

      this.projectiles = this.projectiles.filter((projectile) => projectile.alive);
      this.zones = this.zones.filter((zone) => zone.alive);
      this.minions = this.minions.filter((minion) => minion.alive);
      this.towers = this.towers.filter((tower) => tower.alive);
      this.floatingTexts = this.floatingTexts.filter((text) => text.life > 0);
      this.flashes = this.flashes
        .map((flash) => ({ ...flash, life: flash.life - dt }))
        .filter((flash) => flash.life > 0);
      this.messages = this.messages
        .map((message) => ({ ...message, life: message.life - dt }))
        .filter((message) => message.life > 0);

      this.updateCamera();
      if (Math.floor(this.time * 5) !== Math.floor((this.time - dt) * 5)) {
        this.updateSidebar();
      }
    }

    updateCamera() {
      const focus = this.player && this.player.alive ? this.player : { x: this.baseSpawns[BLUE].x, y: this.baseSpawns[BLUE].y };
      this.camera.x = clamp(focus.x - this.width / 2, 0, WORLD.width - this.width);
      this.camera.y = clamp(focus.y - this.height / 2, 0, WORLD.height - this.height);
      this.input.mouseWorld.x = this.input.mouseScreen.x + this.camera.x;
      this.input.mouseWorld.y = this.input.mouseScreen.y + this.camera.y;
    }

    drawHpBar(x, y, width, ratio, team) {
      const startX = x - width / 2;
      this.drawMeter(startX, y, width, 8, ratio, TEAM_COLORS[team].main, "rgba(0,0,0,0.55)");
    }

    drawPanel(x, y, width, height, options = {}) {
      const drawCtx = this.ctx;
      const radius = options.radius || 18;
      drawCtx.save();
      roundedRectPath(drawCtx, x, y, width, height, radius);
      drawCtx.fillStyle = options.fill || "rgba(6, 11, 10, 0.78)";
      drawCtx.fill();
      if (options.innerGlow) {
        drawCtx.strokeStyle = options.innerGlow;
        drawCtx.lineWidth = 1;
        drawCtx.stroke();
      }
      drawCtx.strokeStyle = options.stroke || "rgba(245, 223, 177, 0.14)";
      drawCtx.lineWidth = options.lineWidth || 1.2;
      drawCtx.stroke();
      drawCtx.restore();
    }

    drawMeter(x, y, width, height, ratio, fill, background = "rgba(0,0,0,0.42)") {
      const drawCtx = this.ctx;
      drawCtx.save();
      roundedRectPath(drawCtx, x, y, width, height, height / 2);
      drawCtx.fillStyle = background;
      drawCtx.fill();
      const fillWidth = Math.max(0, (width - 2) * clamp(ratio, 0, 1));
      if (fillWidth > 0) {
        roundedRectPath(drawCtx, x + 1, y + 1, fillWidth, Math.max(2, height - 2), Math.max(1, (height - 2) / 2));
        drawCtx.fillStyle = fill;
        drawCtx.fill();
      }
      drawCtx.restore();
    }

    renderTacticalMap(x, y, width, height) {
      const ctx = this.ctx;
      this.drawPanel(x, y, width, height, {
        radius: 20,
        fill: "rgba(6, 11, 10, 0.82)",
        stroke: "rgba(255, 230, 182, 0.12)"
      });

      const inset = 14;
      const innerX = x + inset;
      const innerY = y + inset + 10;
      const innerW = width - inset * 2;
      const innerH = height - inset * 2 - 10;
      const scaleX = innerW / WORLD.width;
      const scaleY = innerH / WORLD.height;

      ctx.save();
      roundedRectPath(ctx, innerX, innerY, innerW, innerH, 14);
      ctx.fillStyle = "#08110f";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.stroke();

      ctx.strokeStyle = "rgba(220, 186, 116, 0.18)";
      ctx.lineWidth = 4;
      Object.values(BLUE_PATHS).forEach((path) => {
        ctx.beginPath();
        ctx.moveTo(innerX + path[0].x * scaleX, innerY + path[0].y * scaleY);
        for (let index = 1; index < path.length; index += 1) {
          ctx.lineTo(innerX + path[index].x * scaleX, innerY + path[index].y * scaleY);
        }
        ctx.stroke();
      });

      [...this.towers, ...this.bases, ...this.heroes].forEach((unit) => {
        if (!unit.alive) {
          return;
        }
        ctx.fillStyle = unit.team === BLUE ? "#7ed8ff" : "#ff978a";
        const radius = unit.kind === "hero" ? 4 : unit.kind === "base" ? 5 : 3;
        ctx.beginPath();
        ctx.arc(innerX + unit.x * scaleX, innerY + unit.y * scaleY, radius, 0, TAU);
        ctx.fill();
      });

      roundedRectPath(
        ctx,
        innerX + this.camera.x * scaleX,
        innerY + this.camera.y * scaleY,
        this.width * scaleX,
        this.height * scaleY,
        10
      );
      ctx.strokeStyle = "rgba(255, 240, 212, 0.22)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#efe7cf";
      ctx.font = "12px Segoe UI";
      ctx.textAlign = "left";
      ctx.fillText("战场俯瞰", x + 16, y + 20);
      ctx.restore();
    }

    renderMap() {
      const ctx = this.ctx;
      ctx.fillStyle = "#112019";
      ctx.fillRect(0, 0, this.width, this.height);

      const offsetX = -this.camera.x;
      const offsetY = -this.camera.y;

      ctx.save();
      ctx.translate(offsetX, offsetY);

      ctx.fillStyle = "#183127";
      ctx.fillRect(0, 0, WORLD.width, WORLD.height);

      ctx.fillStyle = "rgba(73, 121, 101, 0.26)";
      ctx.beginPath();
      ctx.moveTo(0, 980);
      ctx.lineTo(950, 720);
      ctx.lineTo(1250, 820);
      ctx.lineTo(WORLD.width, 420);
      ctx.lineTo(WORLD.width, 620);
      ctx.lineTo(1320, 960);
      ctx.lineTo(980, 860);
      ctx.lineTo(0, 1180);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(217, 186, 122, 0.28)";
      ctx.lineWidth = 48;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      Object.values(BLUE_PATHS).forEach((path) => {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i += 1) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
      });

      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 10;
      Object.values(BLUE_PATHS).forEach((path) => {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i += 1) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
      });

      for (let i = 0; i < 8; i += 1) {
        const x = 380 + i * 260;
        const y = i % 2 === 0 ? 190 : 1410;
        ctx.fillStyle = "rgba(38, 72, 56, 0.46)";
        ctx.beginPath();
        ctx.arc(x, y, 68, 0, TAU);
        ctx.fill();
      }

      ctx.strokeStyle = this.altar.owner === BLUE ? "#7ed8ff" : this.altar.owner === RED ? "#ff978a" : "rgba(255,255,255,0.18)";
      ctx.fillStyle = "rgba(255, 246, 214, 0.04)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(ALTAR_POS.x, ALTAR_POS.y, ALTAR_RADIUS, 0, TAU);
      ctx.fill();
      ctx.stroke();

      if (this.altar.progress > 0 && this.altar.captor) {
        ctx.strokeStyle = this.altar.captor === BLUE ? "#7ed8ff" : "#ff978a";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(ALTAR_POS.x, ALTAR_POS.y, ALTAR_RADIUS + 14, -Math.PI / 2, -Math.PI / 2 + (this.altar.progress / 4) * TAU);
        ctx.stroke();
      }

      ctx.fillStyle = "#f0e4c6";
      ctx.font = "14px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText("龙魂祭坛", ALTAR_POS.x, ALTAR_POS.y - ALTAR_RADIUS - 16);
      ctx.restore();
    }

    renderFlashes() {
      const ctx = this.ctx;
      this.flashes.forEach((flash) => {
        const alpha = clamp(flash.life / 0.18, 0, 1);
        const x = flash.x - this.camera.x;
        const y = flash.y - this.camera.y;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = flash.team === BLUE ? "#9ce4ff" : "#ffc4a4";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x, y, flash.radius, Math.atan2(flash.facing.y, flash.facing.x) - 0.5, Math.atan2(flash.facing.y, flash.facing.x) + 0.5);
        ctx.stroke();
        ctx.restore();
      });
    }

    renderMessages() {
      const ctx = this.ctx;
      this.messages.forEach((message, index) => {
        ctx.save();
        ctx.globalAlpha = clamp(message.life / 3.2, 0, 1);
        ctx.fillStyle =
          message.team === BLUE ? "#9ce4ff" : message.team === RED ? "#ffb59f" : "#f3e3bd";
        ctx.font = "bold 18px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText(message.text, this.width / 2, 48 + index * 24);
        ctx.restore();
      });
    }

    renderUi() {
      if (!this.player) {
        return;
      }

      const player = this.player;
      const ctx = this.ctx;
      const blueBase = this.bases.find((base) => base.team === BLUE);
      const redBase = this.bases.find((base) => base.team === RED);
      const altarText =
        this.teamBuffs[BLUE].altar > 0
          ? `我方祭坛 ${Math.ceil(this.teamBuffs[BLUE].altar)}s`
          : this.teamBuffs[RED].altar > 0
            ? `敌方祭坛 ${Math.ceil(this.teamBuffs[RED].altar)}s`
            : this.altar.captor
              ? "祭坛争夺中"
              : "祭坛空置";

      this.drawPanel(this.width / 2 - 240, 16, 480, 64, {
        radius: 22,
        fill: "rgba(8, 13, 12, 0.82)",
        stroke: "rgba(255, 232, 182, 0.16)"
      });

      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "#f7e9c8";
      ctx.font = "bold 14px Segoe UI";
      ctx.fillText("蜀", this.width / 2 - 188, 39);
      ctx.fillText("魏", this.width / 2 + 188, 39);
      ctx.font = "bold 20px Segoe UI";
      ctx.fillText(formatTime(this.time), this.width / 2, 38);
      ctx.font = "12px Segoe UI";
      ctx.fillStyle = "#cbbd9d";
      ctx.fillText(altarText, this.width / 2, 58);
      this.drawMeter(this.width / 2 - 170, 48, 110, 8, blueBase.hp / blueBase.maxHp, "#76d8ff");
      this.drawMeter(this.width / 2 + 60, 48, 110, 8, redBase.hp / redBase.maxHp, "#ff867c");
      ctx.fillText(`帅帐 ${Math.round(blueBase.hp)}`, this.width / 2 - 115, 64);
      ctx.fillText(`帅帐 ${Math.round(redBase.hp)}`, this.width / 2 + 115, 64);

      const portraitX = 18;
      const portraitY = this.height - 170;
      const portraitW = 340;
      const portraitH = 134;
      this.drawPanel(portraitX, portraitY, portraitW, portraitH, {
        radius: 24,
        fill: "rgba(7, 12, 11, 0.84)",
        stroke: "rgba(255, 227, 177, 0.14)"
      });

      const portraitCenterX = portraitX + 64;
      const portraitCenterY = portraitY + 66;
      const accent = player.team === BLUE ? "#76d8ff" : "#ff867c";
      const accentDark = player.team === BLUE ? "#133951" : "#4a1d24";
      ctx.fillStyle = accentDark;
      ctx.beginPath();
      ctx.arc(portraitCenterX, portraitCenterY, 40, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#f2d48e";
      ctx.beginPath();
      ctx.arc(portraitCenterX, portraitCenterY, 46, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(portraitCenterX, portraitCenterY, 34, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.arc(portraitCenterX - 12, portraitCenterY - 10, 10, 0, TAU);
      ctx.fill();

      ctx.textAlign = "left";
      ctx.fillStyle = "#f6ebcf";
      ctx.font = "bold 18px Segoe UI";
      ctx.fillText(`${player.name} · Lv.${player.level}`, portraitX + 126, portraitY + 34);
      ctx.font = "13px Segoe UI";
      ctx.fillStyle = "#cabd9e";
      ctx.fillText(player.template.title, portraitX + 126, portraitY + 56);
      ctx.fillText(`金 ${Math.floor(player.gold)} · 攻 ${Math.round(player.getAttackDamage())} · 谋 ${Math.round(player.getAbilityPower())}`, portraitX + 126, portraitY + 76);
      ctx.fillText(
        player.atFountain() ? "营地补给中，可直接出装" : "前线推进中，注意塔下位置",
        portraitX + 126,
        portraitY + 96
      );

      this.drawMeter(portraitX + 126, portraitY + 106, 188, 12, player.hp / player.maxHp, "#74dc96", "rgba(0,0,0,0.5)");
      const nextLevelXp = XP_LEVELS[Math.min(player.level + 1, XP_LEVELS.length - 1)];
      const prevLevelXp = XP_LEVELS[player.level] || 0;
      const xpRatio = nextLevelXp > prevLevelXp ? (player.exp - prevLevelXp) / (nextLevelXp - prevLevelXp) : 1;
      this.drawMeter(portraitX + 126, portraitY + 123, 188, 8, xpRatio, "#69cfff", "rgba(0,0,0,0.44)");

      const inventoryX = portraitX + 226;
      const inventoryY = portraitY + 20;
      const inventoryLabels = player.inventory.slice(0, 3);
      for (let index = 0; index < 3; index += 1) {
        const slotX = inventoryX + index * 34;
        this.drawPanel(slotX, inventoryY, 28, 28, {
          radius: 8,
          fill: "rgba(15, 25, 23, 0.92)",
          stroke: inventoryLabels[index] ? "rgba(114, 209, 195, 0.34)" : "rgba(255,255,255,0.08)"
        });
        if (inventoryLabels[index]) {
          ctx.fillStyle = "#72d1c3";
          ctx.font = "bold 12px Segoe UI";
          ctx.textAlign = "center";
          ctx.fillText(inventoryLabels[index].slice(0, 1), slotX + 14, inventoryY + 18);
        }
      }

      const skillPanelX = this.width / 2 - 244;
      const skillPanelY = this.height - 186;
      this.drawPanel(skillPanelX, skillPanelY, 488, 150, {
        radius: 26,
        fill: "rgba(7, 12, 11, 0.86)",
        stroke: "rgba(255, 232, 182, 0.16)"
      });

      ctx.fillStyle = "#f6ebcf";
      ctx.font = "13px Segoe UI";
      ctx.textAlign = "left";
      ctx.fillText("将令台", skillPanelX + 20, skillPanelY + 24);
      ctx.fillStyle = "#c7b999";
      ctx.fillText(`移速 ${Math.round(player.getMoveSpeed())} · 攻速 ${player.getAttackSpeed().toFixed(2)} · 护甲 ${Math.round(player.getArmor())}`, skillPanelX + 20, skillPanelY + 44);

      const skillEntries = [
        { key: "J", name: player.template.skills.q, cd: player.cooldowns.q, accent: "#6bc8ff" },
        { key: "K", name: player.template.skills.w, cd: player.cooldowns.w, accent: "#72d1c3" },
        { key: "L", name: player.template.skills.e, cd: player.cooldowns.e, accent: "#f1c972" },
        { key: "B", name: "回城", cd: player.recallTimer, accent: "#d8b5ff" }
      ];

      skillEntries.forEach((entry, index) => {
        const x = skillPanelX + 18 + index * 114;
        const y = skillPanelY + 58;
        const ready = entry.cd <= 0.05;
        this.drawPanel(x, y, 96, 78, {
          radius: 16,
          fill: ready ? "rgba(18, 30, 28, 0.92)" : "rgba(12, 18, 17, 0.88)",
          stroke: ready ? `${entry.accent}88` : "rgba(255,255,255,0.08)"
        });
        ctx.fillStyle = ready ? entry.accent : "#8b8b8b";
        ctx.font = "bold 19px Segoe UI";
        ctx.textAlign = "left";
        ctx.fillText(entry.key, x + 12, y + 24);
        ctx.fillStyle = "#f4ebd1";
        ctx.font = "12px Segoe UI";
        ctx.fillText(entry.name, x + 12, y + 46);
        ctx.fillStyle = ready ? "#d7cbac" : "#9e9277";
        const status =
          entry.key === "B"
            ? player.recallTimer > 0.05
              ? `${player.recallTimer.toFixed(1)}s`
              : player.atFountain()
                ? "营内"
                : "可用"
            : ready
              ? "就绪"
              : `${entry.cd.toFixed(1)}s`;
        ctx.fillText(status, x + 12, y + 64);
      });

      if (this.width > 1380) {
        const mapX = this.width - 592;
        const mapY = this.height - 224;
        this.renderTacticalMap(mapX, mapY, 220, 180);
      }

      ctx.restore();
    }

    render() {
      this.renderMap();

      this.zones.forEach((zone) => zone.render(this.ctx, this.camera));
      this.towers.forEach((tower) => tower.render(this.ctx, this.camera));
      this.bases.forEach((base) => base.render(this.ctx, this.camera));
      this.minions.forEach((minion) => minion.render(this.ctx, this.camera));
      this.heroes.forEach((hero) => hero.render(this.ctx, this.camera));
      this.projectiles.forEach((projectile) => projectile.render(this.ctx, this.camera));
      this.renderFlashes();
      this.floatingTexts.forEach((text) => text.render(this.ctx, this.camera));
      this.renderMessages();
      this.renderUi();
    }

    loop(timestamp) {
      const dt = Math.min(0.033, (timestamp - this.lastTimestamp) / 1000);
      this.lastTimestamp = timestamp;

      if (this.state === "playing") {
        this.update(dt);
      } else {
        this.updateCamera();
      }

      this.render();
      this.input.pressed.clear();
      requestAnimationFrame((ts) => this.loop(ts));
    }
  }

  const selectableHeroes = Object.values(HERO_TEMPLATES).filter((hero) => hero.playable);
  let selectedHero = selectableHeroes[0].key;

  selectableHeroes.forEach((hero) => {
    const card = document.createElement("button");
    card.className = "hero-card";
    card.type = "button";
    card.innerHTML = `
      <div class="title-row">
        <div>
          <h3>${hero.name}</h3>
          <p>${hero.title}</p>
        </div>
        <span class="role">${hero.role}</span>
      </div>
      <p>${hero.blurb}</p>
      <ul>
        <li>${hero.skills.q}</li>
        <li>${hero.skills.w}</li>
        <li>${hero.skills.e}</li>
      </ul>
      <p>${hero.flavor}</p>
    `;
    if (hero.key === selectedHero) {
      card.classList.add("selected");
    }
    card.addEventListener("click", () => {
      selectedHero = hero.key;
      startButton.disabled = false;
      Array.from(heroCardsEl.children).forEach((node) => node.classList.remove("selected"));
      card.classList.add("selected");
    });
    heroCardsEl.appendChild(card);
  });

  startButton.disabled = false;
  const game = new Game(canvas);
  startButton.addEventListener("click", () => game.startMatch(selectedHero));
  restartButton.addEventListener("click", () => game.startMatch(selectedHero));
})();
