import Constants from "@/Constants.js";
import Graphics from "@/Graphics.js";

import sprSparks from "@assets/img/sparks.png";
import sprPaddle from "@assets/img/paddle.png";
import sprRumble from "@assets/img/rumble.png";
import sprBricks from "@assets/img/bricks.png";

export default ({
    // Variables
    // =========

    imgSparks: null,
    imgPaddle: null,
    imgRumble: null,
    imgBricks: null,

    sparks: [],
    rumbles: [],
    paddleRumbles: [],
    bricks: [],
    texts: [],

    currentShakeTime: 0,
    shakeState: 0,
    colorState: 0,

    // Fonctions
    // =========

    async init() {
        // Chargement des ressources.
        this.imgSparks = await Graphics.loadAsset(sprSparks);
        this.imgRumble = await Graphics.loadAsset(sprRumble);
        this.imgPaddle = await Graphics.loadAsset(sprPaddle);
        this.imgBricks = await Graphics.loadAsset(sprBricks);
    },
    destroy() {
        this.sparks = [];
        this.rumbles = [];
        this.paddleRumbles = [];
        this.bricks = [];
        this.texts = [];
    },
    createSpark(x, y, dx, dy, color) {
        this.sparks.push({
            x: x,
            y: y,
            color: color,
            dx: (dx * Constants.SPARK_VELOCITY),
            dy: (dy * Constants.SPARK_VELOCITY),
            deleted: false,
        });
    },
    createRumble(x, y, dx, dy, color) {
        this.rumbles.push({
            x: x,
            y: y,
            color: color,
            dx: (dx * Constants.RUMBLE_VELOCITY),
            dy: (dy * Constants.RUMBLE_VELOCITY),
            deleted: false,
        });
    },
    createPaddleRumble(x, y, dx, dy, part, color) {
        this.paddleRumbles.push({
            x: x,
            y: y,
            color: color,
            dx: (dx * Constants.RUMBLE_VELOCITY),
            dy: (dy * Constants.RUMBLE_VELOCITY),
            part: part,
            deleted: false,
        });
    },
    createBrick(x, y, dx, dy, color) {
        this.bricks.push({
            x: x,
            y: y,
            color: color,
            dx: (dx * Constants.RUMBLE_VELOCITY),
            dy: (dy * Constants.RUMBLE_VELOCITY),
            deleted: false,
        });
    },
    createText(x, y, text) {
        this.texts.push({
            x: x,
            y: y,
            vx: 0,
            vy: (0.12 * -1),
            alpha: 1.0,
            text: text,
            deleted: false,
        });
    },
    createExplosion(x, y, color) {
        this.createSpark(x, y, 0, -1, color);
        this.createSpark(x, y, -1, -1, color);
        this.createSpark(x, y, -1, 0, color);
        this.createSpark(x, y, -1, 1, color);
        this.createSpark(x, y, 0, 1, color);
        this.createSpark(x, y, 1, 1, color);
        this.createSpark(x, y, 1, 0, color);
        this.createSpark(x, y, 1, -1, color);
    },
    shake() {
        this.shakeState = 8;
    },
    twinkle() {
        this.colorState = 4;
    },
    draw(dt) {
        Graphics.setAlpha(0.75);

        // Dessine les étincelles.
        for (let spark of this.sparks) {
            if (!spark.deleted) {
                Graphics.drawImagePart(this.imgSparks, spark.x, spark.y, ((spark.color - 1) * 8), 0, 8, 8);
            }
        }

        // Dessine les morceaux de briques.
        for (let rumble of this.rumbles) {
            if (!rumble.deleted) {
                Graphics.drawImagePart(this.imgRumble, rumble.x, rumble.y, ((rumble.color - 1) * 8), 0, 8, 8);
            }
        }

        // Dessine les briques qui tombent.
        for (let brick of this.bricks) {
            if (!brick.deleted) {
                Graphics.drawImagePart(this.imgBricks, brick.x, brick.y, 0, ((brick.color - 1) * 8), 16, 8);
            }
        }

        // Dessine les textes.
        for (let text of this.texts) {
            if (!text.deleted) {
                Graphics.setAlpha(text.alpha);
                Graphics.drawStringNotTiled(text.x, text.y, text.text, "tiny");
            }
        }

        Graphics.setAlpha(1);

        // Dessine les morceaux de raquette.
        for (let rumble of this.paddleRumbles) {
            if (!rumble.deleted) {
                Graphics.drawImagePart(this.imgPaddle, rumble.x, rumble.y, ((rumble.part - 1) * 8), ((rumble.color - 1) * 8), 8, 8);
            }
        }
    },
    update(dt) {
        // Gestion du tremblement d'écran
        // ------------------------------

        let time = window.performance.now();

        if (time > this.currentShakeTime) {
            this.currentShakeTime = (62 + time);
            
            if (this.shakeState > 0) {
                switch (this.shakeState) {
                    case 1: {
                        Graphics.moveY = 0;
                        break;
                    }

                    case 2: {
                        Graphics.moveY = -3;
                        break;
                    }

                    case 3: {
                        Graphics.moveY = 6;
                        break;
                    }

                    case 4: {
                        Graphics.moveY = -6;
                        break;
                    }

                    case 5: {
                        Graphics.moveY = 8;
                        break;
                    }

                    case 6: {
                        Graphics.moveY = -8;
                        break;
                    }

                    case 7: {
                        Graphics.moveY = 10;
                        break;
                    }

                    case 8: {
                        Graphics.moveY = -10;
                        break;
                    }
                }

                this.shakeState--;
            }

            if (this.colorState > 0) {
                switch (this.colorState) {
                    case 1: {
                        Graphics.backgroundColor = "#000000";
                        break;
                    }

                    case 2: {
                        Graphics.backgroundColor = "#00FFFF";
                        break;
                    }

                    case 3: {
                        Graphics.backgroundColor = "#FFFF00";
                        break;
                    }

                    case 4: {
                        Graphics.backgroundColor = "#FF00FF";
                        break;
                    }
                }

                this.colorState--;
            }
        }

        // Gestion des effets
        // ------------------

        for (let idx in this.sparks) {
            if (!this.sparks[idx].deleted) {
                this.sparks[idx].x += this.sparks[idx].dx;
                this.sparks[idx].y += this.sparks[idx].dy;

                if (this.sparks[idx].x < Constants.BOARD_X) {
                    this.sparks[idx].deleted = true;
                }
                if (this.sparks[idx].x > (Constants.BOARD_X2 - 8)) {
                    this.sparks[idx].deleted = true;
                }
                if (this.sparks[idx].y > (Constants.CANVAS_HEIGHT + 8)) {
                    this.sparks[idx].deleted = true;
                }
                if (this.sparks[idx].y < Constants.BOARD_Y) {
                    this.sparks[idx].deleted = true;
                }
            }
        }

        for (let idx in this.rumbles) {
            if (!this.rumbles[idx].deleted) {
                this.rumbles[idx].x += this.rumbles[idx].dx;
                this.rumbles[idx].y += this.rumbles[idx].dy;

                this.rumbles[idx].dy += Constants.RUMBLE_GRAVITY;

                if (this.rumbles[idx].y > (Constants.CANVAS_HEIGHT + 8)) {
                    this.rumbles[idx].deleted = true;
                }
            }
        }

        for (let idx in this.paddleRumbles) {
            if (!this.paddleRumbles[idx].deleted) {
                this.paddleRumbles[idx].x += this.paddleRumbles[idx].dx;
                this.paddleRumbles[idx].y += this.paddleRumbles[idx].dy;

                this.paddleRumbles[idx].dy += Constants.RUMBLE_GRAVITY;

                if (this.paddleRumbles[idx].y > (Constants.CANVAS_HEIGHT + 8)) {
                    this.paddleRumbles[idx].deleted = true;
                }
            }
        }

        for (let idx in this.bricks) {
            if (!this.bricks[idx].deleted) {
                this.bricks[idx].x += this.bricks[idx].dx;
                this.bricks[idx].y += this.bricks[idx].dy;

                this.bricks[idx].dy += Constants.RUMBLE_GRAVITY;

                if (this.bricks[idx].y > (Constants.CANVAS_HEIGHT + 8)) {
                    this.bricks[idx].deleted = true;
                }
            }
        }

        for (let idx in this.texts) {
            if (!this.texts[idx].deleted) {
                // Déplace le texte vers le haut.
                this.texts[idx].x += (this.texts[idx].vx * dt);
                this.texts[idx].y += (this.texts[idx].vy * dt);

                // Ralentit la vitesse de déplacement du texte.
                if (this.texts[idx].vy < 0) {
                    this.texts[idx].vy += 0.005;
                    if (this.texts[idx].vy >= 0) {
                        this.texts[idx].vy = 0;
                    }
                } else {
                    // Le texte s'estompe petit à petit.
                    this.texts[idx].alpha -= 0.05;
                }

                // Dès que le texte sort de l'écran, on la détruit.
                if (this.texts[idx].y < -16 || this.texts[idx].alpha < 0) {
                    this.texts[idx].deleted = true;
                }
            }
        }

        this.sparks = this.sparks.filter(spark => !spark.deleted);
        this.rumbles = this.rumbles.filter(rumble => !rumble.deleted);
        this.paddleRumbles = this.paddleRumbles.filter(rumble => !rumble.deleted);
        this.bricks = this.bricks.filter(brick => !brick.deleted);
        this.texts = this.texts.filter(text => !text.deleted);
    },
})
