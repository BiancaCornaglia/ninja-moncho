// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("main");
  }

  init() {
    this.gameOver = false;
    this.timer = 30;
    this.score = 0;
    this.shapes = {
      triangulo: { points: 10, count: 0 },
      cuadrado: { points: 20, count: 0 },
      rombo: { points: 30, count: 0 },
      bomb: { points: -10, count: 0 },
    };
  }

  preload() {
    //cargar assets

    //import Cielo
    this.load.image("sky", "../public/assets/Cielo.webp");

    //import plataforma
    this.load.image("platform", "../public/assets/platform.png");

    //import personaje
    this.load.image("character", "../public/assets/pj04.png");

    // importar recolectable
    this.load.image("triangulo", "../public/assets/piñata01.png");
    this.load.image("cuadrado", "../public/assets/piñata02.png");
    this.load.image("rombo", "../public/assets/piñata03.png");
    this.load.image("bomb", "../public/assets/nene01.png");
  }

  create() {
    // crear elementos
    this.sky = this.add.image(400, 300, "sky");
    this.sky.setScale(2);

    // crear grupa plataformas
    this.platform = this.physics.add.staticGroup();
    // al grupo de plataformas agregar una plataforma
    this.platform.create(400, 568, "platform").setScale(2).refreshBody();
    // agregamos otra plataforma en otro lugar
    this.platform.create(20, 400, "platform");

    this.platform.create(800, 400, "platform");

    //crear personaje
    this.character = this.physics.add.sprite(400, 300, "character");
    //this.personaje.setScale(0.1);
    this.character.setCollideWorldBounds(true);

    //agregar colision entre personaje y plataforma
    this.physics.add.collider(this.character, this.platform);
    //una tecla a la vez
    //this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    //this.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    //this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    //this.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    //crear teclas
    this.cursor = this.input.keyboard.createCursorKeys();

    // crear grupo recolectables
    this.collectable = this.physics.add.group();

    // evento 1 segundo
    this.time.addEvent({
      delay: 1000,
      callback: this.onSecond,
      callbackScope: this,
      loop: true,
    });

    // add tecla r
    this.r = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // evento 1 segundo
    this.time.addEvent({
      delay: 1000,
      callback: this.handlerTimer,
      callbackScope: this,
      loop: true,
    });

    //agregar texto de timer en la esquina superior derecha
    this.timerText = this.add.text(10, 10, `tiempo restante: ${this.timer}`, {
      fontSize: "32px",
      fill: "#fff",
    });

    this.scoreText = this.add.text(
      10,
      50,
      `Puntaje: ${this.score}
        T: ${this.shapes["triangulo"].count}
        C: ${this.shapes["cuadrado"].count}
        R: ${this.shapes["rombo"].count}`
    );

    //agregar collider entre recolectables y personaje
    this.physics.add.collider(
      this.character,
      this.collectable,
      this.onShapeCollect,
      null,
      this
    );

    //agregar collider entre recolectables y plataformas
    this.physics.add.collider(
      this.collectable,
      this.platform,
      this.onRecolectableBounced,
      null,
      this
    );
  }

  update() {
    if (this.gameOver && this.r.isDown) {
      this.scene.restart();
    }
    if (this.gameOver) {
      this.physics.pause();
      this.timerText.setText("Game Over");
      return;
    }
    // movimiento personaje
    if (this.cursor.left.isDown) {
      this.character.setVelocityX(-160);
    } else if (this.cursor.right.isDown) {
      this.character.setVelocityX(160);
    } else {
      this.character.setVelocityX(0);
    }
    if (this.cursor.up.isDown && this.character.body.touching.down) {
      this.character.setVelocityY(-330);
    }
  }

  onSecond() {
    if (this.gameOver) {
      return;
    }
    // crear recolectable
    const tipos = ["triangulo", "cuadrado", "rombo", "bomb"];

    const tipo = Phaser.Math.RND.pick(tipos);
    let collectable = this.collectable.create(
      Phaser.Math.Between(10, 790),
      0,
      tipo
    );
    collectable.setVelocity(0, 100);

    //asignar rebote: busca un numero entre 0.4 y 0.8
    const rebote = Phaser.Math.FloatBetween(0.4, 0.8);
    collectable.setBounce(rebote);

    //set data
    collectable.setData("points", this.shapes[tipo].points);
    collectable.setData("tipo", tipo);
  }

  onShapeCollect(character, collectable) {
    const nombreFig = collectable.getData("tipo");
    const points = collectable.getData("points");

    this.score += points;

    this.shapes[nombreFig].count += 1;

    console.table(this.shapes);
    console.log("recolectado ", collectable.texture.key, points);
    console.log("score ", this.score);
    collectable.destroy();
    //recolectable.disableBody(true, true);

    this.scoreText.setText(
      `Puntaje: ${this.score}
        T: ${this.shapes["triangulo"].count}
        C: ${this.shapes["cuadrado"].count}
        R: ${this.shapes["rombo"].count}`
    );

    this.checkWin();
  }

  checkWin() {
    const cumplePuntos = this.score >= 100;
    const cumpleFiguras =
      this.shapes["triangulo"].count >= 2 &&
      this.shapes["cuadrado"].count >= 2 &&
      this.shapes["rombo"].count >= 2;

    if (cumplePuntos && cumpleFiguras) {
      console.log("Ganaste");
      this.scene.start("end", {
        score: this.score,
        gameOver: this.gameOver,
      });
    }
  }

  handlerTimer() {
    this.timer -= 1;
    this.timerText.setText(`tiempo restante: ${this.timer}`);
    if (this.timer === 0) {
      this.gameOver = true;
      this.scene.start("end", {
        score: this.score,
        gameOver: this.gameOver,
      });
    }
  }

  onRecolectableBounced(collectable, platform) {
    console.log("recolectable rebote");
    let points = collectable.getData("points");
    points -= 5;
    collectable.setData("points", points);
    if (points <= 0) {
      collectable.destroy();
    }
  }
}