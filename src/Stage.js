import Ball from "@/Ball.js";
import Capsule from "@/Capsule.js";
import Constants from "@/Constants.js";
import Effect from "@/Effect.js";
import Graphics from "@/Graphics.js";
import Paddle from "@/Paddle.js";
import Sound from "@/Sound.js";
import Storage from "@/Storage.js";
import Utils from "@/Utils.js";

import sprBoard from "@assets/img/board.png";
import sprBricks from "@assets/img/bricks.png";

import sndTimeCount from "@assets/snd/timecount.ogg";
import sndReady from "@assets/snd/ready.ogg";

export default ({
    // Variables
    // =========

    imgBoard: null,
    imgBricks: null,

    sndTimeCount: null,
    sndReady: null,

    bricks: [],
    bricksLeft: 0,
    nr: 0,
    score: 0,
    highScore: 0,
    time: 0,
    timePenalty: 5,

    messageDisplayed: false,
    playable: false,
    finished: false,
    currentTime: 0,
    currentScoreTime: 0,
    readyToGoNext: false,
    starBlockState: 1,
    testMode: false,

    remainingTime: 0,

    // Fonctions
    // =========

    async init() {
        // Chargement des ressources.
        this.imgBoard = await Graphics.loadAsset(sprBoard);
        this.imgBricks = await Graphics.loadAsset(sprBricks);

        this.sndTimeCount = await Sound.loadAsset(sndTimeCount);
        this.sndReady = await Sound.loadAsset(sndReady);

        // Chargement du meilleur score.
        this.highScore = 0;
        if (Storage.exists("hiscore")) {
            this.highScore = Storage.read("hiscore");
            if (this.highScore > Constants.MAX_SCORE) {
                this.highScore = Constants.MAX_SCORE;
            }
        }
    },
    destroy() {
        // Efface le niveau.
        this.bricks = [];
        this.score = 0;
        this.bricksLeft = 0;
        this.playable = false;
        this.finished = false;
        this.readyToGoNext = false;
    },
    start(nr = 1) {
        // La partie démarre au niveau 1.
        this.number = nr;
        this.finished = false;
        this.readyToGoNext = false;
        this.starBlockState = 1;

        // Réinitialise le score à 0.
        this.score = 0;

        // Initialise le chronomètre.
        this.time = this.stageTimeData[this.number - 1];

        // Chargement du niveau.
        this.load();

        // Prévient le joueur de se tenir prêt à jouer.
        this.messageDisplayed = true;
        this.playable = false;
        setTimeout(function() {
            this.messageDisplayed = false;
            this.playable = true;
        }.bind(this), 1000);
    },
    next() {
        // On passe au niveau suivant.
        this.number += 1;
        this.finished = false;
        this.readyToGoNext = false;
        this.starBlockState = 1;

        if (this.number > Constants.MAX_STAGES) {
            this.number = 1;
        }

        // Initialise le chronomètre.
        this.time = this.stageTimeData[this.number - 1];

        // Chargement du niveau.
        this.load();

        // Prévient le joueur de se tenir prêt à jouer.
        this.messageDisplayed = true;
        this.playable = false;
        setTimeout(function() {
            this.messageDisplayed = false;
            this.playable = true;
        }.bind(this), 1000);
    },
    load() {
        this.bricksLeft = 0;
        this.bricks = [];

        // Les données de chaque niveau sont stockés sous forme d'un tableau de chaînes 
        // de caractères. Une ligne de texte correspond à une ligne de briques. On calcule
        // l'index de départ dans le tableau à partir du numéro du niveau.
        let idx = ((this.number - 1) * 10);

        // Initialisation du mur de briques.
        for (let y = 0; y < Constants.BOARD_LINES; y++) {
            // Récupère la prochaine ligne de briques à créer.
            let line = this.stageData[idx];

            this.bricks[y] = [];
            for (let x = 0; x < Constants.BOARD_COLUMNS; x++) {
                // Détermine la brique à créer.
                let brick = line.charAt(x);
                let color = 0, solid = false, starColor = 0;

                switch (brick) {
                    case 'A': {
                        // Brique bleue.
                        color = Constants.BRICK_BLUE;

                        break;
                    }

                    case 'B': {
                        // Brique cyan.
                        color = Constants.BRICK_CYAN;

                        break;
                    }

                    case 'C': {
                        // Brique verte.
                        color = Constants.BRICK_GREEN;

                        break;
                    }

                    case 'D': {
                        // Brique jaune.
                        color = Constants.BRICK_YELLOW;

                        break;
                    }

                    case 'E': {
                        // Brique rouge.
                        color = Constants.BRICK_RED;

                        break;
                    }

                    case 'F': {
                        // Brique magneta.
                        color = Constants.BRICK_MAGENTA;

                        break;
                    }

                    case 'G': {
                        // Brique violette.
                        color = Constants.BRICK_PURPLE;

                        break;
                    }

                    case 'H': {
                        // Brique bleu ciel.
                        color = Constants.BRICK_AZUR;

                        break;
                    }

                    case 'I': {
                        // Brique sarcelle.
                        color = Constants.BRICK_TEAL;

                        break;
                    }

                    case 'J': {
                        // Brique orange.
                        color = Constants.BRICK_ORANGE;

                        break;
                    }

                    case 'K': {
                        // Bloc solide.
                        color = Constants.BLOCK_SOLID;
                        solid = true;

                        break;
                    }

                    case 'L': {
                        // Brique de puissance.
                        color = Constants.BRICK_POW;

                        break;
                    }

                    case 'M': {
                        // Brique explosive.
                        color = Constants.BRICK_TNT;

                        break;
                    }

                    case 'N': {
                        // Brique standard. La couleur est choisi au hasard.
                        color = Utils.randomBetween(Constants.BRICK_BLUE, Constants.BRICK_MAGENTA);

                        break;
                    }

                    case 'O': {
                        // Brique standard. La couleur est choisi au hasard.
                        color = Utils.randomBetween(Constants.BRICK_BLUE, Constants.BRICK_ORANGE);

                        break;
                    }

                    case 'P': {
                        // Brique mystère.
                        color = Constants.BRICK_MYSTERY;

                        break;
                    }

                    case 'Q': {
                        // Bloc mystère solide.
                        color = Constants.BRICK_MYSTERY;
                        solid = true;

                        break;
                    }

                    case 'R': {
                        // Bloc étoile.
                        color = Constants.BLOCK_STAR_BLUE;
                        solid = true;

                        break;
                    }

                    case 'S': {
                        // Brique étoile bleue.
                        color = Constants.BRICK_STAR_BLUE;
                        starColor = 1;

                        break;
                    }

                    case 'T': {
                        // Brique étoile jaune.
                        color = Constants.BRICK_STAR_YELLOW;
                        starColor = 2;

                        break;
                    }

                    case 'U': {
                        // Brique étoile rouge.
                        color = Constants.BRICK_STAR_RED;
                        starColor = 3;

                        break;
                    }

                    case 'V': {
                        // Brique regénératrice.
                        color = Constants.BRICK_REGENERATE;

                        break;
                    }

                    case '.': {
                        // Brique cachée.
                        color = Constants.BRICK_HIDDEN;
                        solid = true;

                        break;
                    }

                    case '-': {
                        // Bloc cachée.
                        color = Constants.BLOCK_HIDDEN;
                        solid = true;

                        break;
                    }

                    case '1': {
                        // Brique numérotée 1.
                        color = Constants.BRICK_1;

                        break;
                    }

                    case '2': {
                        // Brique numérotée 2.
                        color = Constants.BRICK_2;

                        break;
                    }

                    case '3': {
                        // Brique numérotée 3.
                        color = Constants.BRICK_3;

                        break;
                    }

                    case '4': {
                        // Brique numérotée 4.
                        color = Constants.BRICK_4;

                        break;
                    }

                    case '5': {
                        // Brique numérotée 5.
                        color = Constants.BRICK_5;

                        break;
                    }

                    case '?': {
                        // Brique surprise.
                        color = Constants.BRICK_QUESTION;

                        break;
                    }

                    default: {
                        break;
                    }
                }
                
                if (color) {
                    // Créé la brique.
                    this.bricks[y][x] = {
                        x: (x * 16) + Constants.BOARD_X,
                        y: (y * 8) + Constants.BOARD_Y + 16,
                        w: 16,
                        h: 8,
                        color: color,
                        solid: solid,
                        starColor: starColor,
                        state: 1,
                        timer: 0,
                    };

                    if (!solid) {
                        // On compte le nombre de briques à détruire pour finir le niveau.
                        this.bricksLeft++;
                    }
                }
            }

            idx++;
        }
    },
    deleteSomeBricks() {
        // Détruit quelques briques présentes dans l'aire de jeu.
        for (let y = 0; y < Constants.BOARD_LINES; y++) {
            for (let x = 0; x < Constants.BOARD_COLUMNS; x++) {
                let brick = this.bricks[y][x];
                if (brick) {
                    if (brick.state && !brick.solid) {
                        let i = Utils.randomBetween(1, 4);
                        if (i == 1) {
                            // La brique est détruite.
                            this.bricks[y][x].state = 0;

                            // Ajoute 5 points au score.
                            this.score += 5;
                            if (this.score > Constants.MAX_SCORE) {
                                this.score = Constants.MAX_SCORE;
                            }

                            // Et une brique en moins !
                            this.bricksLeft -= 1;

                            // La brique saute et disparaît de l'aire de jeu.
                            let i = Utils.randomBetween(1, 2);
                            Effect.createBrick(brick.x, brick.y, (i == 1 ? -1 : 1), -2, brick.color);

                            if (this.bricksLeft <= 0) {
                                // Fait disparaître progressivement la raquette.
                                Paddle.closeDown();

                                setTimeout(function() {
                                    // Toutes les briques ont été détruites. On passe au niveau
                                    // suivant.
                                    this.finished = true;
                                    this.remainingTime = this.time;
                                }, 1000);
                            }
                        }
                    }
                }
            }
        }
    },
    deleteBricksAround(x, y) {
        // Détruit les briques aux alentours.
        for (let x2 = (x - 1); x2 <= (x + 1); x2++) {
            for (let y2 = (y - 1); y2 <= (y + 1); y2++) {
                if (x2 >= 0 && x2 <= 9 && y2 >= 0 && y2 <= 9) {
                    if (this.bricks[y2][x2] && this.bricks[y2][x2].state == 1) {
                        if (x2 != x && y2 != y) {
                            // La brique est détruite.
                            this.bricks[y2][x2].state = 0;

                            // Et une brique en moins !
                            this.bricksLeft -= 1;

                            let brick = this.bricks[y2][x2];
                            if (brick.color >= Constants.BRICK_BLUE && brick.color <= Constants.BLOCK_SOLID) {
                                // La brique explose en plusieurs petits morceaux.
                                Effect.createRumble(brick.x, brick.y, -1, -1.5, brick.color);
                                Effect.createRumble(brick.x + 8, brick.y, -0.5, -2, brick.color);
                                Effect.createRumble(brick.x + brick.w - 16, brick.y, 0.5, -2, brick.color);
                                Effect.createRumble(brick.x + brick.w - 8, brick.y, 1, -1.5, brick.color);
                            } else {
                                // La brique saute et disparaît de l'aire de jeu.
                                let i = Utils.randomBetween(1, 2);
                                Effect.createBrick(brick.x, brick.y, (i == 1 ? -1 : 1), -2, brick.color);
                            }
                        }
                    }
                }
            }
        }
    }, 
    draw(dt) {
        // Dessine les limites de l'aire de jeu.
        Graphics.drawImage(this.imgBoard, (Constants.BOARD_X - 8), (Constants.BOARD_Y - 8));

        if (this.number > 0) {
            // Dessine le mur de briques.
            for (let y = 0; y < Constants.BOARD_LINES; y++) {
                for (let x = 0; x < Constants.BOARD_COLUMNS; x++) {
                    let brick = this.bricks[y][x];
                    if (brick) {
                        if (brick.state === 1 && brick.color != Constants.BRICK_HIDDEN) {
                            // Détermine le sprite à dessiner selon la couleur de la brique.
                            let sy = (brick.color - 1) * 8;

                            if (brick.color == Constants.BLOCK_STAR_BLUE) {
                                if (this.starBlockState == 2) {
                                    sy += 8;
                                } else if (this.starBlockState == 3) {
                                    sy += 16;
                                } 
                            }

                            if (brick.starColor == this.starBlockState) {
                                if (brick.starColor == 1) {
                                    sy = 0;
                                } else if (brick.starColor == 2) {
                                    sy = 24;
                                } else if (brick.starColor == 3) {
                                    sy = 32;
                                }
                            }

                            // Dessine la brique.
                            Graphics.drawImagePart(this.imgBricks, brick.x, brick.y, 0, sy, brick.w, brick.h);
                        }
                    }
                }
            }

            if (this.messageDisplayed) {
                // Affiche un message à l'écran demandant au joueur de se tenir prêt.
                Graphics.drawString(8, 14, "STAGE " + this.number);
                Graphics.drawString(7, 16, "GET READY! ");
            }

            /*if (this.readyToGoNext) {
                // Affiche un message à l'écran indiquant au joueur qu'il peut presser une touche
                // pour passer au niveau suivant.
                Graphics.drawString(7, 19, "PRESS space");
                Graphics.drawString(7, 20, "TO CONTINUE");
            }*/
        }
    },
    update(dt) {
        // Gestion du chronomètre
        // ----------------------

        let time = window.performance.now();

        // Le premier chronomètre se lance au début du niveau. Le joueur doit vaincre tous
        // les ennemis présents dans le niveau avant que ce chronomètre n'atteigne 0. Dès
        // qu'il atteint 0, la partie est terminée.
        if (time > this.currentTime) {
            this.currentTime = (1000 + time);
            
            if (this.playable && !this.finished && Ball.launched) {
                if (this.time > 0) {
                    // Décrémente le compteur.
                    this.time -= 1;

                    if (this.time === 0) {
                        // Si le compteur à atteint 0, la partie est terminée.
                        Paddle.lose(true);
                    } else {
                        // Gère le chronomètre des briques régénératrices. Dès que ce chronomètre atteint 0,
                        // la brique se régénère et il faudra de nouveau frapper la brique avec la balle pour 
                        // pouvoir passer au niveau suivant.
                        for (let y = 0; y < Constants.BOARD_LINES; y++) {
                            for (let x = 0; x < Constants.BOARD_COLUMNS; x++) {
                                if (this.bricks[y][x] && this.bricks[y][x].color == Constants.BRICK_REGENERATE && this.bricks[y][x].timer > 0) {
                                    this.bricks[y][x].timer--;
                                    if (this.bricks[y][x].timer == 0) {
                                        // La brique se régénère.
                                        this.bricks[y][x].state = 1;
                                        this.bricksLeft++;

                                        // Créé une animation.
                                        Effect.createExplosion(this.bricks[y][x].x, this.bricks[y][x].y, Constants.SPARK_MAGENTA);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Gestion du décompte du temps restant à la fin du niveau
        // -------------------------------------------------------

        // Quand le joueur a détruit toutes les briques dans le niveau, un décompte du nombre
        // de secondes restantes au chronomètre est effectué. Le joueur gagne 10 points par
        // seconde restante (100 points sur le dernier niveau).
        if (time > this.currentScoreTime) {
            this.currentScoreTime = (32 + time);
            
            if (this.time > 0 && this.finished) {
                // Décrémente le compteur.
                this.time -= 1;

                if (this.number == Constants.MAX_STAGES) {
                    // Incrémente le score de 100 points.
                    this.score += 100;
                } else {
                    // Incrémente le score de 10 points.
                    this.score += 10;
                }

                if (this.time == 0) {
                    // Le décompte a été fait, le joueur peut passer au niveau suivant.
                    this.readyToGoNext = true;

                    // Joue un son.
                    Sound.play(this.sndReady);

                    if (this.number >= Constants.MAX_STAGES) {
                        // Détermine le meilleur score.
                        if (this.score > this.highScore) {
                            this.highScore = this.score;
                        }

                        // Sauvegarde le meilleur score dans le stockage local.
                        Storage.write("hiscore", this.highScore);
                    }
                } else {
                    // Joue un son.
                    Sound.play(this.sndTimeCount);
                }
            }
        }
    },

    // Niveaux
    // =======

    stageData: [
        // Niveau 1
        // --------

        "          ",
        "  AABBAA  ",
        "          ",
        "BB  CC  BB",
        "          ",
        " EEE  EEE ",
        "          ",
        "A DD  DD A",
        "          ",
        "   CFFC   ",

        // Niveau 2
        // --------

        "DDDDDDD II",
        "          ",
        "DDDDD II B",
        "          ",
        "DDD II BBB",
        "          ",
        "D II BBBBB",
        "          ",
        "II BBBBBBB",
        "          ",

        // Niveau 3
        // --------

        "          ",
        " ABA  ABA ",
        "          ",
        " A 2BB2 A ",
        "          ",
        " BA 22 AB ",
        "          ",
        " C  AA  C ",
        "          ",
        "          ",

        // Niveau 4
        // --------

        "   AGGA   ",
        "          ",
        " AGGEEGGA ",
        "          ",
        "GGEEBBEEGG",
        "          ",
        " AGGEEGGA ",
        "          ",
        "   AGGA   ",
        "          ",

        // Niveau 5
        // --------

        "          ",
        "AA        ",
        "  AA      ",
        "BB  AA    ",
        "CCCC  AA  ",
        "DDDDDD  AA",
        "EEEEEEEE  ",
        "KKKKKKKKFF",
        "          ",
        "          ",

        // Niveau 6
        // --------

        "EE D  D EE",
        " D  JJ  D ",
        "  3EJJE3  ",
        "DD J  J DD",
        "  J    J  ",
        "JJ 3DD3 JJ",
        "  E    E  ",
        "D3  EE  3D",
        "   JDDJ   ",
        " DD EE DD ",

        // Niveau 7
        // --------

        "          ",
        " KKKK FFF ",
        " KBB   FF ",
        " KB   F F ",
        " K   F    ",
        "    F   K ",
        " F F   BK ",
        " FF   BBK ",
        " FFF KKKK ",
        "          ",

        // Niveau 8
        // --------

        "E        E",
        " E      E ",
        "D E    E D",
        "CD E  E DC",
        "BCD EE DCB",
        "ABCD  DCBA",
        " ABCDDCBA ",
        "  ABCCBA  ",
        "   ABBA   ",
        "    AA    ",

        // Niveau 9
        // --------

        "BBB A A   ",
        "BB      E ",
        "B  C   E  ",
        "  C DDE  F",
        "F  D33D   ",
        "   D33D  F",
        "F  EDD C  ",
        "  E   C  B",
        " E      BB",
        "   A A BBB",

        // Niveau 10
        // ---------

        "          ",
        "  ABAABA  ",
        "          ",
        " AB AA BA ",
        "          ",
        "B ABBBBA B",
        "          ",
        "  L AA L  ",
        "          ",
        "   BBBB   ",

        // Niveau 11
        // ---------

        "    AA    ",
        "C BB  BB C",
        " B      B ",
        "B A EE A B",
        " F      F ",
        " F      F ",
        "B A EE A B",
        " B      B ",
        "C BB  BB C",
        "    AA    ",

        // Niveau 12
        // ---------

        " F      F ",
        "FJF 33 FJF",
        " F      F ",
        "    EE    ",
        " 3 ECCE 3 ",
        " 3 ECCE 3 ",
        "    EE    ",
        " F      F ",
        "FJF 33 FJF",
        " F      F ",

        // Niveau 13
        // ---------

        "3        3",
        " 3  DD  3 ",
        "  3DEED3  ",
        "  D3CC3D  ",
        " DEC  CED ",
        " DEC  CED ",
        "  D3CC3D  ",
        "  3DEED3  ",
        " 3  DD  3 ",
        "3        3",

        // Niveau 14
        // ---------

        "          ",
        "    CC    ",
        "   CHHC   ",
        "    CC    ",
        "   AAAA   ",
        "  A AA A  ",
        "  C AA C  ",
        "   DDDD   ",
        "   D  D   ",
        "  BB  BB  ",

        // Niveau 15
        // ---------

        "?        ?",
        "  DCEECD  ",
        "3        3",
        "   DCCD   ",
        "CC      CC",
        "    DD    ",
        "2CC    CC2",
        "          ",
        "CC2C  C2CC",
        "          ",

        // Niveau 16
        // ---------

        "  E3C3E3  ",
        " C3E3C3E3 ",
        " 3C    3E ",
        "       C3 ",
        "    C3E3  ",
        "    3C3E  ",
        "       3E ",
        " E3    C3 ",
        " 3E3C3E3C ",
        "  3E3C3E  ",

        // Niveau 17
        // ---------

        "    EE    ",
        " BB    BB ",
        "B  J  J  B",
        " E  GG  E ",
        "G A    A G",
        " E  GG  E ",
        "B  J  J  B",
        " BB    BB ",
        "    EE    ",
        "          ",

        // Niveau 18
        // ---------

        "  D       ",
        " DED      ",
        "DEMED     ",
        " DEK AAA  ",
        "  D KBBAA ",
        "   ABAAAAA",
        "   ABAAAAA",
        "   AAAAAAA",
        "    AAAAA ",
        "     AAA  ",

        // Niveau 19
        // ---------

        "    BB    ",
        "T C    C T",
        " U  BB  U ",
        "C R    R C",
        " B FSSF B ",
        " B FSSF B ",
        "C R    R C",
        " U  BB  U ",
        "T C    C T",
        "    BB    ",

        // Niveau 20
        // ---------

        " F   F    ",
        "FEE FEE   ",
        "FEEEEEE   ",
        "EEEEEEE   ",
        " EEEEE    ",
        " EEEEEB B ",
        "  EEEBAAAA",
        "   E AAAAA",
        "      AAA ",
        "       A  ",

        // Niveau 21
        // ---------

        "B  A  D  B",
        "  A CC D  ",
        " A  --  D ",
        "A  E  E  D",
        " C  FF  C ",
        " C  FF  C ",
        "D  E  E  A",
        " D  --  A ",
        "  D CC A  ",
        "B  D  A  B",

        // Niveau 22
        // ---------

        "AAAA  AAAA",
        "GGG GG GGG",
        "BB BBBB BB",
        "C CCCCCC C",
        " EEEEEEEE ",
        "D DDDDDD D",
        "FF FFFF FF",
        "  L    L  ",
        "          ",
        "          ",

        // Niveau 23
        // ---------

        "  AA?AAA  ",
        " AAAAAAA? ",
        " ?AA  AAA ",
        "      AAA ",
        "     ?AA  ",
        "    AAA   ",
        "   AAA    ",
        "          ",
        "   AAA    ",
        "   A?A    ",

        // Niveau 24
        // ---------

        "          ",
        "          ",
        "PPPQQQQPPP",
        "          ",
        "QPPPPPPPPQ",
        "          ",
        "PPPPQQPPPP",
        "          ",
        "QQQPPPPQQQ",
        "          ",

        // Niveau 25
        // ---------

        "A  E  E  A",
        "  D RR D  ",
        " UUF  FUU ",
        "F  U  U  F",
        "TC  AA  CS",
        " T  DD  S ",
        "  TFFFFS  ",
        "B  T  S  B",
        "  E DD E  ",
        "CCC    CCC",

        // Niveau 26
        // ---------

        "FFFL--LFFF",
        "AA F  F AA",
        "A  F  F  A",
        "FBBAAAABBF",
        "B---AA---B",
        "B FFFFFF B",
        "A FLAALF A",
        "  FA--AF  ",
        "FAAB  BAAF",
        "   B  B   ",

        // Niveau 27
        // ---------

        "          ",
        "   ....   ",
        "          ",
        " EC .. CE ",
        "          ",
        "..      ..",
        "          ",
        " CE .. EC ",
        "          ",
        "   ....   ",

        // Niveau 28
        // ---------

        "          ",
        "TTT    TTT",
        "SSSR  RSSS",
        "UUU    UUU",
        "          ",
        "          ",
        "          ",
        "          ",
        "          ",
        "          ",

        // Niveau 29
        // ---------

        "  F FF F  ",
        " F GGGG F ",
        "  E    E  ",
        "G  GSSG  G",
        " A S55S A ",
        " A S55S A ",
        "G  GSSG  G",
        "  E    E  ",
        " F GGGG F ",
        "  F FF F  ",

        // Niveau 30
        // ---------

        " 5E5C5E5C ",
        " C5E5C5E5 ",
        " 5C    5E ",
        " E5       ",
        " 5E5C5E5  ",
        "  5E5C5E5 ",
        "       5E ",
        " E5    C5 ",
        " 5E5C5E5C ",
        "  5E5C5E  ",

        // Niveau 31
        // ---------

        "          ",
        "   FFFF   ",
        "  V    F  ",
        "     FFVFF",
        "      VFV ",
        "  F    F  ",
        " VFV      ",
        "FFVFF     ",
        "  F    V  ",
        "   FFFF   ",

        // Niveau 32
        // ---------

        "    RR    ",
        "  R    R  ",
        " R  SS  R ",
        "   T  T   ",
        "R U ST U R",
        "R U TS U R",
        "   T  T   ",
        " R  SS  R ",
        "  R    R  ",
        "    RR    ",

        // Niveau vierge
        // -------------

        "          ",
        "          ",
        "          ",
        "          ",
        "          ",
        "          ",
        "          ",
        "          ",
        "          ",
        "          ",
    ],

    // Tableaux des temps.
    stageTimeData: [
        // Niveaux 1 à 8.
        90,
        120,
        120,
        150,
        150,
        120,
        120,
        120,

        // Niveaux 9 à 16.
        150,
        90,
        120,
        180,
        180,
        90,
        150,
        180,

        // Niveaux 17 à 24.
        90,
        150, 
        180, 
        120,
        120,
        120,
        90,
        210,

        // Niveaux 25 à 32.
        210,
        240, 
        210, 
        180,
        180,
        240,
        270,
        300
    ]
})
