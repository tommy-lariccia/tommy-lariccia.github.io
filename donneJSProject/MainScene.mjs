export default class MainScene {
    gameover = false;

    constructor() {}

    preload() {
        this.load.image("background", "src/assets/background.png");
        this.load.image("vivian", "src/assets/vivian.png");
        this.load.spritesheet("fireball", "src/assets/fireball.png", {
            frameWidth: 1024,
            frameHeight: 1024
        });
        this.load.spritesheet("skull", "src/assets/skull.png", {
            frameWidth: 1024,
            frameHeight: 1024
        });
        this.load.spritesheet("vivhb", "src/assets/VivianHealthBar.png", {
            frameWidth: 1024,
            frameHeight: 1024
        });
        this.load.spritesheet("skullhb", "src/assets/SkullHealthBar.png", {
            frameWidth: 1024,
            frameHeight: 1024
        });
    }

    addBackground() {
        let backgrd = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "background");
        let scaleX = this.cameras.main.width / backgrd.width
        let scaleY = this.cameras.main.height / backgrd.height
        let scale = Math.min(scaleX, scaleY)
        backgrd.setScale(scale).setScrollFactor(0)
    }

    addVivian() {
        this.vivian = this.physics.add.sprite(400, 700, "vivian");
        this.vivian.setScale(.1);
        this.vivian.body.setSize(this.vivian.width, this.vivian.height - 100, true)
        this.vivian.ScaleY = .07;
        this.vivian.setBounce(0.3);
        this.vivianHealth = 100;
        this.vivian.setCollideWorldBounds(true);
    }

    addDeath() {
        this.death = this.physics.add.sprite(400, 200, "skull", 0);
        this.death.setScale(.3);
        this.death.setSize(1024, 850, false);
        this.death.body.setSize(this.death.width - 640, this.death.height - 700, true)
        this.death.body.setOffset(320, 500);
        this.deathCollider2 = this.physics.add.sprite(400, 200);
        this.deathCollider2.body.allowGravity = false;
        this.deathCollider2.setCollideWorldBounds(true);
        this.deathCollider2.setVelocityX(-100);
        this.deathCollider2.setSize(250, 155);
        this.deathCollider2.setOffset(-110, -130);
        this.death.setCollideWorldBounds(true);
        this.death.body.allowGravity = false;
        this.death.setVelocityX(-100);
        this.deathHealth = 100;
    }

    create() {
        this.lastHit = new Date();
        this.SecsUntilNextHit = 3 + 5 * Math.random()
        this.addBackground();
        this.addVivian();
        this.addDeath();
        this.floor = this.add.rectangle(400, 880, 800, 200, 0x000000);
        this.skullcollider = this.add.rectangle(400, 350, 800, 0, 0xff0000);
        this.physics.add.existing(this.skullcollider, 1);
        this.physics.add.existing(this.floor, 1);
        this.physics.add.collider(this.death, this.skullcollider);
        this.physics.add.collider(this.vivian, this.floor);
        let shootCallback = this.shoot.apply(this);
        this.input.on('pointerdown', shootCallback)
        this.hb1 = this.add.sprite(750, 550, "vivhb", 0);
        this.hb2 = this.add.sprite(750, 350, "skullhb", 0);
        this.hb1.setScale(.17);
        this.hb2.setScale(.17);
    }

    shoot() {
        return function() {
            let parent = this.cameras.scene;
            let changeX = this.x - parent.vivian.x;
            let changeY = this.y - parent.vivian.y;
            let direction = Math.atan2(changeY, changeX);
            parent.createBullet.call(parent, parent.vivian.x + 15, parent.vivian.y - 40, direction);
        }
    }

    createBullet(x, y, direction) {
        let newBullet = this.add.text(x, y, ",", {
            color: 0xff0000,
            font: 'bold 30pt Arial',
        });
        this.physics.add.existing(newBullet, 0);
        newBullet.body.setVelocityX(Math.cos(direction) * 1500);
        newBullet.body.setVelocityY(Math.sin(direction) * 1500);
        newBullet.body.setSize(newBullet.width, newBullet.height - 20, true)
        newBullet.body.setOffset(0, 30)
        newBullet.body.onWorldBounds = true;
        newBullet.body.setCollideWorldBounds(true);
        this.physics.world.on('worldbounds', (body) => {
            if (body.gameObject == newBullet) {
                body.gameObject.destroy();
                body.destroy();
            }
        })
        let self = this;
        let collisionCallback = function() {
            newBullet.body.destroy();
            newBullet.destroy();
            self.deathHealth -= .4;
            if (self.deathHealth <= 0) {
                self.gameover = true;
                console.log("Victory!")
                self.death.destroy()
                self.deathCollider2.destroy();
            } else if (self.deathHealth <= 33) {
                self.death.setTexture('skull', 2);
            } else if (self.deathHealth <= 66) {
                self.death.setTexture('skull', 1);
            }
            self.hb2.setTexture('skullhb', Math.floor((100 - self.deathHealth) / 10))
        }
        let collision = this.physics.add.collider(newBullet, this.death, collisionCallback);
        let collision2 = this.physics.add.collider(newBullet, this.deathCollider2, collisionCallback);
        collision.overlapOnly = true;
        collision2.overlapOnly = true;
    }

    update() {
        if (this.gameover) {
            this.addBackground()
            this.add.text(140, 200, "GAME OVER", {
                font: '70pt Andale Mono',
                fontSize: 100
            })
            if (this.vivianHealth <= 0) {
                this.add.text(170, 330, "YOU LOSE", {
                    font: '70pt Andale Mono',
                    fontSize: 100
                })
            } else {
                this.add.text(190, 330, "YOU WIN", {
                    font: '70pt Andale Mono',
                    fontSize: 100
                })
            }
            this.add.text(220, 500, "Refresh to play again", {
                font: '20pt Andale Mono',
                fontSize: 100
            })

            return;
        }
        const keys = this.input.keyboard.createCursorKeys();
        const letterKeys = this.input.keyboard
        if (keys.left.isDown || letterKeys.addKey("A").isDown) {
            this.vivian.setVelocityX(-150);
        } else if (keys.right.isDown || letterKeys.addKey("D").isDown) {
            this.vivian.setVelocityX(150);
        } else {
            this.vivian.setVelocityX(0);
        }

        if ((keys.up.isDown || letterKeys.addKey("W").isDown) && this.vivian.body.touching.down) {
            this.vivian.setVelocityY(-150);
        }


        if (this.death.x <= 160) {
            this.death.setVelocityX(100);
            this.deathCollider2.setVelocityX(100);
        } else if (this.death.x >= 640) {
            this.death.setVelocityX(-100);
            this.deathCollider2.setVelocityX(-100);
        }
        this.death.setVelocityY(Math.sin(this.death.x / 40) * 40);
        this.deathCollider2.setVelocityY(Math.sin(this.death.x / 40) * 40);

        if (this.death.y >= 200) {
            this.death.y = 200;
            this.deathCollider2.setVelocityY(0);
        }
        if (((new Date()) - this.lastHit) >= this.SecsUntilNextHit * 1000) {
            this.shootFireballs();
            this.lastHit = new Date();
            this.SecsUntilNextHit = 3 + 5 * Math.random() // 1.5 -3.5 secs
        }

    }

    shootFireballs() {
        if (this.deathHealth <= 33) {
            this.death.setTexture('skull', 5);
        } else if (this.deathHealth <= 66) {
            this.death.setTexture('skull', 4);
        } else {
            this.death.setTexture('skull', 3);
        }
        setTimeout(() => {
            if (this.deathHealth <= 33) {
                this.death.setTexture('skull', 2);
            } else if (this.deathHealth <= 66) {
                this.death.setTexture('skull', 1);
            } else {
                this.death.setTexture('skull', 0);
            }
        }, 1500);
        this.spawnFireball();
    }

    spawnFireball() {
        let fireball = this.physics.add.sprite(this.death.body.x + 45, this.death.body.y + 35, "fireball", 1);
        fireball.setSize(600, 650)
        fireball.setScale(.1)
        fireball.allowGravity = false;
        setTimeout(() => {
            fireball.setTexture('fireball', 0)

        }, 200);

        setTimeout(() => {
            let direction = Math.atan2(this.vivian.body.y - fireball.body.y, this.vivian.body.x - fireball.body.x);
            fireball.allowGravity = false;
            fireball.setVelocityX(Math.cos(direction) * 500);
            fireball.setVelocityY(Math.sin(direction) * 500);
        }, 100)
        fireball.body.onWorldBounds = true;
        fireball.body.setCollideWorldBounds(true);
        this.physics.world.on('worldbounds', (body) => {
            if (body.gameObject == fireball) {
                body.gameObject.destroy();
                body.destroy();
            }
        })
        let collision = this.physics.add.collider(fireball, this.vivian, () => {
            fireball.body.destroy();
            fireball.destroy();
            this.vivianHealth -= 10;
            this.hb1.setTexture('vivhb', Math.floor((100 - this.vivianHealth) / 10))
            if (this.vivianHealth <= 0) {
                console.log("Failure");
                this.gameover = true;
                this.vivian.destroy();
            }
        });
        collision.overlapOnly = true;
    }
}
