import MainScene from 'MainScene.mjs'

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 800,
    scale: 2,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: [MainScene]
};

const game = new Phaser.Game(config);
