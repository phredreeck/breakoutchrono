import Capsule from "@/Capsule.js";
import Constants from "@/Constants.js";
import Effect from "@/Effect.js";
import Graphics from "@/Graphics.js";
import Paddle from "@/Paddle.js";
import Sound from "@/Sound.js";
import Stage from "@/Stage.js";
import Utils from "@/Utils.js";

import sprBall from "@assets/img/ball.png";

import sndBrick from "@assets/snd/brick.ogg";
import sndPaddle from "@assets/snd/paddle.ogg";
import sndLoseBall from "@assets/snd/loseball.ogg";
import sndClone from "@assets/snd/clone.ogg";
import sndExplode from "@assets/snd/explode.ogg";
import sndCapsule from "@assets/snd/capsule.ogg";
import sndBlock from "@assets/snd/block.ogg";
import sndFinish from "@assets/snd/finish.ogg";
import sndReady from "@assets/snd/ready.ogg";

/* Ce fichier contient les méthodes permettant de gérer les balles.
 * Il éxiste 6 types de balles, avec pour chaque type un comportement différent :
 * - Jaune : balle standard sans aucun pouvoir;
 * - Rouge : balle qui détruit les briques sans rebondir dessus;
 * - Bleue : balle qui explose au contact d'une brique;
 * - Verte : balle qui se reproduit à chaque rebond sur une brique;
 * - Cyan : balle au rebond hasardeux;
 * - Rose : balle impuissante qui ne peut pas détruire de briques. A jeter au plus vite !
 */
export default ({
    // Variables
    // =========

    imgBall: null,

    sndBrick: null,
    sndPaddle: null,
    sndLoseBall: null,
    sndClone: null,
    sndExplode: null,
    sndCapsule: null,
    sndBlock: null,
    sndFinish: null,
    sndReady: null,

    balls: [],
    launched: false,
    glued: null,
    gluedX: 0,

    // Fonctions
    // =========

    async init() {
        // Chargement des ressources.
        this.imgBall = await Graphics.loadAsset(sprBall);

        this.sndBrick = await Sound.loadAsset(sndBrick);
        this.sndPaddle = await Sound.loadAsset(sndPaddle);
        this.sndClone = await Sound.loadAsset(sndClone);
        this.sndLoseBall = await Sound.loadAsset(sndLoseBall);
        this.sndExplode = await Sound.loadAsset(sndExplode);
        this.sndCapsule = await Sound.loadAsset(sndCapsule);
        this.sndBlock = await Sound.loadAsset(sndBlock);
        this.sndFinish = await Sound.loadAsset(sndFinish);
        this.sndReady = await Sound.loadAsset(sndReady);
    },
    createFirst() {
        // Créé une balle jaune qui sera posé sur la raquette.
        this.balls.push({
            x: (Paddle.shape.x + (Paddle.shape.w / 2) - (8 / 2)),
            y: (Paddle.shape.y - 8),
            w: 8,
            h: 8,
            angle: 0,
            dx: 0,
            dy: 0,
            type: Constants.BALL_YELLOW,
            destroyed: false,
        });
        this.launched = false;

        // Joue un son.
        Sound.play(this.sndReady);
    },
    create(x, y, angle, type) {
        // Définit le nouvel angle de la balle.
        let radians = angle * Math.PI / 180.0;
        let dx = Constants.BALL_VELOCITY * Math.cos(radians);
        let dy = Constants.BALL_VELOCITY * Math.sin(radians);

        // Créé une nouvelle balle.
        this.balls.push({
            x: x,
            y: y,
            w: 8,
            h: 8,
            angle: angle,
            dx: dx,
            dy: dy,
            type: type,
            destroyed: false,
        });
    },
    destroy() {
        // La balle est détruite.
        this.launched = false;
        this.balls = [];
    },
    launch(dir) {
        let angle = 0;
        if (this.balls.length == 1 && !this.launched) {
            switch (dir) {
                case 1: {
                    // La balle part à gauche.
                    angle = 225;

                    break;
                }

                case 2: {
                    // La balle part à droite.
                    angle = 315;

                    break;
                }

                default: {
                    break;
                }
            }

            // Définit le nouvel angle de la balle.
            let radians = angle * Math.PI / 180.0;
            this.balls[0].dx = Constants.BALL_VELOCITY * Math.cos(radians);
            this.balls[0].dy = Constants.BALL_VELOCITY * Math.sin(radians);
            this.balls[0].angle = angle;

            // La balle est maintenant lancée.
            this.launched = true;
        }
    },
    launchGlued(dir) {
        let angle = 0;

        switch (dir) {
            case 1: {
                // La balle part à gauche.
                angle = 225;

                break;
            }

            case 2: {
                // La balle part à droite.
                angle = 315;

                break;
            }

            default: {
                // Calcule le nouvel angle de la balle.
                let impact = ((this.gluedX * 100) / Paddle.shape.w);
                angle = (225 + impact);

                break;
            }
        }

        // Définit le nouvel angle de la balle.
        let radians = angle * Math.PI / 180.0;
        this.glued.dx = Constants.BALL_VELOCITY * Math.cos(radians);
        this.glued.dy = Constants.BALL_VELOCITY * Math.sin(radians);
        this.glued.angle = angle;

        // Supprime la référence à la balle scotchée.
        if (this.glued) {
            this.glued = null;
        }
    },
    draw(dt) {
        for (let ball of this.balls) {
            if (ball.type > 0) { 
                // Détermine le sprite à dessiner selon la couleur de la balle.
                let sx = (ball.type - 1) * 8;
                
                // Dessine la balle.
                Graphics.drawImagePart(this.imgBall, ball.x, ball.y, sx, 0, ball.w, ball.h);
            }
        }
    },
    update(dt) {
        for (let idx in this.balls) {
            if (!this.balls[idx].destroyed && this.balls[idx].type > 0) {
                if (this.launched) {
                    if (this.glued == this.balls[idx]) {
                        // La balle est scotchée sur la raquette.
                        this.balls[idx].x = (Paddle.shape.x + this.gluedX);
                        this.balls[idx].y = (Paddle.shape.y - this.balls[idx].h);
                    } else {
                        // Met à jour la position de la balle.
                        this.balls[idx].x += (this.balls[idx].dx * dt);
                        this.balls[idx].y += (this.balls[idx].dy * dt);

                        // Faisons en sorte que la balle ne sorte pas des limites de l'aire de jeu.
                        if (this.balls[idx].x < Constants.BOARD_X) {
                            // La balle rebondit sur le bord de l'air de jeu.
                            this.balls[idx].x = Constants.BOARD_X;
                            this.balls[idx].dx = -this.balls[idx].dx;

                            // Joue un son.
                            Sound.play(this.sndBlock);

                            if (this.balls[idx].type == Constants.BALL_CYAN) {
                                // A chaque rebond, la balle cyan part dans n'importe quel direction, ce qui la
                                // rend totalement imprévisible.
                                let angle = Utils.randomBetween(0, 359);
        
                                // Définit le nouvel angle de la balle.
                                let radians = angle * Math.PI / 180.0;
                                this.balls[idx].dx = Constants.BALL_VELOCITY * Math.cos(radians);
                                this.balls[idx].dy = Constants.BALL_VELOCITY * Math.sin(radians);
                            }
                        }
                        
                        if (this.balls[idx].y < Constants.BOARD_Y) {
                            // La balle rebondit sur le bord de l'air de jeu.
                            this.balls[idx].y = Constants.BOARD_Y;
                            this.balls[idx].dy = -this.balls[idx].dy;

                            // Joue un son.
                            Sound.play(this.sndBlock);

                            if (this.balls[idx].type == Constants.BALL_CYAN) {
                                // A chaque rebond, la balle cyan part dans n'importe quel direction, ce qui la
                                // rend totalement imprévisible.
                                let angle = Utils.randomBetween(0, 359);
        
                                // Définit le nouvel angle de la balle.
                                let radians = angle * Math.PI / 180.0;
                                this.balls[idx].dx = Constants.BALL_VELOCITY * Math.cos(radians);
                                this.balls[idx].dy = Constants.BALL_VELOCITY * Math.sin(radians);
                            }
                        }

                        if (this.balls[idx].x > (Constants.BOARD_X2 - this.balls[idx].w)) {
                            // La balle rebondit sur le bord de l'air de jeu.
                            this.balls[idx].x = (Constants.BOARD_X2 - this.balls[idx].w);
                            this.balls[idx].dx = -this.balls[idx].dx;

                            // Joue un son.
                            Sound.play(this.sndBlock);

                            if (this.balls[idx].type == Constants.BALL_CYAN) {
                                // A chaque rebond, la balle cyan part dans n'importe quel direction, ce qui la
                                // rend totalement imprévisible.
                                let angle = Utils.randomBetween(0, 359);
        
                                // Définit le nouvel angle de la balle.
                                let radians = angle * Math.PI / 180.0;
                                this.balls[idx].dx = Constants.BALL_VELOCITY * Math.cos(radians);
                                this.balls[idx].dy = Constants.BALL_VELOCITY * Math.sin(radians);
                            }
                        }

                        // Si la balle sort de l'aire de jeu, elle est perdue.
                        if (this.balls[idx].y > (Constants.CANVAS_HEIGHT + 8)) {
                            // Détruit la balle.
                            this.balls[idx].destroyed = true;

                            // Joue un son.
                            Sound.play(this.sndLoseBall);
                        }

                        if (Paddle.state != 2 && !Stage.finished && !Paddle.destroying) {
                            // Faisons en sorte que la balle rebondisse sur la raquette.
                            this.isCollidingWithPaddle(idx, Paddle.shape);

                            if (Paddle.shape2.enabled) {
                                // Si la deuxième raquette est présente, on fait en sorte que la balle rebondise également
                                // dessus.
                                this.isCollidingWithPaddle(idx, Paddle.shape2);
                            }
                        }

                        // Gère les collisions entre la balle et les briques.
                        for (let y = 0; y < Constants.BOARD_LINES; y++) {
                            for (let x = 0; x < Constants.BOARD_COLUMNS; x++) {
                                let brick = Stage.bricks[y][x];
                                if (brick) {
                                    if (brick.state) {
                                        let destroyed = false, ignore = false;
                                        let collision = Utils.checkCollision(this.balls[idx], brick);

                                        // Pour les briques étoiles, il faut que leur couleur corresponde à celle du
                                        // bloc étoile pour qu'elles soient cassables.
                                        if (brick.color == Constants.BRICK_STAR_BLUE && Stage.starBlockState != 1) {
                                            ignore = true;
                                        } else if (brick.color == Constants.BRICK_STAR_YELLOW && Stage.starBlockState != 2) {
                                            ignore = true;
                                        } else if (brick.color == Constants.BRICK_STAR_RED && Stage.starBlockState != 3) {
                                            ignore = true;
                                        }

                                        if (!ignore) {
                                            if (collision.direction == "on") {
                                                if (this.balls[idx].type != Constants.BALL_RED) {
                                                    // La collision à eu lieu sur la brique. La balle rebondit.
                                                    this.balls[idx].y += collision.oy;
                                                    this.balls[idx].dy = -this.balls[idx].dy;
                                                }

                                                if (!brick.solid && this.balls[idx].type != Constants.BALL_MAGENTA) {
                                                    // La brique est détruite.
                                                    Stage.bricks[y][x].state = 0;
                                                    destroyed = true;
                                                } else if (brick.solid && this.balls[idx].type == Constants.BALL_RED) {
                                                    // Le bloc solide est détruit.
                                                    Stage.bricks[y][x].state = 0;
                                                    destroyed = true;

                                                    // Et la balle rebondit.
                                                    this.balls[idx].y += collision.oy;
                                                    this.balls[idx].dy = -this.balls[idx].dy;
                                                }
                                            } else if (collision.direction == "under") {
                                                if (this.balls[idx].type != Constants.BALL_RED) {
                                                    // La collision à eu lieu sous la brique. La balle rebondit.
                                                    this.balls[idx].y += collision.oy;
                                                    this.balls[idx].dy = -this.balls[idx].dy;
                                                }

                                                if (!brick.solid && this.balls[idx].type != Constants.BALL_MAGENTA) {
                                                    // La brique est détruite.
                                                    Stage.bricks[y][x].state = 0;
                                                    destroyed = true;
                                                } else if (brick.solid && this.balls[idx].type == Constants.BALL_RED) {
                                                    // Le bloc solide est détruit.
                                                    Stage.bricks[y][x].state = 0;
                                                    destroyed = true;

                                                    // Et la balle rebondit.
                                                    this.balls[idx].y += collision.oy;
                                                    this.balls[idx].dy = -this.balls[idx].dy;
                                                }
                                            } else if (collision.direction == "left" || collision.direction == "right") {
                                                if (this.balls[idx].type != Constants.BALL_RED) {
                                                    // La collision à eu lieu sur un des côtés de la brique. La balle rebondit.
                                                    this.balls[idx].x += collision.ox;
                                                    this.balls[idx].dx = -this.balls[idx].dx;
                                                }

                                                if (!brick.solid && this.balls[idx].type != Constants.BALL_MAGENTA) {
                                                    // La brique est détruite.
                                                    Stage.bricks[y][x].state = 0;
                                                    destroyed = true;
                                                } else if (brick.solid && this.balls[idx].type == Constants.BALL_RED) {
                                                    // Le bloc solide est détruit.
                                                    Stage.bricks[y][x].state = 0;
                                                    destroyed = true;

                                                    // Et la balle rebondit.
                                                    this.balls[idx].x += collision.ox;
                                                    this.balls[idx].dx = -this.balls[idx].dx;
                                                }
                                            }
                                        }

                                        if (collision.direction != "none") {
                                            if (brick.solid && brick.color == Constants.BLOCK_STAR_BLUE) {
                                                // Le bloc étoile change de couleur. Les briques étoiles de la même couleur que
                                                // le bloc sont cassables.
                                                Stage.starBlockState++;
                                                if (Stage.starBlockState > 3) {
                                                    Stage.starBlockState = 1;
                                                }
                                            }

                                            if (brick.solid && brick.color == Constants.BRICK_MYSTERY) {
                                                // Le bloc solide mystère reprend l'apparence d'un bloc solide grisatre quand une
                                                // balle la frappe.
                                                Stage.bricks[y][x].color = Constants.BLOCK_SOLID;
                                            }

                                            if (brick.solid && brick.color == Constants.BRICK_HIDDEN) {
                                                // La brique cachée redevient visible et devient cassable.
                                                Stage.bricks[y][x].color = Utils.randomBetween(Constants.BRICK_BLUE, Constants.BRICK_MAGENTA);
                                                Stage.bricks[y][x].solid = false;
                                            }

                                            if (brick.solid && brick.color == Constants.BLOCK_HIDDEN) {
                                                // Le bloc caché redevient visible.
                                                Stage.bricks[y][x].color = Constants.BLOCK_SOLID;
                                            }
                                        }

                                        if (destroyed) {
                                            // Joue un son.
                                            Sound.play(this.sndBrick);

                                            // Ajoute 5 points au score.
                                            Stage.score += 5;
                                            if (Stage.score > Constants.MAX_SCORE) {
                                                Stage.score = Constants.MAX_SCORE;
                                            }

                                            // Et une brique en moins !
                                            Stage.bricksLeft -= 1;

                                            if (brick.color >= Constants.BRICK_BLUE && brick.color <= Constants.BLOCK_SOLID) {
                                                // La brique explose en plusieurs petits morceaux.
                                                Effect.createRumble(brick.x, brick.y, -1, -1.5, brick.color);
                                                Effect.createRumble(brick.x + 8, brick.y, -0.5, -2, brick.color);
                                                Effect.createRumble(brick.x + brick.w - 16, brick.y, 0.5, -2, brick.color);
                                                Effect.createRumble(brick.x + brick.w - 8, brick.y, 1, -1.5, brick.color);
                                            } else if (brick.color == Constants.BRICK_STAR_BLUE) {
                                                // La brique explose en plusieurs petits morceaux.
                                                Effect.createRumble(brick.x, brick.y, -1, -1.5, Constants.BRICK_BLUE);
                                                Effect.createRumble(brick.x + 8, brick.y, -0.5, -2, Constants.BRICK_BLUE);
                                                Effect.createRumble(brick.x + brick.w - 16, brick.y, 0.5, -2, Constants.BRICK_BLUE);
                                                Effect.createRumble(brick.x + brick.w - 8, brick.y, 1, -1.5, Constants.BRICK_BLUE);
                                            } else if (brick.color == Constants.BRICK_STAR_YELLOW) {
                                                // La brique explose en plusieurs petits morceaux.
                                                Effect.createRumble(brick.x, brick.y, -1, -1.5, Constants.BRICK_YELLOW);
                                                Effect.createRumble(brick.x + 8, brick.y, -0.5, -2, Constants.BRICK_YELLOW);
                                                Effect.createRumble(brick.x + brick.w - 16, brick.y, 0.5, -2, Constants.BRICK_YELLOW);
                                                Effect.createRumble(brick.x + brick.w - 8, brick.y, 1, -1.5, Constants.BRICK_YELLOW);
                                            } else if (brick.color == Constants.BRICK_STAR_RED) {
                                                // La brique explose en plusieurs petits morceaux.
                                                Effect.createRumble(brick.x, brick.y, -1, -1.5, Constants.BRICK_RED);
                                                Effect.createRumble(brick.x + 8, brick.y, -0.5, -2, Constants.BRICK_RED);
                                                Effect.createRumble(brick.x + brick.w - 16, brick.y, 0.5, -2, Constants.BRICK_RED);
                                                Effect.createRumble(brick.x + brick.w - 8, brick.y, 1, -1.5, Constants.BRICK_RED);
                                            } else if (brick.color == Constants.BRICK_MYSTERY) {
                                                // La brique explose en plusieurs petits morceaux.
                                                Effect.createRumble(brick.x, brick.y, -1, -1.5, Constants.BRICK_PURPLE);
                                                Effect.createRumble(brick.x + 8, brick.y, -0.5, -2, Constants.BRICK_PURPLE);
                                                Effect.createRumble(brick.x + brick.w - 16, brick.y, 0.5, -2, Constants.BRICK_PURPLE);
                                                Effect.createRumble(brick.x + brick.w - 8, brick.y, 1, -1.5, Constants.BRICK_PURPLE);
                                            } else if (brick.color == Constants.BRICK_REGENERATE) {
                                                // La brique explose en plusieurs petits morceaux.
                                                Effect.createRumble(brick.x, brick.y, -1, -1.5, Constants.BRICK_MAGENTA);
                                                Effect.createRumble(brick.x + 8, brick.y, -0.5, -2, Constants.BRICK_MAGENTA);
                                                Effect.createRumble(brick.x + brick.w - 16, brick.y, 0.5, -2, Constants.BRICK_MAGENTA);
                                                Effect.createRumble(brick.x + brick.w - 8, brick.y, 1, -1.5, Constants.BRICK_MAGENTA);

                                                // Un chronomètre se met en place. Dès que celui-ci atteint 0, la brique
                                                // se régénère et il faudra de nouveau la frapper avec la balle pour pouvoir
                                                // terminer le niveau.
                                                Stage.bricks[y][x].timer = Constants.REGENERATE_BRICK_TIMER;
                                            } else {
                                                // La brique saute et disparaît de l'aire de jeu.
                                                let i = Utils.randomBetween(1, 2);
                                                Effect.createBrick(brick.x, brick.y, (i == 1 ? -1 : 1), -2, brick.color);
                                            }

                                            if (this.balls.length < Constants.MAX_BALLS && this.balls[idx].type == Constants.BALL_GREEN) {
                                                // Créé une nouvelle balle verte qui va partir dans la direction opposée.
                                                Ball.create(this.balls[idx].x, this.balls[idx].y, (360 - this.balls[idx].angle), Constants.BALL_GREEN);
                                            }

                                            if (this.balls[idx].type == Constants.BALL_BLUE) {
                                                // La balle bleue explose au contact de la brique.
                                                Effect.createExplosion(this.balls[idx].x, this.balls[idx].y, this.balls[idx].type);

                                                // Fait scintiller l'arrière-plan.
                                                Effect.twinkle();

                                                // Détruit les briques aux alentours.
                                                Stage.deleteBricksAround(x, y);

                                                // La balle redevient jaune.
                                                this.balls[idx].type = Constants.BALL_YELLOW;
                                            }

                                            if (this.balls[idx].type == Constants.BALL_CYAN) {
                                                // A chaque rebond, la balle cyan part dans n'importe quel direction, ce qui la
                                                // rend totalement imprévisible.
                                                let angle = Utils.randomBetween(0, 359);
                        
                                                // Définit le nouvel angle de la balle.
                                                let radians = angle * Math.PI / 180.0;
                                                this.balls[idx].dx = Constants.BALL_VELOCITY * Math.cos(radians);
                                                this.balls[idx].dy = Constants.BALL_VELOCITY * Math.sin(radians);
                                            }

                                            switch (brick.color) {
                                                case Constants.BRICK_5: {
                                                    // La brique est maintenant numérotée 4.
                                                    Stage.bricks[y][x].color = Constants.BRICK_4;
                                                    Stage.bricks[y][x].state = 1;
                                                    Stage.bricksLeft += 1;

                                                    break;
                                                }

                                                case Constants.BRICK_4: {
                                                    // La brique est maintenant numérotée 3.
                                                    Stage.bricks[y][x].color = Constants.BRICK_3;
                                                    Stage.bricks[y][x].state = 1;
                                                    Stage.bricksLeft += 1;

                                                    break;
                                                }

                                                case Constants.BRICK_3: {
                                                    // La brique est maintenant numérotée 2.
                                                    Stage.bricks[y][x].color = Constants.BRICK_2;
                                                    Stage.bricks[y][x].state = 1;
                                                    Stage.bricksLeft += 1;

                                                    break;
                                                }

                                                case Constants.BRICK_2: {
                                                    // La brique est maintenant numérotée 1.
                                                    Stage.bricks[y][x].color = Constants.BRICK_1;
                                                    Stage.bricks[y][x].state = 1;
                                                    Stage.bricksLeft += 1;

                                                    break;
                                                }
                                            }

                                            if (Stage.bricksLeft <= 0) {
                                                // Fait disparaître progressivement la raquette.
                                                Paddle.closeDown();

                                                // Joue un son.
                                                Sound.play(this.sndFinish);

                                                setTimeout(function() {
                                                    // Toutes les briques ont été détruites. On passe au niveau
                                                    // suivant.
                                                    Stage.finished = true;
                                                    Stage.remainingTime = Stage.time;
                                                }, 1000);
                                            } else {
                                                if (brick.color == Constants.BRICK_QUESTION) {
                                                    // Une brique surprise libère tout le temps une capsule.
                                                    let created = Capsule.create(brick.x, brick.y);
                                                    if (created) {
                                                        // Joue un son.
                                                        Sound.play(this.sndCapsule);
                                                    }
                                                } else if (brick.color == Constants.BRICK_TNT) {
                                                    // Une brique explosive... explose tout simplement !
                                                    Effect.createExplosion(brick.x, brick.y, Constants.BRICK_RED);

                                                    // Fait scintiller l'arrière-plan.
                                                    Effect.twinkle();

                                                    // Fait trembler l'aire de jeu.
                                                    Effect.shake();

                                                    // Détruit les briques aux alentours.
                                                    Stage.deleteBricksAround(x, y);

                                                    // Joue un son.
                                                    Sound.play(this.sndExplode);
                                                } else if (brick.color == Constants.BRICK_POW) {
                                                    // Détruit quelques briques présentes dans l'aire de jeu.
                                                    Stage.deleteSomeBricks();

                                                    // Fait trembler l'aire de jeu.
                                                    Effect.shake();
                                                } else {
                                                    // Détermine si l'on doit créer une capsule.
                                                    let i = Utils.randomBetween(1, 5);
                                                    if (i == 1) {
                                                        // Créé une capsule.
                                                        let created = Capsule.create(brick.x, brick.y);
                                                        if (created) {
                                                            // Joue un son.
                                                            Sound.play(this.sndCapsule);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Calcule l'angle à partir de la velocité.
                        let radians = Math.atan2(this.balls[idx].dx, this.balls[idx].dy);
                        let angle = Math.floor(radians * 180 / Math.PI);

                        // On s'arrange pour que la balle ne se déplace pas verticalement, ni horizontalement.
                        /*let angleFixed = false;
                        if (angle >= 0 && angle < 5) {
                            angle += 10;
                            angleFixed = true;
                        } else if (angle >= 85 && angle < 90) {
                            angle -= 10;
                            angleFixed = true;
                        } else if (angle >= 90 && angle < 98) {
                            angle += 10;
                            angleFixed = true;
                        } else if (angle >= 175 && angle < 180) {
                            angle -= 10;
                            angleFixed = true;
                        } else if (angle >= 180 && angle < 185) {
                            angle += 10;
                            angleFixed = true;
                        } else if (angle >= 265 && angle < 270) {
                            angle -= 10;
                            angleFixed = true;
                        } else if (angle >= 270 && angle < 275) {
                            angle += 10;
                            angleFixed = true;
                        } else if (angle >= 355 && angle <= 360) {
                            angle -= 10;
                            angleFixed = true;
                        }

                        if (angleFixed) {
                            // Définit le nouvel angle de la balle.
                            radians = angle * Math.PI / 180.0;
                            this.balls[idx].dx = Constants.BALL_VELOCITY * Math.cos(radians);
                            this.balls[idx].dy = Constants.BALL_VELOCITY * Math.sin(radians);
                        }*/

                        this.balls[idx].angle = angle;
                    }
                } else {
                    // Tant que la balle n'est pas lancée, elle reste posée sur la raquette.
                    this.balls[idx].x = (Paddle.shape.x + (Paddle.shape.w / 2) - (this.balls[idx].w / 2));
                    this.balls[idx].y = (Paddle.shape.y - this.balls[idx].h);
                }
            }
        }

        // Retire les balles qui sont sortis de l'écran.
        this.balls = this.balls.filter((ball) => !ball.destroyed);

        if (this.launched && this.balls.length == 0) {
            this.launched = false;

            // Détruit toute capsule.
            Capsule.destroy();

            if (Stage.bricksLeft > 0 && !Stage.finished && !Paddle.gameOver) {
                // La raquette est détruite.
                Paddle.lose();
            }
        }
    },
    isCollidingWithPaddle(idx, shape) {
        // Faisons en sorte que la balle rebondisse sur la raquette.
        let collision = Utils.checkCollision(this.balls[idx], shape);
        if (collision.direction == "on") {
            if (Paddle.type == Constants.PADDLE_CYAN && !this.glued) {
                // La balle est désormais scotchée sur la raquette.
                this.glued = this.balls[idx];

                // Calcule le point d'impact de la balle sur la raquette.
                this.gluedX = (this.balls[idx].x - shape.x);
            } else {
                // La collision à eu lieu sur la raquette. La balle rebondit.
                this.balls[idx].y += collision.oy;
                this.balls[idx].dy = -this.balls[idx].dy;

                // Calcule le point d'impact de la balle sur la raquette.
                let impact = (this.balls[idx].x + 4) - shape.x;
                impact = ((impact * 100) / shape.w);

                if (this.balls[idx].type != Constants.BALL_CYAN) {
                    // Calcule le nouvel angle de la balle.
                    let angle = (225 + impact);

                    // Définit le nouvel angle de la balle.
                    let radians = angle * Math.PI / 180.0;
                    this.balls[idx].dx = Constants.BALL_VELOCITY * Math.cos(radians);
                    this.balls[idx].dy = Constants.BALL_VELOCITY * Math.sin(radians);

                    // Joue un son.
                    Sound.play(this.sndPaddle);
                }

                if (Paddle.type == Constants.PADDLE_YELLOW) {
                    // La raquette est jaune, elle clone toutes les balles qui rebondissent dessus. On 
                    // recrée une balle de la même couleur que celle qui vient de rebondir.
                    this.create(this.balls[idx].x, this.balls[idx].y, (315 - impact), this.balls[idx].type);

                    // Joue un son.
                    Sound.play(this.sndClone);
                }
            }
        } else if (collision.direction == "under") {
            // La collision à eu lieu sous la raquette. La balle rebondit.
            this.balls[idx].y += collision.oy;
            this.balls[idx].dy = -this.balls[idx].dy;

            // Joue un son.
            Sound.play(this.sndPaddle);
        } else if (collision.direction == "left" || collision.direction == "right") {
            // La collision à eu lieu sur un des côtés de la raquette. La balle rebondit.
            this.balls[idx].x += collision.ox;
            this.balls[idx].dx = -this.balls[idx].dx;

            // Joue un son.
            Sound.play(this.sndPaddle);
        }
    }
})
