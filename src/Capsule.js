import Ball from "@/Ball.js";
import Constants from "@/Constants.js";
import Effect from "@/Effect.js";
import Graphics from "@/Graphics.js";
import Paddle from "@/Paddle.js";
import Stage from "@/Stage.js";
import Sound from "@/Sound.js";
import Utils from "@/Utils.js";

import sprCapsules from "@assets/img/capsule.png";

import sndPowerUp from "@assets/snd/powerup.ogg";
import sndPowerDown from "@assets/snd/powerdown.ogg";
import sndFirework from "@assets/snd/firework.ogg";

export default ({
    // Variables
    // =========

    imgCapsules: null,

    sndPowerUp: null,
    sndPowerDown: null,
    sndFirework: null,

    capsules: [],

    // Fonctions
    // =========

    async init() {
        // Chargement des ressources.
        this.imgCapsules = await Graphics.loadAsset(sprCapsules);

        this.sndPowerUp = await Sound.loadAsset(sndPowerUp);
        this.sndPowerDown = await Sound.loadAsset(sndPowerDown);
        this.sndFirework = await Sound.loadAsset(sndFirework);
    },
    create(x, y, force = false) {  
        let type = "", color = 0;

        // Détermine le type de capsule que l'on va créer.
        let i = Utils.randomBetween(1, 13);
        if (i == 1) {
            if (Stage.time < (Constants.MAX_TIME - 60)) {
                // Créé une capsule bleue qui va ajouter quelques secondes supplémentaires au chronomètre.
                color = Constants.CAPSULE_BLUE;
                type = "time+";
            } else {
                if (force) {
                    // Créé une capsule bleue qui va donner quelques points supplémentaires au joueur.
                    color = Constants.CAPSULE_BLUE;
                    type = "score";
                }
            }
        } else if (i == 2) {
            if (Ball.balls.length < Constants.MAX_BALLS) {
                // Créé une capsule jaune qui va créer une nouvelle balle sur l'aire de jeu.
                color = Constants.CAPSULE_YELLOW;
                type = "ball";
            } else {
                if (force) {
                    // Créé une capsule bleue qui va donner quelques points supplémentaires au joueur.
                    color = Constants.CAPSULE_BLUE;
                    type = "score";
                }
            }
        } else if (i == 3) {
            if (Stage.time >= 60) {
                // Créé une capsule rose qui va soustraire quelques secondes supplémentaires du chronomètre.
                color = Constants.CAPSULE_MAGENTA;
                type = "time-";
            } else {
                if (force) {
                    // Créé une capsule bleue qui va donner quelques points supplémentaires au joueur.
                    color = Constants.CAPSULE_BLUE;
                    type = "score";
                }
            }
        } else if (i == 4) {
            if (Paddle.type != Constants.PADDLE_RED && Paddle.type != Constants.PADDLE_GREEN) {
                if (Paddle.shape.w < Constants.MAX_PADDLE_SIZE) {
                    // Créé une capsule verte qui va allonger la taille de la raquette.
                    color = Constants.CAPSULE_GREEN;
                    type = "size+";
                } else {
                    // Créé une capsule rouge qui va rétrécir la taille de la raquette.
                    color = Constants.CAPSULE_RED;
                    type = "size-";
                }
            } else {
                if (force) {
                    // Créé une capsule bleue qui va donner quelques points supplémentaires au joueur.
                    color = Constants.CAPSULE_BLUE;
                    type = "score";
                }
            }
        } else if (i == 5) {
            if (Paddle.type != Constants.PADDLE_RED && Paddle.type != Constants.PADDLE_GREEN) {
                if (Paddle.shape.w > Constants.MIN_PADDLE_SIZE) {
                    // Créé une capsule rouge qui va rétrécir la taille de la raquette.
                    color = Constants.CAPSULE_RED;
                    type = "size-";
                } else {
                    // Créé une capsule verte qui va allonger la taille de la raquette.
                    color = Constants.CAPSULE_GREEN;
                    type = "size+";
                }
            } else {
                if (force) {
                    // Créé une capsule bleue qui va donner quelques points supplémentaires au joueur.
                    color = Constants.CAPSULE_BLUE;
                    type = "score";
                }
            }
        } else if (i == 6) {
            // Créé une capsule rose qui va inverser les contrôles de la raquette. L'effet est 
            // réversible.
            color = Constants.CAPSULE_MAGENTA;
            type = "reverse";
        } else if (i == 7) {
            // Créé une capsule cyan qui va donner au joueur la capacité de tirer des lasers
            // grâce à la raquette.
            color = Constants.CAPSULE_CYAN;
            type = "laser";
        } else if (i == 8) {
            if (Ball.balls.length == 1) {
                // Créé une capsule jaune qui va créer un feu d'artifice de balles.
                color = Constants.CAPSULE_YELLOW;
                type = "firework";
            } else {
                // Créé une capsule bleue qui va donner quelques points supplémentaires au joueur.
                color = Constants.CAPSULE_BLUE;
                type = "score";
            }
        } else if (i == 9) {
            if (Paddle.type == Constants.PADDLE_GREEN) {
                if (Paddle.spacing < Constants.MAX_PADDLE_SPACE) {
                    // Créé une capsule verte qui va rapprocher les deux raquettes.
                    color = Constants.CAPSULE_GREEN;
                    type = "space-";
                } else {
                    // Créé une capsule rouge qui va écarter les deux raquettes.
                    color = Constants.CAPSULE_RED;
                    type = "space+";
                }
            } else {
                if (force) {
                    // Créé une capsule bleue qui va donner quelques points supplémentaires au joueur.
                    color = Constants.CAPSULE_BLUE;
                    type = "score";
                }
            }
        } else if (i == 10) {
            if (Paddle.type == Constants.PADDLE_GREEN) {
                if (Paddle.shape.w > Constants.MIN_PADDLE_SPACE) {
                    // Créé une capsule rouge qui va écarter les deux raquettes.
                    color = Constants.CAPSULE_RED;
                    type = "space+";
                } else {
                    // Créé une capsule verte qui va rapprocher les deux raquettes.
                    color = Constants.CAPSULE_GREEN;
                    type = "space-";
                }
            } else {
                if (force) {
                    // Créé une capsule bleue qui va donner quelques points supplémentaires au joueur.
                    color = Constants.CAPSULE_BLUE;
                    type = "score";
                }
            }
        } else if (i == 11) {
            // Créé une capsule cyan qui donne la possibilité à la raquette de cloner toutes
            // les balles qui rebondissent dessus.
            color = Constants.CAPSULE_CYAN;
            type = "clone";
        } else if (i == 12) {
            // Créé une capsule cyan qui transforme la raquette en raquette clignotante, qui laisse
            // passer les balles quand la raquette est légèrement estompée.
            color = Constants.CAPSULE_CYAN;
            type = "blink";
        } else if (i == 13) {
            // Créé une capsule cyan qui dédouble la raquette. Un espace sépare les deux
            // raquettes. Cet espace peut s'agrandir ou rétrécir. 
            color = Constants.CAPSULE_CYAN;
            type = "twin";
        }

        if (color) {
            // Créé la capsule.
            this.capsules.push({
                x: x,
                y: y,
                w: 16,
                h: 8,
                color: color,
                type: type,
                destroyed: false,
            });

            return true;
        }

        return false;
    },
    destroy() {
        this.capsules = [];
    },
    draw(dt) {
        for (let capsule of this.capsules) {
            if (!capsule.destroyed) {
                // Dessine la capsule.
                Graphics.drawImagePart(this.imgCapsules, capsule.x, capsule.y, 0, ((capsule.color - 1) * 8), capsule.w, capsule.h);
            }
        }
    },
    update(dt) {
        for (let idx in this.capsules) {
            let capsule = this.capsules[idx];
            if (!capsule.destroyed) {
                // Met à jour la position de la capsule.
                this.capsules[idx].y += (Constants.CAPSULE_VELOCITY * dt);

                // Si la capsule sort de l'aire de jeu, elle est perdue.
                if (this.capsules[idx].y > (Constants.CANVAS_HEIGHT + 8)) {
                    // Détruit la capsule.
                    this.capsules[idx].destroyed = true;
                }

                if (Paddle.state != 2 && !Stage.finished) {
                    // Détecte une collision entre la raquette et la capsule.
                    let collision = Utils.checkCollision(capsule, Paddle.shape);
                    if (collision.direction != "none") {
                        // Collecte la capsule.
                        this.collect(capsule);
                        this.capsules[idx].destroyed = true;
                    }

                    if (Paddle.shape2.enabled) {
                        // Détecte une collision entre la deuxième raquette et la capsule.
                        let collision = Utils.checkCollision(capsule, Paddle.shape2);
                        if (collision.direction != "none") {
                            // Collecte la capsule.
                            this.collect(capsule);
                            this.capsules[idx].destroyed = true;
                        }
                    }
                }
            }
        }

        // Retire les capsules qui sont sortis de l'écran.
        this.capsules = this.capsules.filter((capsule) => !capsule.destroyed);
    },
    collect(capsule) {
        // Il y a une collision entre la raquette et la capsule. Cette dernière est
        // collectée et les effets de cette capsule s'appliquent maintenant.
        switch (capsule.type) {
            // Score
            // -----

            case "score": {
                // Donne quelques points supplémentaires au joueur.
                let i = Utils.randomBetween(1, 10);
                if (i >= 1 && i <= 2) {
                    // Donne 500 points.
                    Stage.score += 500;
                } else if (i >= 3 && i <= 6) {
                    // Donne 200 points.
                    Stage.score += 200;
                } else if (i >= 7 && i <= 9) {
                    // Donne 300 points.
                    Stage.score += 300;
                } else if (i == 10) {
                    // Donne 1000 points.
                    Stage.score += 1000;
                }

                if (Stage.score > Constants.MAX_SCORE) {
                    Stage.score = Constants.MAX_SCORE;
                }

                // Affiche l'intitulé de la capsule.
                Effect.createText(capsule.x, capsule.y, "SCORE");

                // Joue un son.
                Sound.play(this.sndPowerUp);

                break;
            }

            // Chronomètre
            // -----------

            case "time+": {
                // Ajoute quelques secondes au chronomètre.
                let i = Utils.randomBetween(1, 10);
                if (i >= 1 && i <= 2) {
                    // Ajoute 15 secondes au chronomètre.
                    Stage.time += 15;
                } else if (i >= 3 && i <= 6) {
                    // Ajoute 30 secondes au chronomètre.
                    Stage.time += 30;
                } else if (i >= 7 && i <= 9) {
                    // Ajoute 45 secondes au chronomètre.
                    Stage.time += 45;
                } else if (i == 10) {
                    // Ajoute 60 secondes au chronomètre.
                    Stage.time += 60;
                }

                // Affiche l'intitulé de la capsule.
                Effect.createText(capsule.x, capsule.y, "TIME+");

                // Joue un son.
                Sound.play(this.sndPowerUp);

                break;
            }

            case "time-": {
                // Soustrait quelques secondes du chronomètre.
                let i = Utils.randomBetween(1, 10);
                if (i >= 1 && i <= 8) {
                    // Retire 15 secondes au chronomètre.
                    Stage.time -= 15;
                } else if (i >= 8 && i <= 9) {
                    // Retire 30 secondes au chronomètre.
                    Stage.time -= 30;
                } else if (i == 10) {
                    // Retire 45 secondes au chronomètre.
                    Stage.time -= 45;
                }

                // Affiche l'intitulé de la capsule.
                Effect.createText(capsule.x, capsule.y, "TIME-");

                // Joue un son.
                Sound.play(this.sndPowerDown);

                break;
            }

            // Raquette
            // --------

            case "size+": {
                // Augmente la taille de la raquette.
                Paddle.sizeUp();

                // Affiche l'intitulé de la capsule.
                Effect.createText(capsule.x, capsule.y, "GREATER");

                // Joue un son.
                Sound.play(this.sndPowerUp);

                break;
            }

            case "size-": {
                // Rétrécit la taille de la raquette.
                Paddle.sizeDown();

                // Affiche l'intitulé de la capsule.
                Effect.createText(capsule.x, capsule.y, "SMALLER");

                // Joue un son.
                Sound.play(this.sndPowerDown);

                break;
            }

            case "space+": {
                // Ecarte les deux raquettes.
                Paddle.spaceDown();

                // Affiche l'intitulé de la capsule.
                Effect.createText(capsule.x, capsule.y, "FURTHER");

                // Joue un son.
                Sound.play(this.sndPowerDown);

                break;
            }

            case "space-": {
                // Rapproche les deux raquettes.
                Paddle.spaceUp();

                // Affiche l'intitulé de la capsule.
                Effect.createText(capsule.x, capsule.y, "CLOSER");

                // Joue un son.
                Sound.play(this.sndPowerUp);

                break;
            }

            case "laser": {
                // La raquette devient rouge. Cette raquette a la capacité de tirer des lasers.
                Paddle.transform(Constants.PADDLE_RED);

                // Choisit la couleur du laser dans le plus grand des hasards.
                Paddle.chooseLaserType();

                // Affiche l'intitulé de la capsule.
                Effect.createText(capsule.x, capsule.y, "LASER");

                // Joue un son.
                Sound.play(this.sndPowerUp);

                break;
            }

            case "clone": {
                // La raquette devient jaune. Cette raquette a la capacité de cloner n'importe quelle
                // balle qui rebondit dessus.
                Paddle.transform(Constants.PADDLE_YELLOW);

                // Affiche l'intitulé de la capsule.
                Effect.createText(capsule.x, capsule.y, "CLONE");

                // Joue un son.
                Sound.play(this.sndPowerUp);

                break;
            }

            case "blink": {
                // La raquette devient rose. Cette raquette clignotante laisse passer les balles
                // quand elle est légèrement estompée.
                Paddle.transform(Constants.PADDLE_MAGENTA);

                // Affiche l'intitulé de la capsule.
                Effect.createText(capsule.x, capsule.y, "BLINK");

                // Joue un son.
                Sound.play(this.sndPowerDown);

                break;
            }

            case "twin": {
                // La raquette se dédouble et devient verte. L'espace entre les deux raquettes
                // peut rétrécit ou s'agrandir.
                Paddle.transform(Constants.PADDLE_GREEN);

                // Affiche l'intitulé de la capsule.
                Effect.createText(capsule.x, capsule.y, "TWIN");

                // Joue un son.
                Sound.play(this.sndPowerUp);

                break;
            }

            // Balles
            // ------

            case "ball": {
                // Détermine la couleur de la balle. Il y a de fortes probabilités d'obtenir
                // une balle jaune - une balle normale donc - et de plus faibles probabilités d'avoir
                // une balle qui rend service au joueur.
                let i = Utils.randomBetween(1, 16);

                // Créé une nouvelle balle sur l'aire de jeu.
                if (Ball.balls.length > 0) {
                    let ball = Ball.balls[0];

                    // La nouvelle balle part dans la direction opposée de la première balle.
                    if (i == 1) {
                        // La nouvelle balle sera verte. Celle-ci va se multiplier à chaque rebond sur
                        // une brique.
                        Ball.create(ball.x, ball.y, (360 - ball.angle), Constants.BALL_GREEN);
                    } else if (i >= 2 && i <= 3) {
                        // La nouvelle balle sera rouge. Celle-ci ne rebondit pas sur les briques.
                        Ball.create(ball.x, ball.y, (360 - ball.angle), Constants.BALL_RED);
                    } else if (i == 4) {
                        // La nouvelle balle sera rose. Celle-ci est impuissante, elle ne peut pas détruire
                        // les briques. Une balle à se débarasser au plus vite.
                        Ball.create(ball.x, ball.y, (360 - ball.angle), Constants.BALL_MAGENTA);
                    } else if (i == 5) {
                        // La nouvelle balle sera cyan. 
                        // TODO: à déterminer.
                        Ball.create(ball.x, ball.y, (360 - ball.angle), Constants.BALL_CYAN);
                    } else if (i == 6) {
                        // La nouvelle balle sera bleue. Celle-ci explose au contact d'une brique. 
                        Ball.create(ball.x, ball.y, (360 - ball.angle), Constants.BALL_BLUE);
                    } else {
                        // La nouvelle balle sera jaune. Une balle tout à fait banale.
                        Ball.create(ball.x, ball.y, (360 - ball.angle), Constants.BALL_YELLOW);
                    }

                    // Affiche l'intitulé de la capsule.
                    Effect.createText(capsule.x, capsule.y, "BALL");

                    // Joue un son.
                    Sound.play(this.sndPowerUp);
                }

                break;
            }

            case "firework": {
                // Créé un feu d'artifice de balles sur l'aire de jeu.
                if (Ball.balls.length == 1) {
                    let ball = Ball.balls[0];

                    // En bas à droite.
                    Ball.create(ball.x, ball.y, 45, Constants.BALL_YELLOW);

                    // En bas à gauche.
                    Ball.create(ball.x, ball.y, 135, Constants.BALL_YELLOW);

                    // En haut à gauche.
                    Ball.create(ball.x, ball.y, 225, Constants.BALL_YELLOW);

                    // En haut à droite.
                    Ball.create(ball.x, ball.y, 315, Constants.BALL_YELLOW);

                    // Affiche l'intitulé de la capsule.
                    Effect.createText(capsule.x, capsule.y, "FIREWORK");

                    // Joue un son.
                    Sound.play(this.sndFirework);
                }

                break;
            }

            // Contrôles
            // ---------

            case "reverse": {
                // Inverse les contrôles de la raquette. Cet effet est réversible.
                Paddle.controlsReversed = !Paddle.controlsReversed;

                // Affiche l'intitulé de la capsule.
                Effect.createText(capsule.x, capsule.y, "REVERSE");

                if (Paddle.controlsReversed) {
                    // Joue un son.
                    Sound.play(this.sndPowerDown);
                } else {
                    // Joue un son.
                    Sound.play(this.sndPowerUp);
                }

                break;
            }

            case "vertical": {
                // Donne la possibilité au joueur de déplacer sa raquette verticalement. Cet effet
                // reste actif jusqu'au passage au niveau suivant; ou bien à la destruction de la raquette.
                Paddle.controlsVertical = true;

                // Affiche l'intitulé de la capsule.
                Effect.createText(capsule.x, capsule.y, "ELEVATION");

                // Joue un son.
                Sound.play(this.sndPowerUp);

                break;
            }
        }
    }
})
