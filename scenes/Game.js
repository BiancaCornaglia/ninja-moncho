// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("main");
  }

  init() {

  }

  preload() {
    //cargar assets
    this.load.image("cielo","../public/assets/Cielo.webp");

    //import plataforma
    this.load.image("plataforma","../public/assets/platform.png");

    //import pj
    this.load.image("personaje","../public/assets/Ninja.png");

    //import recolectables
    this.load.image("cuadrado","../public/assets/square.png");
    this.load.image("triangulo","../public/assets/triangle.png");
    this.load.image("rombo","../public/assets/diamond.png");
  }

  create() {
    //crear elementos
    this.cielo = this.add.image(400, 300, "cielo");
    this.cielo.setScale(2);

    //colocar grupo de plataformas
    this.plataformas = this.physics.add.staticGroup();

    //al grupo de plataformas agregar una plataforma
    this.plataformas.create(400, 600, "plataforma").setScale(5).refreshBody();
    this.plataformas.create(500, 300, "plataforma");

    //colocar personaje
    this.personaje = this.physics.add.sprite(400, 300, "personaje");
    this.personaje.setScale(0.1);
    this.personaje.setCollideWorldBounds(true);
    //this.personaje.setBounce(1);
    //this.personaje.setVelocity(40)

    //agragar colision entre personaje y plataforma1
    this.physics.add.collider(this.personaje, this.plataformas);

    //crear teclas
    this.cursor = this.input.keyboard.createCursorKeys();

    //una tecla a la vez
    //this.w = this.input.Keyboard.addKey(Phaser.input.Keyboard.KeyCodes.W);

    //crear grupo recolectables
    this.recolectables = this.physics.add.group();
    this.physics.add.collider(this.personaje, this.recolectables);
    this.physics.add.collider(this.recolectables, this.plataformas)

    //evento 1 segundo
    this.time.addEvent({
      delay: 1000,
      callback: this.onSecond,
      callbackScope: this,
      loop: true,
    });

  }

  onSecond() {
    // crear recolectable
    const tipos = ["triangulo", "cuadrado", "rombo"];
    const tipo = Phaser.Math.RND.pick(tipos);
    let recolectable = this.recolectables.create(
      Phaser.Math.Between(10,790),
      0,
      tipo
    );
    recolectable.setVelocity(0,100);
  }

  update() {
    //movimiento personaje
    if (this.cursor.left.isDown) {
      this.personaje.setVelocityX(-160);
    } else if (this.cursor.right.isDown) {
      this.personaje.setVelocityX(160);
    } else {
      this.personaje.setVelocityX(0);
    }
    if (this.cursor.up.isDown && this.personaje.body.touching.down) {
      this.personaje.setVelocityY(-330);
    }
  }
}