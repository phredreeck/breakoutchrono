import Ball from "@/Ball.js";
import Capsule from "@/Capsule.js";
import Constants from "@/Constants.js";
import Effect from "@/Effect.js";
import Graphics from "@/Graphics.js";
import Input from "@/Input.js";
import Sound from "@/Sound.js";
import Stage from "@/Stage.js";
import Utils from "@/Utils.js";

import sprPaddle from "@assets/img/paddle.png";
import sprLasers from "@assets/img/lasers.png";

import sndLaunch from "@assets/snd/launch.ogg";
import sndLaser from "@assets/snd/laser.ogg";
import sndLaserHit from "@assets/snd/laserhit.ogg";
import sndSelect from "@assets/snd/select.ogg";

/* Ce fichier contient les méthodes permettant de gérer la raquette, ainsi que les lasers.
 * Il éxiste 6 types de raquettes, avec pour chaque type un comportement différent :
 * - Bleue : raquette de taille variable;
 * - Rouge : raquette ayant la capacité de tirer des lasers;
 * - Jaune : raquette de taille variable ayant la capacité de cloner toute balle qui rebondit
 *   dessus;
 * - Verte : raquette de taille variable qui peut se déplacer verticalement;
 * - Cyan : raquette collante, les balles restent scotchés dessus. Le joueur peut ainsi les
 *   relancer manuellement dans la direction qu'il veut;
 * - Rose : raquette qui s'estompe momentanément. Quand la raquette est quasi-invisible, les
 *   balles passent au travers.
 * Il éxiste 6 types de lasers, avec pour chaque type un comportement différent :
 * - Bleu : détruit qu'une seule brique à la fois;
 * - Rouge : détruit plusieurs briques en une fois;
 * - Jaune : est tiré en double, le deuxième laser part légèrement en biais pour arroser plus
 *   facilement l'aire de jeu; 
 * - Vert : est tiré en rafale en pressant simplement la touche ESPACE;
 * - Cyan : explose au contact d'une brique;
 * - Rose : retourne à l'envoyeur au contact d'une brique ou d'un bloc.
 */
export default ({
    // Variables
    // =========

    imgPaddle: null,
    imgLasers: null,

    sndLaunch: null,
    sndLaser: null,
    sndLaserHit: null,
    sndSelect: null,

    shape: {
        x: 0,
        y: 0,
        w: 32,
        h: 8,
    },
    velocity: {
        dx: 0,
        dy: 0,
    },
    shape2: {
        x: 0,
        y: 0,
        w: 32,
        h: 8,
        enabled: false,
    },
    type: Constants.PADDLE_BLUE,
    launching: false,
    destroying: true,
    gameOver: false,
    disappearing: false,
    direction: 2,
    controlsReversed: false,
    controlsVertical: false,
    state: 0,
    spacing: 16,
    ready: false,

    lasers: [],
    laserType: 0,
    ammoLeft: 0,

    currentStateTime: 0,
    currentLaserTime: 0,

    // Fonctions
    // =========

    async init() {
        // Chargement des ressources.
        this.imgPaddle = await Graphics.loadAsset(sprPaddle);
        this.imgLasers = await Graphics.loadAsset(sprLasers);

        this.sndLaunch = await Sound.loadAsset(sndLaunch);
        this.sndLaser = await Sound.loadAsset(sndLaser);
        this.sndLaserHit = await Sound.loadAsset(sndLaserHit);
        this.sndSelect = await Sound.loadAsset(sndSelect);
        
        // Définit la position initiale de la balle.
        this.shape.x = (Constants.BOARD_X + (Constants.BOARD_WIDTH / 2)) - (this.shape.w / 2);
        this.shape.y = Constants.CANVAS_HEIGHT;

        // Désactive la deuxième raquette.
        this.shape2.enabled = false;

        // Initialise la liste des lasers.
        this.lasers = [];
    },
    destroy() {
        this.type = 0;
        this.state = 0;
        this.shape.y = Constants.CANVAS_HEIGHT;

        // Désactive la deuxième raquette.
        this.shape2.enabled = false;

        // Initialise la liste des lasers.
        this.lasers = [];
    },
    reset() {
        // Réinitialise l'état de la raquette.
        this.destroying = false;
        this.launching = true;
        this.gameOver = false;
        this.disappearing = false;
        this.type = Constants.PADDLE_BLUE;
        this.shape.w = Constants.PADDLE_SIZE;
        this.controlsReversed = false;
        this.controlsVertical = false;
        this.state = 0;
        this.ready = false;

        // Désactive la deuxième raquette.
        this.shape2.enabled = false;

        // Initialise la liste des lasers.
        this.lasers = [];
    },
    launch() {
        // Réinitialise l'état de la raquette.
        this.reset();

        // Définit la position initiale de la balle.
        this.shape.x = (Constants.BOARD_X + (Constants.BOARD_WIDTH / 2)) - (this.shape.w / 2);
        this.shape.y = Constants.CANVAS_HEIGHT;

        Stage.playable = true;
        this.ready = true;

        // Joue un son.
        Sound.play(this.sndLaunch);
    },
    closeDown() {
        this.disappearing = true;
        this.velocity.dx = this.velocity.dy = 0;

        // Toutes les munitions sont perdues.
        this.ammoLeft = 0;

        if (this.shape2.enabled) {
            // La deuxième raquette explose.
            this.explode(this.shape2, Constants.PADDLE_GREEN);
        }

        // Désactive la deuxième raquette.
        this.shape2.enabled = false;
    },
    sizeReset() {
        // Restaure la raquette à sa taille initiale.
        let w = this.shape.w;
        let x = (32 - w) / 2;
        this.shape.w = 32;
        this.shape.x -= x;
    },
    spaceUp() {
        if (this.type == Constants.PADDLE_GREEN) {
            if (this.spacing > Constants.MIN_PADDLE_SPACE) {
                if (this.spacing == 16) {
                    // Colle les deux raquettes ensemble.
                    this.spacing = 0;
                } else {
                    // Rapproche les deux raquettes.
                    this.spacing -= 8;
                }
            }
        }
    },
    spaceDown() {
        if (this.type == Constants.PADDLE_GREEN) {
            if (this.spacing < Constants.MAX_PADDLE_SPACE) {
                if (this.spacing == 0) {
                    // Décolle les deux raquettes.
                    this.spacing = 16;
                } else {
                    // Ecarte les deux raquettes.
                    this.spacing += 8;
                }
            }
        }
    },
    sizeDown() {
        if (this.type != Constants.PADDLE_RED) {
            if (this.shape.w > Constants.MIN_PADDLE_SIZE) {
                // Raccourcit la taille de la raquette.
                this.shape.w -= 8;
                this.shape.x += 4;

                if (this.shape2.enabled) {
                    // Raccourcit la taille de la deuxième raquette.
                    this.shape2.w -= 8;
                    this.shape2.x += 4;
                }
            }
        }
    },
    sizeUp() {
        if (this.type != Constants.PADDLE_RED) {
            if (this.shape.w < Constants.MAX_PADDLE_SIZE) {
                // Allonge la taille de la raquette.
                this.shape.w += 8;
                this.shape.x -= 4;

                if (this.shape2.enabled) {
                    // Raccourcit la taille de la deuxième raquette.
                    this.shape2.w -= 8;
                    this.shape2.x += 4;
                }
            }
        }
    },
    transform(type) {
        if (type == Constants.PADDLE_RED) {
            // La raquette rouge ne peut pas s'allonger, ni se rétrécir. On restaure donc ici
            // sa taille initiale.
            this.sizeReset();
        }

        if (type != Constants.PADDLE_GREEN && this.type == Constants.PADDLE_GREEN) {
            // On passe d'une raquette verte à une autre. On réinitialise la taille de la nouvelle
            // raquette.
            this.sizeReset();
        }

        if (type == Constants.PADDLE_GREEN && this.type != Constants.PADDLE_GREEN) {
            // On passe à une raquette verte, on met à jour sa position.
            let x = this.shape.x + (this.shape.w / 2);
            x -= 8 + this.shape.w;
            this.shape.x = x;
        }

        // Change la couleur de la raquette. Un changement de couleur apporte un changement
        // de comportement de la raquette.
        this.type = type;
        this.state = 0;

        if (this.type == Constants.PADDLE_GREEN) {
            // Définit la taille des deux raquettes.
            this.shape.w = 24;
            this.shape2.w = 24;

            // Définit l'espacement initial entre les deux raquette.
            this.spacing = 16;

            // Active la deuxième raquette. Celle-ci sera située juste à côté.
            this.shape2.enabled = true;
        } else {
            // La deuxième raquette explose.
            this.explode(this.shape2, Constants.PADDLE_GREEN);

            // Désactive la deuxième raquette.
            this.shape2.enabled = false;
        }
    },
    lose(direct = false) {
        let _destroying = this.destroying;

        if (!_destroying) {
            this.destroying = true;
            this.launching = false;
            this.disappearing = false;
            Stage.playable = false;

            // La raquette perd la capacité de tirer des lasers.
            this.laserType = 0;

            // Toutes les munitions sont perdues.
            this.ammoLeft = 0;
        }

        if (direct) {
            // La partie est terminée.
            this.gameOver = true;
        } else {
            // On soustrait quelques secondes au chronomètre. Plus le joueur va perdre des balles, plus
            // la pénalité va augmenter.
            Stage.time -= Stage.timePenalty;
            if (Stage.timePenalty < Constants.MAX_TIME_PENALTY) {
                Stage.timePenalty += Constants.TIME_PENALTY_STEP;
            }

            if (Stage.time < 0) {
                // La partie est terminée.
                Stage.time = 0;
                this.gameOver = true;
            }
        }

        if (!_destroying) {
            // La raquette explose en petits morceaux.
            this.explode(this.shape);
            if (this.shape2.enabled) {
                // La deuxième raquette explose également en petits morceaux.
                this.explode(this.shape2, Constants.PADDLE_GREEN, true);

                // Désactive la deuxième raquette.
                this.shape2.enabled = false;
            }
        }

        setTimeout(function() {
            // Dès que la raquette sort de l'écran, on en recrée une nouvelle... s'il reste des vies
            // au joueur. Dans le cas contraire, la partie sera terminée.
            if (!this.gameOver) {
                // Recréé une nouvelle raquette.
                this.launch();
            }
        }.bind(this), 2000);
    },
    lose2() {
        if (!this.destroying) {
            this.destroying = true;
            this.launching = false;
            this.disappearing = false;
            Stage.playable = false;

            // La raquette perd la capacité de tirer des lasers.
            this.laserType = 0;

            // Toutes les munitions sont perdues.
            this.ammoLeft = 0;

            // La raquette explose en petits morceaux.
            this.explode(this.shape);
            if (this.shape2.enabled) {
                // La deuxième raquette explose également en petits morceaux.
                this.explode(this.shape2, Constants.PADDLE_GREEN, true);

                // Désactive la deuxième raquette.
                this.shape2.enabled = false;
            }
        }
    },
    explode(shape, color = null, isLeft = false) {
        // La raquette explose en petits morceaux.
        Effect.createPaddleRumble(shape.x, shape.y, -1, -1.5, 1, (color ? color : this.type));
        if (shape.w == 24) {
            if (isLeft) {
                Effect.createPaddleRumble(shape.x + 8, shape.y, -0.5, -2, 2, (color ? color : this.type));
            } else {
                Effect.createPaddleRumble(shape.x + 8, shape.y, 0.5, -2, 2, (color ? color : this.type));
            }
        } else if (shape.w == 32) {
            Effect.createPaddleRumble(shape.x + 8, shape.y, -0.5, -2, 2, (color ? color : this.type));
            Effect.createPaddleRumble(shape.x + shape.w - 16, shape.y, 0.5, -2, 2, (color ? color : this.type));
        } else if (shape.w == 40) {
            Effect.createPaddleRumble(shape.x + 8, shape.y, -0.5, -2, 2, (color ? color : this.type));
            let i = Utils.randomBetween(1, 2);
            Effect.createPaddleRumble(shape.x + 16, shape.y, (i == 1 ? -0.25 : 0.25), -2, 2, (color ? color : this.type));
            Effect.createPaddleRumble(shape.x + shape.w - 16, shape.y, 0.5, -2, 2, (color ? color : this.type));
        } else if (shape.w == 48) {
            Effect.createPaddleRumble(shape.x + 8, shape.y, -0.5, -2, 2, (color ? color : this.type));
            Effect.createPaddleRumble(shape.x + 16, shape.y, -0.25, -2.25, 2, (color ? color : this.type));
            Effect.createPaddleRumble(shape.x + shape.w - 24, shape.y, 0.25, -2.25, 2, (color ? color : this.type));
            Effect.createPaddleRumble(shape.x + shape.w - 16, shape.y, 0.5, -2, 2, (color ? color : this.type));
        }
        Effect.createPaddleRumble(shape.x + shape.w - 8, shape.y, 1, -1.5, 3, (color ? color : this.type));
    },
    draw(dt) {
        if (this.type) {
            // Détermine le sprite à dessiner selon la couleur de la raquette.
            let sy = (this.type - 1) * 8;

            if (!this.destroying) {
                if (this.state == 0) {
                    Graphics.setAlpha(1);
                } else if (this.state == 1 || this.state == 3) {
                    Graphics.setAlpha(0.65);
                } else if (this.state == 2) {
                    Graphics.setAlpha(0.35);
                }

                // Dessine les extremités de la raquette.
                Graphics.drawImagePart(this.imgPaddle, this.shape.x, this.shape.y, 0, sy, 8, this.shape.h);
                Graphics.drawImagePart(this.imgPaddle, this.shape.x + (this.shape.w - 8), this.shape.y, 16, sy, 8, this.shape.h);

                // Dessine le corps de la raquette.
                if (this.shape.w > 16) {
                    for (let i = 1; i <= (this.shape.w / 8) - 2; i++) {
                        Graphics.drawImagePart(this.imgPaddle, this.shape.x + (i * 8), this.shape.y, 8, sy, 8, this.shape.h);
                        
                    }
                }

                Graphics.setAlpha(1);

                if (this.shape2.enabled) {
                    // Dessine les extremités de la deuxième raquette verte.
                    Graphics.drawImagePart(this.imgPaddle, this.shape2.x, this.shape2.y, 0, 16, 8, this.shape2.h);
                    Graphics.drawImagePart(this.imgPaddle, this.shape2.x + (this.shape2.w - 8), this.shape2.y, 16, 16, 8, this.shape2.h);

                    // Dessine le corps de la raquette verte.
                    if (this.shape2.w > 16) {
                        for (let i = 1; i <= (this.shape2.w / 8) - 2; i++) {
                            Graphics.drawImagePart(this.imgPaddle, this.shape2.x + (i * 8), this.shape2.y, 8, 16, 8, this.shape2.h);
                        }
                    }
                }
            }
        }

        // Dessine les tirs de lasers.
        for (let laser of this.lasers) {
            let sy = (laser.type - 1) * 8;
            Graphics.drawImagePart(this.imgLasers, laser.x, laser.y, 0, sy, 8, 8);
        }
    },
    update(dt) {
        // Gestion de la raquette scintillante
        // -----------------------------------

        let time = window.performance.now();

        // Le premier chronomètre se lance au début du niveau. Le joueur doit vaincre tous
        // les ennemis présents dans le niveau avant que ce chronomètre n'atteigne 0. Dès
        // qu'il atteint 0, la partie est terminée.
        if (time > this.currentStateTime) {
            this.currentStateTime = (1000 + time);
            
            if (this.type == Constants.PADDLE_MAGENTA && Ball.launched) {
                // Change l'état de la raquette.
                this.state += 1;

                if (this.state === 4) {
                    this.state = 0;
                }
            }
        }

        // Gestion de la raquette
        // ----------------------

        if (this.type && this.ready) {
            if (this.launching) {
                // Fait apparaître progressivement la raquette.
                this.shape.y -= 1;

                if (this.shape.y < (Constants.CANVAS_HEIGHT - 24)) {
                    // La raquette a atteint sa position définitive. On créé la balle.
                    this.shape.y = (Constants.CANVAS_HEIGHT - 24);
                    this.launching = false;

                    setTimeout(function() {
                        // Créé une nouvelle balle.
                        Ball.createFirst();
                    }, 1000);
                }
            } else if (this.disappearing) {
                // Fait disparaître progressivement la raquette.
                if (this.shape.y < Constants.CANVAS_HEIGHT) {
                    this.shape.y += 1;
                }
            } else if (!this.destroying) {
                if (Input.keys["KeyLeft"]) {
                    if (this.type == Constants.PADDLE_GREEN) {
                        if (this.controlsReversed) {
                            // Avec les contrôles inversés, la touche GAUCHE déplace les raquettes 
                            // vers la droite.
                            if (this.shape2.x < (Constants.BOARD_X2 - this.shape2.w)) {
                                this.shape.x += (Constants.PADDLE_VELOCITY * dt);
                            } else {
                                this.shape.x = (Constants.BOARD_X2 - this.shape2.w - this.spacing - this.shape.w);
                            }

                            this.direction = 2;
                        } else {
                            // La touche GAUCHE permet de déplacer les raquettes vers la gauche.
                            if (this.shape.x > Constants.BOARD_X) {
                                this.shape.x -= (Constants.PADDLE_VELOCITY * dt);
                            } else {
                                this.shape.x = Constants.BOARD_X;
                            }

                            this.direction = 1;
                        }
                    } else {
                        if (this.controlsReversed) {
                            // Avec les contrôles inversés, la touche GAUCHE déplace le raquette 
                            // vers la droite.
                            if (this.shape.x < (Constants.BOARD_X2 - this.shape.w)) {
                                this.shape.x += (Constants.PADDLE_VELOCITY * dt);
                            } else {
                                this.shape.x = (Constants.BOARD_X2 - this.shape.w);
                            }

                            this.direction = 2;
                        } else {
                            // La touche GAUCHE permet de déplacer la raquette vers la gauche.
                            if (this.shape.x > Constants.BOARD_X) {
                                this.shape.x -= (Constants.PADDLE_VELOCITY * dt);
                            } else {
                                this.shape.x = Constants.BOARD_X;
                            }

                            this.direction = 1;
                        }
                    }
                }

                if (Input.keys["KeyRight"]) {
                    if (this.type == Constants.PADDLE_GREEN) {
                        if (this.controlsReversed) {
                            // Avec les contrôles inversés, la touche DROITE déplace les raquettes 
                            // vers la gauche.
                            if (this.shape.x > Constants.BOARD_X) {
                                this.shape.x -= (Constants.PADDLE_VELOCITY * dt);
                            } else {
                                this.shape.x = Constants.BOARD_X;
                            }

                            this.direction = 1;
                        } else {
                            // La touche DROITE déplace les raquettes vers la droite.
                            if (this.shape2.x < (Constants.BOARD_X2 - this.shape2.w)) {
                                this.shape.x += (Constants.PADDLE_VELOCITY * dt);
                            } else {
                                this.shape.x = (Constants.BOARD_X2 - this.shape2.w - this.spacing - this.shape.w);
                            }

                            this.direction = 2;
                        }
                    } else {
                        if (this.controlsReversed) {
                            // Avec les contrôles inversés, la touche DROITE déplace le raquette 
                            // vers la gauche.
                            if (this.shape.x > Constants.BOARD_X) {
                                this.shape.x -= (Constants.PADDLE_VELOCITY * dt);
                            } else {
                                this.shape.x = Constants.BOARD_X;
                            }

                            this.direction = 1;
                        } else {
                            // La touche DROITE permet de déplacer le raquette vers la droite.
                            if (this.shape.x < (Constants.BOARD_X2 - this.shape.w)) {
                                this.shape.x += (Constants.PADDLE_VELOCITY * dt);
                            } else {
                                this.shape.x = (Constants.BOARD_X2 - this.shape.w);
                            }

                            this.direction = 2;
                        }
                    }
                }

                if (Input.keys["KeyAction2"]) {
                    if (this.laserType == Constants.LASER_GREEN && this.ammoLeft > 0 && Ball.launched) {
                        // Le premier chronomètre se lance au début du niveau. Le joueur doit vaincre tous
                        // les ennemis présents dans le niveau avant que ce chronomètre n'atteigne 0. Dès
                        // qu'il atteint 0, la partie est terminée.
                        if (time > this.currentLaserTime) {
                            this.currentLaserTime = (62 + time);
                        
                            // La touche ACTION 2 permet d'effectuer diverses actions, comme par exemple tirer
                            // des lasers si la raquette est équipée.
                            this.shootLasers(this.shape.x + 8, this.shape.y - 8, 0, -1);
                            this.shootLasers(this.shape.x + 16, this.shape.y - 8, 0, -1);

                            // Joue un son.
                            Sound.play(this.sndLaser);

                            // Une munition en moins.
                            this.ammoLeft--;
                            if (this.ammoLeft <= 0) {
                                // La raquette n'a plus de munitions. Elle redevient bleue.
                                this.transform(Constants.PADDLE_BLUE);
                                this.laserType = 0;
                            }
                        }
                    }
                }

                if (this.controlsVertical) {
                    if (Input.keys["KeyUp"]) {
                        if (this.controlsReversed) {
                            // Avec les contrôles inversés, la touche HAUT déplace le raquette 
                            // vers le bas.
                            if (this.shape.y < (Constants.CANVAS_HEIGHT - 24)) {
                                this.shape.y += (Constants.PADDLE_VELOCITY * dt);
                            } else {
                                this.shape.y = (Constants.CANVAS_HEIGHT - 24);
                            }
                        } else {
                            // La touche HAUT permet de déplacer la raquette vers le haut.
                            if (this.shape.y > (Constants.CANVAS_HEIGHT - 80)) {
                                this.shape.y -= (Constants.PADDLE_VELOCITY * dt);
                            } else {
                                this.shape.y = (Constants.CANVAS_HEIGHT - 80);
                            }
                        }
                    }

                    if (Input.keys["KeyDown"]) {
                        if (this.controlsReversed) {
                            // Avec les contrôles inversés, la touche BAS déplace le raquette 
                            // vers le haut.
                            if (this.shape.y > (Constants.CANVAS_HEIGHT - 80)) {
                                this.shape.y -= (Constants.PADDLE_VELOCITY * dt);
                            } else {
                                this.shape.y = (Constants.CANVAS_HEIGHT - 80);
                            }
                        } else {
                            // La touche BAS permet de déplacer la raquette vers le bas.
                            if (this.shape.y < (Constants.CANVAS_HEIGHT - 24)) {
                                this.shape.y += (Constants.PADDLE_VELOCITY * dt);
                            } else {
                                this.shape.y = (Constants.CANVAS_HEIGHT - 24);
                            }
                        }
                    }
                }

                if (Input.isKeyPressed("KeyAction2")) {
                    if (Ball.launched) {
                        if (this.laserType != Constants.LASER_GREEN && this.ammoLeft > 0) {
                            // La touche ACTION 2 permet d'effectuer diverses actions, comme par exemple tirer
                            // des lasers si la raquette est équipée.
                            this.shootLasers(this.shape.x + 8, this.shape.y - 8, 0, -1);
                            this.shootLasers(this.shape.x + 16, this.shape.y - 8, 0, -1);

                            if (this.laserType == Constants.LASER_YELLOW) {
                                this.shootLasers(this.shape.x + 8, this.shape.y - 8, -0.5, -1);
                                this.shootLasers(this.shape.x + 16, this.shape.y - 8, 0.5, -1);
                            }

                            // Joue un son.
                            Sound.play(this.sndLaser);

                            // Une munition en moins.
                            this.ammoLeft--;
                            if (this.ammoLeft <= 0) {
                                // La raquette n'a plus de munitions. Elle redevient bleue.
                                this.transform(Constants.PADDLE_BLUE);
                                this.laserType = 0;
                            }
                        }

                        if (Ball.glued) {
                            // La touche ESPACE permet de lancer la balle. Si la touche GAUCHE ou DROITE
                            // est pressée en même temps que la touche ESPACE, cela lancera la balle dans la
                            // direction choisie.
                            if (Input.keys["KeyLeft"]) {
                                // Lance la balle à gauche.
                                Ball.launchGlued(1);
                            } else if (Input.keys["KeyRight"]) {
                                // Lance la balle à droite.
                                Ball.launchGlued(2);
                            } else {
                                // La direction sera choisit au hasard.
                                Ball.launchGlued(0);
                            }
                        }
                    }
                }

                if (Input.isKeyPressed("KeyAction1")) {
                    if (!Ball.launched) {
                        // La touche ACTION 1 permet de lancer la balle. Si la touche GAUCHE ou DROITE
                        // est pressée en même temps que la touche ACTION 1, cela lancera la balle dans la
                        // direction choisie.
                        if (Input.keys["KeyLeft"]) {
                            // Lance la balle à gauche.
                            Ball.launch(1);

                            // Joue un son.
                            Sound.play(this.sndSelect);
                        } else if (Input.keys["KeyRight"]) {
                            // Lance la balle à droite.
                            Ball.launch(2);

                            // Joue un son.
                            Sound.play(this.sndSelect);
                        } else {
                            // La direction sera choisit selon la dernière direction de la raquette.
                            Ball.launch(this.direction);

                            // Joue un son.
                            Sound.play(this.sndSelect);
                        }
                    }
                }
            }

            if (this.shape2.enabled) {
                // Gère la position de la deuxième raquette. Celle-ci est située à droite de la première
                // raquette, en laissant un espace entre les deux.
                this.shape2.x = (this.shape.x + this.shape.w + this.spacing);
                this.shape2.y = this.shape.y;
            }
        }

        // Gestion des lasers
        // ==================

        for (let idx in this.lasers) {
            if (!this.lasers[idx].destroyed) {
                // Déplacement du laser
                // --------------------

                // Applique les paramètres de vélocité du laser sur sa position.
                this.lasers[idx].x += this.lasers[idx].vx;
                this.lasers[idx].y += this.lasers[idx].vy;

                // Gestion des collisions
                // ----------------------

                // Si le laser atteint les bords de l'aire de jeu, il est tout simplement détruit.
                if (this.lasers[idx].x < Constants.BOARD_X) {
                    this.lasers[idx].destroyed = true;
                } else if (this.lasers[idx].x > (Constants.BOARD_X2 - 8)) {
                    this.lasers[idx].destroyed = true;
                } else if (this.lasers[idx].y < Constants.BOARD_Y) {
                    this.lasers[idx].destroyed = true;

                    if (this.lasers[idx].type == Constants.LASER_MAGENTA) {
                        // Le laser rose repart simplement dans l'autre sens.
                        let i = Utils.randomBetween(1, 2);
                        this.shootLasers(this.lasers[idx].x, this.lasers[idx].y, (i == 1 ? -0.25 : 0.25), 1);
                    }
                } else if (this.lasers[idx].y > (Constants.CANVAS_HEIGHT + 8)) {
                    this.lasers[idx].destroyed = true;
                }

                if (!this.destroying) {
                    // Gère les collisions entre un laser et la raquette.
                    let collision = Utils.checkCollision(this.lasers[idx], this.shape);
                    if (collision.direction != "none") {
                        // La raquette est détruite.
                        this.lose2();
                    } else {
                        if (this.shape2.enabled) {
                            let collision = Utils.checkCollision(this.lasers[idx], this.shape2);
                            if (collision.direction == "on") {
                                // La raquette est détruite.
                                this.lose2();
                            }
                        }
                    }
                }

                // Gère les collisions entre la balle et les briques.
                for (let y = 0; y < Constants.BOARD_LINES; y++) {
                    for (let x = 0; x < Constants.BOARD_COLUMNS; x++) {
                        let brick = Stage.bricks[y][x];
                        if (brick) {
                            if (brick.state) {
                                let destroyed = false, ignore = false;
                                let collision = Utils.checkCollision(this.lasers[idx], brick);

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
                                        if (this.lasers[idx].type != Constants.LASER_RED) {
                                            // La collision à eu lieu sur la brique. Le laser est détruit.
                                            this.lasers[idx].destroyed = true;
                                        }

                                        if (!brick.solid) {
                                            // La brique est détruite.
                                            Stage.bricks[y][x].state = 0;
                                            destroyed = true;
                                        } else if (brick.solid && this.lasers[idx].type == Constants.LASER_RED) {
                                            // Le bloc solide est détruit.
                                            Stage.bricks[y][x].state = 0;
                                            destroyed = true;

                                            // Et le laser aussi.
                                            this.lasers[idx].destroyed = true;
                                        }
                                    } else if (collision.direction == "under") {
                                        if (this.lasers[idx].type != Constants.LASER_RED) {
                                            // La collision à eu lieu sous la brique. Le laser est détruit.
                                            this.lasers[idx].destroyed = true;
                                        }

                                        if (!brick.solid) {
                                            // La brique est détruite.
                                            Stage.bricks[y][x].state = 0;
                                            destroyed = true;
                                        } else if (brick.solid && this.lasers[idx].type == Constants.LASER_RED) {
                                            // Le bloc solide est détruit.
                                            Stage.bricks[y][x].state = 0;
                                            destroyed = true;

                                            // Et le laser aussi.
                                            this.lasers[idx].destroyed = true;
                                        }
                                    } else if (collision.direction == "left" || collision.direction == "right") {
                                        if (this.lasers[idx].type != Constants.LASER_RED) {
                                            // La collision à eu lieu sur un des côtés de la brique. Le laser est détruit.
                                            this.lasers[idx].destroyed = true;
                                        } else if (brick.solid && this.lasers[idx].type == Constants.LASER_RED) {
                                            // Le bloc solide est détruit.
                                            Stage.bricks[y][x].state = 0;
                                            destroyed = true;

                                            // Et le laser aussi.
                                            this.lasers[idx].destroyed = true;
                                        }

                                        if (!brick.solid) {
                                            // La brique est détruite.
                                            Stage.bricks[y][x].state = 0;
                                            destroyed = true;
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
                                    Sound.play(this.sndLaserHit);

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

                                    if (this.lasers[idx].type == Constants.LASER_CYAN) {
                                        // Le laser cyan explose au contact de la brique.
                                        Effect.createExplosion(this.lasers[idx].x, this.lasers[idx].y, this.lasers[idx].type);

                                        // Fait scintiller l'arrière-plan.
                                        Effect.twinkle();

                                        // Détruit les briques aux alentours.
                                        Stage.deleteBricksAround(x, y);
                                    }

                                    if (this.lasers[idx].type == Constants.LASER_MAGENTA) {
                                        // Le laser rose repart simplement dans l'autre sens.
                                        let i = Utils.randomBetween(1, 2);
                                        this.shootLasers(this.lasers[idx].x, this.lasers[idx].y, (i == 1 ? -0.25 : 0.25), 1);
                                    }

                                    if (Stage.bricksLeft <= 0) {
                                        // Fait disparaître progressivement la raquette.
                                        this.closeDown();

                                        setTimeout(function() {
                                            // Toutes les briques ont été détruites. On passe au niveau
                                            // suivant.
                                            Stage.finished = true;
                                            Stage.remainingTime = Stage.time;
                                        }, 1000);
                                    } else {
                                        if (brick.color == Constants.BRICK_QUESTION) {
                                            // Une brique surprise libère tout le temps une capsule.
                                            Capsule.create(brick.x, brick.y);
                                        } else if (brick.color == Constants.BRICK_TNT) {
                                            // Une brique explosive... explose tout simplement !
                                            Effect.createExplosion(brick.x, brick.y, Constants.BRICK_RED);

                                            // Fait scintiller l'arrière-plan.
                                            Effect.twinkle();

                                            // Fait trembler l'aire de jeu.
                                            Effect.shake();

                                            // Détruit les briques aux alentours.
                                            Stage.deleteBricksAround(x, y);
                                        } else if (brick.color == Constants.BRICK_POW) {
                                            // Détruit quelques briques présentes dans l'aire de jeu.
                                            Stage.deleteSomeBricks();

                                            // Fait trembler l'aire de jeu.
                                            Effect.shake();
                                        } else {
                                            // Détermine si l'on doit créer une capsule.
                                            let i = Utils.randomBetween(1, 20);
                                            if (i == 1) {
                                                // Créé une capsule.
                                                Capsule.create(brick.x, brick.y);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Retire les lasers qui sont sortis de l'écran.
        this.lasers = this.lasers.filter((laser) => !laser.destroyed);
    },
    shootLasers: function(x, y, vx, vy) {
        // Créé un laser. Celui-ci va se déplacer vers la gauche ou vers la droite, en
        // fonction de la direction du joueur.
        this.lasers.push({
            x: x,
            y: y,
            vx: (Constants.LASER_VELOCITY * vx),
            vy: (Constants.LASER_VELOCITY * vy),
            w: 8,
            h: 8,
            type: this.laserType,
            destroyed: false,
        });
    },
    chooseLaserType: function() {
        let i = Utils.randomBetween(1, 16);
        if (i == 1) {
            // Les lasers seront rouges. Les munitions sont limitées à 30 tirs. 
            this.laserType = Constants.LASER_RED;
            this.ammoLeft = 30;
        } else if (i == 2) {
            // Les lasers seront vertes. Les munitions sont limitées à 50 tirs. 
            this.laserType = Constants.LASER_GREEN;
            this.ammoLeft = 50;
        } else if (i == 3) {
            // Les lasers seront jaunes. Les munitions sont limitées à 30 tirs. 
            this.laserType = Constants.LASER_YELLOW;
            this.ammoLeft = 30;
        } else if (i == 4) {
            // Les lasers seront cyans. Les munitions sont limitées à 10 tirs. 
            this.laserType = Constants.LASER_CYAN;
            this.ammoLeft = 10;
        } else if (i == 5) {
            // Les lasers seront roses. Les munitions sont limitées à 30 tirs. 
            this.laserType = Constants.LASER_MAGENTA;
            this.ammoLeft = 30;
        } else {
            // Les lasers seront bleus. Les munitions sont limitées à 50 tirs. 
            this.laserType = Constants.LASER_BLUE;
            this.ammoLeft = 50;
        }
    }
})
