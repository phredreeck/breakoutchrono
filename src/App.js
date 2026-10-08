/* BREAKOUT CHRONO
 * Une variante du casse-briques avec des graphismes pixélisés et des sonorités 8-bit.
 */
import Ball from "@/Ball.js";
import Capsule from "@/Capsule.js";
import Constants from "@/Constants.js";
import Effect from "@/Effect.js";
import Graphics from "@/Graphics.js";
import Input from "@/Input.js";
import Paddle from "@/Paddle.js";
import Sound from "@/Sound.js";
import Stage from "@/Stage.js";
import Storage from "@/Storage.js";
import Utils from "@/Utils.js";

import sprLogo from "@assets/img/breakout.png";

import sndSelect from "@assets/snd/select.ogg";
import sndConfirm from "@assets/snd/confirm.ogg";
import sndGameOver from "@assets/snd/gameover.ogg";
import sndBlock from "@assets/snd/block.ogg";

export default ({
    // Variables
    // =========

    imgLogo: null,

    sndSelect: null,
    sndConfirm: null,
    sndGameOver: null,
    sndBlock: null,

    fpsCounter: 0,
    fps: 0,

    canvas: null,
    lastTime: 0,
    settings: null,
    ready: false,
    screen: 0,
    paused: false,
    currentTime: 0,
    currentBlinkTime: 0,
    blinkState: true,
    debug: false,
    testMode: false,
    mode: "",
    
    currentMenuOption: 1,
    selectedStage: 1,

    // Fonctions
    // =========

    init: async function() {
        this.fps = 0;
        this.fpsCounter = 0;

        document.querySelector('meta[name="theme-color"]').setAttribute("content", "#000000");

        console.log("APP_PLATFORM = ", APP_PLATFORM);

        // Active le mode DEBUG si le jeu est lancé en mode développement via la commande "npm run dev".
        if (APP_MODE == "development") {
            this.debug = true;
        }

        // Récupère le mode d'affichage.
        this.mode = Utils.getDisplayMode();

        // Définition des dimensions du canevas.
        this.updateCanvas();

        // Enregistre une fonction à l'évènement "resize" de la fenêtre qui sera
        // appelée lors du redimensionnement de celle-ci.
        window.addEventListener("resize", (e) => {
            // La taille de la fenêtre a changée, le canevas doit être redimensionné
            // lui aussi.
            this.updateCanvas();
        });

        if (APP_PLATFORM == "webapp") {
            // Enregistre une fonction à l'évènement "fullscreenchange" de la fenêtre qui
            // sera appelée lorsque l'application passe en mode plein écran ou en sort.
            window.addEventListener("fullscreenchange", (e) => {
                // L'application est passé en mode plein écran ou bien en est sortie.
                this.settings.fullScreen = (document.fullscreenElement ? true : false);
            });
        }

        // Initialisation des fonctions graphiques.
        await Graphics.init(this.canvas);

        // Initialisation de la gestion des commandes.
        Input.init();

        // Chargement des ressources.
        this.imgLogo = await Graphics.loadAsset(sprLogo);

        this.sndSelect = await Sound.loadAsset(sndSelect);
        this.sndConfirm = await Sound.loadAsset(sndConfirm);
        this.sndGameOver = await Sound.loadAsset(sndGameOver);
        this.sndBlock = await Sound.loadAsset(sndBlock);

        // Initialisation de la raquette.
        await Paddle.init();

        // Initialisation de la balle.
        await Ball.init();

        // Initialisation de la gestion des capsules.
        await Capsule.init();

        // Initialisation des effets spéciaux.
        await Effect.init();

        // Initialisation du niveau.
        await Stage.init();

        // Chargement des paramètres.
        this.loadSettings();

        // Tout est prêt, on affiche l'écran-titre.
        this.screen = Constants.SCREEN_TITLE;
        this.currentMenuOption = 1;

        // Initialise la boucle qui va s'occuper de l'affichage des sprites et de la gestion
        // de la logique du jeu.
        this.lastTime = window.performance.now();
        window.requestAnimationFrame(function(ts) {
            this.appLoop(ts);
        }.bind(this));
    },
    appLoop: function(ts) {
        window.requestAnimationFrame(function(ts) {
            this.appLoop(ts);
        }.bind(this));

        let dt = (ts - this.lastTime);
        this.lastTime = ts;

        // Appel de la fonction de traitement.
        this.update(dt);

        // Appel de la fonction de dessin.
        this.draw();
    },
    loadSettings: function() {
        // Définit les paramètres par défaut.
        Sound.enabled = true;

        this.settings = {
            sound: true,
            fps: false,
            fullScreen: false,
            keyMap: null,
            buttonMap: null,
        };

        if (Storage.exists("settings")) {
            // Chargement des paramètres stockés dans le stockage local.
            this.settings = Storage.read("settings");

            // On applique les paramètres un à un. Si un des paramètres est
            // manquant, on la définit avec une valeur par défaut.
            if (Object.hasOwn(this.settings, "sound")) {
                Sound.enabled = this.settings.sound;
            } else {
                Sound.enabled = true;
                this.settings.sound = true;
            }
            if (!Object.hasOwn(this.settings, "fps")) {
                this.settings.fps = false;
            }
            if (Object.hasOwn(this.settings, "fullScreen")) {
                if (this.settings.fullScreen) {
                    Graphics.setFullScreen(true);
                }

                // En mode webapp, il n'est pas possible d'initialiser le mode plein écran
                // dès le démarrage de l'application. L'activation du mode plein écran nécessite
                // une action manuelle.
                //this.settings.fullScreen = false;
            } else {
                this.settings.fullScreen = false;
            }

            // Redéfinit les contrôles du clavier et de la manette.
            if (Object.hasOwn(this.settings, "keyMap")) {
                Input.keyMap = this.settings.keyMap;
            }
            if (Object.hasOwn(this.settings, "buttonMap")) {
                Input.buttonMap = this.settings.buttonMap;
            }
        }
    },
    saveSettings: function() {
        // Enregistrement des paramètres.
        this.settings.sound = Sound.enabled;
        this.settings.keyMap = Input.keyMap;
        this.settings.buttonMap = Input.buttonMap;
        Storage.write("settings", this.settings);
    },
    updateCanvas: function() {
        // Récupère les dimensions de la fenêtre.
        let width = window.innerWidth, height = window.innerHeight;
        this.canvas = document.querySelector("#app");

        if (width > height) {
            // Mode paysage.
            this.canvas.style.height = height + "px";
            let ratio = (height / Constants.CANVAS_HEIGHT);
            this.canvas.style.width = (Constants.CANVAS_WIDTH * ratio) + "px";
        } else {
            // Mode portrait.
            this.canvas.style.width = width + "px";
            let ratio = (width / Constants.CANVAS_WIDTH);
            this.canvas.style.height = (Constants.CANVAS_HEIGHT * ratio) + "px";
        }
    },
    startGame: function(nr = 1, testMode = false) {
        // Affiche l'écran du jeu.
        this.screen = Constants.SCREEN_GAME;
        this.paused = false;
        this.testMode = testMode;

        // Fait apparaître à l'écran le message "Soyez prêt".
        Stage.start(nr);

        // Réinitialise la raquette.
        Paddle.reset();

        setTimeout(function() {
            // Fait progressivement apparaître la raquette.
            Paddle.launch();
        }, 500);
    },
    nextStage: function() {
        // On retourne au jeu.
        this.screen = Constants.SCREEN_GAME;
        this.paused = false;

        // On supprime toute donnée en cours.
        Stage.destroy();
        Paddle.destroy();
        Ball.destroy();
        Effect.destroy();

        // On passe au niveau suivant.
        Stage.next();

        setTimeout(function() {
            // Fait progressivement apparaître la raquette.
            Paddle.launch();
        }, 500);
    },
    drawHUD: function(dt) {
        // Affiche le nom du jeu en haut de la colonne de droite.
        Graphics.drawString(25, 1, "BREAKOUT", "normal", "vdblsized");
        Graphics.drawString(26, 3, "CHRONO", "normal", "vdblsized");

        // Affiche le score en cours de partie.
        Graphics.drawString(24, 8, "score");
        Graphics.drawString(26, 9, Utils.padZeros(Stage.score, 8));

        // Affiche le meilleur score.
        Graphics.drawString(24, 11, "high score");
        Graphics.drawString(26, 12, Utils.padZeros(Stage.highScore, 8));

        // Affiche le numéro du niveau en cours.
        Graphics.drawString(24, 14, "round");
        Graphics.drawString(31, 14, Utils.padSpaces(Stage.number, 3));

        // Affiche le chronomètre.
        Graphics.drawString(24, 16, "time");
        Graphics.drawString(31, 16, Utils.padSpaces(Stage.time, 3));

        // Affiche le nombre de briques restantes.
        Graphics.drawImagePart(Stage.imgBricks, (24 * 8), (18 * 8), 0, 0, 16, 8);
        Graphics.drawString(27, 18, "left");
        Graphics.drawString(32, 18, Utils.padSpaces(Stage.bricksLeft, 2));

        if (Paddle.ammoLeft > 0) {
            Graphics.drawString(24, 17, "ammo");
            Graphics.drawString(31, 17, Utils.padSpaces(Paddle.ammoLeft, 3));
        }
    },
    draw: function(dt) {
        // Efface le contenu du canevas.
        Graphics.clear();

        switch (this.screen) {
            case Constants.SCREEN_TITLE: { 
                // Ecran-titre
                // -----------

                // Dessine le logo du jeu.
                Graphics.drawImage(this.imgLogo, ((Constants.CANVAS_WIDTH / 2) - 144), 32);
                Graphics.drawString(8, 1, "top score " + Utils.padZeros(Stage.highScore, 8));

                // Affiche le menu.
                Graphics.drawString(13, 17, "START GAME");
                Graphics.drawString(13, 19, "OPTIONS");
                Graphics.drawString(13, 21, "ABOUT");
                if (this.mode != "browser") {
                    Graphics.drawString(13, 23, "EXIT");
                }

                // Affiche la petite flèche de sélection.
                let y = ((this.currentMenuOption - 1) * 2);
                Graphics.drawString(11, (17 + y), String.fromCharCode(127));

                if (this.debug) {
                    // Si le mode debug est activé, on affiche le numéro de version en bas à droite 
                    // de l'écran.
                    Graphics.drawString(35 - (Constants.VERSION.length / 2), 26, Constants.VERSION, "tiny");
                }

                break;
            }

            case Constants.SCREEN_GAME: {
                // Ecran du jeu
                // ------------

                // Dessine les limites de l'aire de jeu, ainsi que les blocs et les briques.
                Stage.draw(dt);

                // Dessine la raquette.
                Paddle.draw(dt);

                // Dessine la balle.
                Ball.draw(dt);

                // Dessine les capsules.
                Capsule.draw(dt);

                // Dessine les effets spéciaux.
                Effect.draw(dt);

                // Dessine le HUD.
                this.drawHUD(dt);

                // Si le jeu est en pause, on affiche la mention "PAUSE" au centre
                // de l'écran.
                if (this.paused) {
                    Graphics.drawString(10, 9, "PAUSE", "normal", "vdblsized");

                    // Affiche le menu de pause.
                    Graphics.drawString(9, 18, "RESUME");
                    Graphics.drawString(9, 20, "END GAME");

                    // Affiche la petite flèche de sélection.
                    let y = ((this.currentMenuOption - 1) * 2);
                    Graphics.drawString(7, (18 + y), String.fromCharCode(127));
                }

                break;
            }

            case Constants.SCREEN_GAME_OVER: {
                // Ecran de fin de partie
                // ----------------------

                // Dessine les limites de l'aire de jeu, ainsi que les blocs et les briques.
                Stage.draw(dt);

                // Dessine la raquette.
                Paddle.draw(dt);

                // Dessine la balle.
                Ball.draw(dt);

                // Dessine les capsules.
                Capsule.draw(dt);

                // Dessine les effets spéciaux.
                Effect.draw(dt);

                // Dessine le HUD.
                this.drawHUD(dt);

                // Affiche la mention "GAME OVER" au centre de l'écran.
                Graphics.drawString(7, 8, "GAME OVER", "normal", "vdblsized");
                Graphics.drawString(6, 12, "BETTER LUCK");
                Graphics.drawString(6, 13, "NEXT TIME...");

                // Affiche le menu.
                Graphics.drawString(9, 18, "RETRY");
                Graphics.drawString(9, 20, "END GAME");
                
                // Affiche la petite flèche de sélection.
                let y = ((this.currentMenuOption - 1) * 2);
                Graphics.drawString(7, (18 + y), String.fromCharCode(127));

                break;
            }

            case Constants.SCREEN_LEVEL_FINISHED: {
                // Ecran niveau terminé
                // --------------------

                // Dessine les limites de l'aire de jeu, ainsi que les blocs et les briques.
                Stage.draw(dt);

                // Dessine la raquette.
                Paddle.draw(dt);

                // Dessine la balle.
                Ball.draw(dt);

                // Dessine les capsules.
                Capsule.draw(dt);

                // Dessine les effets spéciaux.
                Effect.draw(dt);

                // Dessine le HUD.
                this.drawHUD(dt);

                // Affiche la mention "ROUND CLEAR!" au centre de l'écran.
                Graphics.drawString(6, 6, "ROUND CLEAR!", "normal", "vdblsized");
                Graphics.drawString(4, 10, Stage.remainingTime + " * 10");
                Graphics.drawString(5, 11, "= " + (Stage.remainingTime * 10) + " POINTS");

                Graphics.drawString(9, 20, "CONTINUE");
                Graphics.drawString(7, 20, String.fromCharCode(127));

                break;
            }

            case Constants.SCREEN_CONGRATS: {
                // Ecran de félicitations
                // ----------------------

                // Dessine les limites de l'aire de jeu, ainsi que les blocs et les briques.
                Stage.draw(dt);

                // Dessine la raquette.
                Paddle.draw(dt);

                // Dessine la balle.
                Ball.draw(dt);

                // Dessine les capsules.
                Capsule.draw(dt);

                // Dessine les effets spéciaux.
                Effect.draw(dt);

                // Dessine le HUD.
                this.drawHUD(dt);

                // Affiche la mention "ALL ROUNDS CLEAR!"" au centre de l'écran.
                Graphics.drawString(7, 5, "ALL ROUNDS", "normal", "vdblsized");
                Graphics.drawString(9, 7, "CLEAR!", "normal", "vdblsized");
                Graphics.drawString(4, 10, Stage.remainingTime + " * 100");
                Graphics.drawString(5, 11, "= " + (Stage.remainingTime * 100) + " POINTS");
                Graphics.drawString(4, 13, "CONGRATULATIONS!", "normal", "vdblsized");

                Graphics.drawString(9, 20, "END GAME");
                Graphics.drawString(7, 20, String.fromCharCode(127));

                break;
            }

            case Constants.SCREEN_OPTIONS: {
                // Ecran des options
                // -----------------

                // Affiche le menu.
                Graphics.drawString(7, 8, "options");
                Graphics.drawString(7, 10, "BACK");
                if (Input.controls == Constants.CTRL_KEYBOARD) {
                    Graphics.drawString(7, 12, "KEYBOARD CONTROLS");
                } else {
                    Graphics.drawString(7, 12, "GAMEPAD CONTROLS");
                }
                Graphics.drawString(7, 14, "SOUND FX            " + (Sound.enabled ? "on" : "off"));
                Graphics.drawString(7, 16, "FULLSCREEN MODE     " + (this.settings.fullScreen ? "on" : "off"));
                Graphics.drawString(7, 18, "SHOW FRAME RATE     " + (this.settings.fps ? "on" : "off"));
                if (this.debug) {
                    Graphics.drawString(7, 20, "TEST STAGE " + Utils.padZeros(this.selectedStage, 2));
                }

                // Affiche la petite flèche de sélection.
                let y = ((this.currentMenuOption - 1) * 2);
                Graphics.drawString(5, (10 + y), String.fromCharCode(127));

                break;
            }

            case Constants.SCREEN_ABOUT: {
                // Version de l'application
                // ------------------------

                // Dessine le logo du jeu.
                Graphics.drawImage(this.imgLogo, ((Constants.CANVAS_WIDTH / 2) - 144), 16);

                Graphics.drawString(17, 24, "BACK");
                Graphics.drawString(15, 24, String.fromCharCode(127));

                // Affiche la version de l'application.
                let version = "VERSION " + Constants.VERSION;
                Graphics.drawString(18 - Math.ceil(version.length / 2), 15, version);

                // Affiche le copyright.
                Graphics.drawString(8, 17, "PROGRAMMING, GRAPHICS");
                Graphics.drawString(9, 18, "AND SOUND DESIGN BY");
                Graphics.drawString(11, 19, "FREDERIC FERET.");
                Graphics.drawString(5, 21, "COPYRIGHT (C) 2025 F.FERET");
                Graphics.drawString(8, 22, "ALL RIGHTS RESERVED.");

                break;
            }

            case Constants.SCREEN_KBD_CONTROLS: {
                // Ecran de redéfinition des contrôles (clavier)
                // ---------------------------------------------

                // Dessine les effets spéciaux. On se sert de cela pour afficher une pluie d'étoiles
                // en arrière-plan.
                Effect.draw();

                // Affiche le menu.
                Graphics.drawString(4, 2, "keyboard controls");
                Graphics.drawString(4, 4, "BACK");
                Graphics.drawString(4, 6, "MOVE/MENU LEFT     " + (Input.keyMap["KeyLeft"].toLowerCase()));
                Graphics.drawString(4, 8, "MOVE/MENU RIGHT    " + (Input.keyMap["KeyRight"].toLowerCase()));
                Graphics.drawString(4, 10, "MENU UP            " + (Input.keyMap["KeyUp"].toLowerCase()));
                Graphics.drawString(4, 12, "MENU DOWN          " + (Input.keyMap["KeyDown"].toLowerCase()));
                Graphics.drawString(4, 14, "FIRE/SELECT        " + (Input.keyMap["KeyFire"].toLowerCase()));
                Graphics.drawString(4, 16, "LAUNCH BALL        " + (Input.keyMap["KeyAction1"].toLowerCase()));
                Graphics.drawString(4, 18, "SHOOT LASERS       " + (Input.keyMap["KeyAction2"].toLowerCase()));
                Graphics.drawString(4, 20, "PAUSE/RESUME       " + (Input.keyMap["KeyPause"].toLowerCase()));
                Graphics.drawString(4, 22, "SET DEFAULT CONTROLS");

                // Affiche la petite flèche de sélection.
                let y = ((this.currentMenuOption - 1) * 2);
                Graphics.drawString(2, (4 + y), String.fromCharCode(127));

                break;
            }

            case Constants.SCREEN_PAD_CONTROLS: {
                // Ecran de redéfinition des contrôles (manette)
                // ---------------------------------------------

                // Dessine les effets spéciaux. On se sert de cela pour afficher une pluie d'étoiles
                // en arrière-plan.
                Effect.draw();

                // Affiche le menu.
                Graphics.drawString(4, 2, "gamepad controls");
                Graphics.drawString(4, 4, "BACK");
                Graphics.drawString(4, 6, "MOVE/MENU LEFT        LEFT");
                Graphics.drawString(4, 8, "MOVE/MENU RIGHT       RIGHT");
                Graphics.drawString(4, 10, "MENU UP               UP");
                Graphics.drawString(4, 12, "MENU DOWN             DOWN");
                Graphics.drawString(4, 14, "LAUNCH BALL/SELECT    " + (Input.buttonsText[Input.buttonMap["KeyAction1"]]));
                Graphics.drawString(4, 16, "SHOOT LASERS          " + (Input.buttonsText[Input.buttonMap["KeyAction2"]]));
                Graphics.drawString(4, 18, "PAUSE/RESUME          MENU");
                Graphics.drawString(4, 20, "SET DEFAULT CONTROLS");
                
                // Affiche la petite flèche de sélection.
                let y = ((this.currentMenuOption - 1) * 2);
                Graphics.drawString(2, (4 + y), String.fromCharCode(127));

                break;
            }
        }

        // Affiche le nombre d'images dessinées par seconde.
        if (this.settings.fps) {
            Graphics.drawString(0, 26, "FPS = " + Utils.padZeros(this.fps, 3), "tiny");
        }
    },
    update: function(dt) { 
        let time = window.performance.now();

        // Comptage du FPS
        // ---------------

        this.fpsCounter++;
        if (time > this.currentTime) {
            this.currentTime = (1000 + time);
            this.fps = this.fpsCounter;
            this.fpsCounter = 0;
        }
        
        // Gestion du clignotement du texte
        // --------------------------------

        if (time > this.currentBlinkTime) {
            this.currentBlinkTime = (500 + time);
            this.blinkState = !this.blinkState;
        }

        // Partie principale
        // -----------------

        // Gestion des appuis sur les boutons des manettes physiques
        Input.pollGamePads();

        switch (this.screen) {
            case Constants.SCREEN_TITLE: {
                // Ecran-titre
                // -----------

                if (Input.isKeyPressed("KeyUp")) {
                    if (this.currentMenuOption > 1) {
                        // Sélectionne l'option précédente.
                        this.currentMenuOption--;

                        // Joue un son.
                        Sound.play(this.sndSelect);
                    } else {
                        // Joue un son.
                        Sound.play(this.sndBlock);
                    }
                }

                if (Input.isKeyPressed("KeyDown")) {
                    if (this.currentMenuOption < (this.mode == "browser" ? 3 : 4)) {
                        // Sélectionne l'option suivante.
                        this.currentMenuOption++;

                        // Joue un son.
                        Sound.play(this.sndSelect);
                    } else {
                        // Joue un son.
                        Sound.play(this.sndBlock);
                    }
                }

                if (Input.isKeyPressed("KeyLeft")) {
                    if (this.currentMenuOption == 5) {
                        if (this.selectedStage > 1) {
                            // Sélectionne le niveau précédent.
                            this.selectedStage--;

                            // Joue un son.
                            Sound.play(this.sndSelect);
                        } else {
                            // Joue un son.
                            Sound.play(this.sndBlock);
                        }
                    }
                }

                if (Input.isKeyPressed("KeyRight")) {
                    if (this.currentMenuOption == 5) {
                        if (this.selectedStage < Constants.MAX_STAGES) {
                            // Sélectionne le niveau suivant.
                            this.selectedStage++;

                            // Joue un son.
                            Sound.play(this.sndSelect);
                        } else {
                            // Joue un son.
                            Sound.play(this.sndBlock);
                        }
                    }
                }

                if (Input.isKeyPressed("KeyFire")) {
                    switch (this.currentMenuOption) {
                        case 1: {
                            // Que la partie commence !
                            this.startGame();

                            // Joue un son.
                            Sound.play(this.sndConfirm);

                            break;
                        }

                        case 2: {
                            // Affiche l'écran des options.
                            this.screen = Constants.SCREEN_OPTIONS;
                            this.currentMenuOption = 1;

                            // Joue un son.
                            Sound.play(this.sndConfirm);

                            break;
                        }

                        case 3: {
                            // Affiche la version de l'application.
                            this.screen = Constants.SCREEN_ABOUT;

                            // Joue un son.
                            Sound.play(this.sndConfirm);

                            break;
                        }

                        case 4: {
                            // Ferme l'application.
                            window.close();

                            break;
                        }
                    }
                }

                break;
            }

            case Constants.SCREEN_GAME: {
                // Ecran du jeu
                // ------------

                if (Paddle.gameOver) {
                    // Si le joueur a été vaincu, on affiche l'écran de fin de partie.
                    this.screen = Constants.SCREEN_GAME_OVER;
                    this.currentMenuOption = 1;

                    // Détermine le meilleur score.
                    if (Stage.score > Stage.highScore) {
                        Stage.highScore = Stage.score;
                    }

                    // Sauvegarde le meilleur score dans le stockage local.
                    Storage.write("hiscore", Stage.highScore);

                    // Joue un son.
                    Sound.play(this.sndGameOver);
                }

                if (Stage.finished) {
                    if (Stage.number >= Constants.MAX_STAGES) {
                        // Tous les niveaux ont été terminés.
                        this.screen = Constants.SCREEN_CONGRATS;

                        // Détermine le meilleur score.
                        /*if (Stage.score > Stage.highScore) {
                            Stage.highScore = Stage.score;
                        }

                        // Sauvegarde le meilleur score dans le stockage local.
                        Storage.write("hiscore", Stage.highScore);*/

                        // Joue un son.
                        Sound.play(this.sndGameOver);
                    } else {
                        // Si toutes les briques ont été détruites, on passe au niveau suivant.
                        this.screen = Constants.SCREEN_LEVEL_FINISHED;
                    }
                }

                if (!this.paused) {
                    // Gère les déplacements de la balle.
                    Ball.update(dt);

                    // Gère les déplacements de la raquette.
                    Paddle.update(dt);

                    // Gère les déplacements des capsules.
                    Capsule.update(dt);

                    // Gère les éléments qui constituent le niveau.
                    Stage.update(dt);

                    // Gère les effets spéciaux.
                    Effect.update(dt);
                }

                if (Input.isKeyPressed("KeyPause")) {
                    if (this.paused) {
                        // On reprend la partie.
                        this.paused = false;

                        // Joue un son.
                        Sound.play(this.sndSelect);
                    } else {
                        if (Stage.playable) {
                            // Met le jeu en pause.
                            this.paused = true;
                            this.currentMenuOption = 1;

                            // Joue un son.
                            Sound.play(this.sndSelect);
                        }
                    }
                }

                if (Input.isKeyPressed("KeyUp")) {
                    if (this.paused) {
                        if (this.currentMenuOption > 1) {
                            // On passe à l'option précédente.
                            this.currentMenuOption--

                            // Joue un son.
                            Sound.play(this.sndSelect);
                        } else {
                            // Joue un son.
                            Sound.play(this.sndBlock);
                        }
                    }
                }

                if (Input.isKeyPressed("KeyDown")) {
                    if (this.paused) {
                        if (this.currentMenuOption < 2) {
                            // On passe à l'option suivante.
                            this.currentMenuOption++

                            // Joue un son.
                            Sound.play(this.sndSelect);
                        } else {
                            // Joue un son.
                            Sound.play(this.sndBlock);
                        }
                    }
                }

                if (Input.isKeyPressed("KeyFire")) {
                    if (this.paused) {
                        switch (this.currentMenuOption) {
                            case 1: {
                                // On reprend la partie.
                                this.paused = false;

                                // Joue un son.
                                Sound.play(this.sndSelect);

                                break;
                            }

                            case 2: {
                                // Le joueur a décidé de quitter la partie en cours. On retourne à l'écran-titre.
                                this.screen = Constants.SCREEN_TITLE;
                                this.currentMenuOption = this.testMode ? 5 : 1;

                                // On supprime toute donnée en cours de partie. Le score ne sera 
                                // pas sauvegardé.
                                Stage.destroy();
                                Paddle.destroy();
                                Ball.destroy();
                                Capsule.destroy();
                                Effect.destroy();

                                // Joue un son.
                                Sound.play(this.sndGameOver);

                                break;
                            }
                        }
                    }
                }

                if (this.debug && Input.isKeyPressed("KeyRight") && !this.testMode) {
                    if (this.paused) {
                        // Passe au niveau suivant.
                        this.nextStage();

                        // Joue un son.
                        Sound.play(this.sndConfirm);
                    }
                }

                break;
            }

            case Constants.SCREEN_GAME_OVER: {
                // Ecran de fin de partie
                // ----------------------

                // Gère les déplacements de la balle.
                Ball.update(dt);

                // Gère les déplacements de la raquette.
                Paddle.update(dt);

                // Gère les déplacements des capsules.
                Capsule.update(dt);

                // Gère les éléments qui constituent le niveau.
                Stage.update(dt);

                // Gère les effets spéciaux.
                Effect.update(dt);

                if (Input.isKeyPressed("KeyUp")) {
                    if (this.currentMenuOption > 1) {
                        // On passe à l'option précédente.
                        this.currentMenuOption--

                        // Joue un son.
                        Sound.play(this.sndSelect);
                    } else {
                        // Joue un son.
                        Sound.play(this.sndBlock);
                    }
                }

                if (Input.isKeyPressed("KeyDown")) {
                    if (this.currentMenuOption < 2) {
                        // On passe à l'option suivante.
                        this.currentMenuOption++

                        // Joue un son.
                        Sound.play(this.sndSelect);
                    } else {
                        // Joue un son.
                        Sound.play(this.sndBlock);
                    }
                }

                if (Input.isKeyPressed("KeyFire")) {
                    switch (this.currentMenuOption) {
                        case 1: {
                            // On supprime toute donnée en cours.
                            Stage.destroy();
                            Paddle.destroy();
                            Ball.destroy();
                            Capsule.destroy();
                            Effect.destroy();

                            if (this.testMode) {
                                // On relance une nouvelle partie sur le niveau sélectionné.
                                this.startGame(this.selectedStage, true);
                            } else {
                                // On relance une nouvelle partie.
                                this.startGame();
                            }

                            // Joue un son.
                            Sound.play(this.sndConfirm);

                            break;
                        }

                        case 2: {
                            // On retourne au menu principal.
                            this.screen = Constants.SCREEN_TITLE;
                            this.currentMenuOption = 1;
        
                            // On supprime toute donnée en cours.
                            Stage.destroy();
                            Paddle.destroy();
                            Ball.destroy();
                            Capsule.destroy();
                            Effect.destroy();
    
                            // Joue un son.
                            Sound.play(this.sndConfirm);

                            break;
                        }
                    }
                }

                break;
            }

            case Constants.SCREEN_LEVEL_FINISHED: {
                // Ecran niveau terminé
                // --------------------

                // Gère les déplacements de la balle.
                Ball.update(dt);

                // Gère les déplacements de la raquette.
                Paddle.update(dt);

                // Gère les déplacements des capsules.
                Capsule.update(dt);

                // Gère les éléments qui constituent le niveau.
                Stage.update(dt);

                // Gère les effets spéciaux.
                Effect.update(dt);

                if ((Input.isKeyPressed("KeyFire")) && Stage.readyToGoNext) {
                    if (this.testMode) {
                        // Le niveau est terminé, on retourne au menu principal.
                        this.screen = Constants.SCREEN_TITLE;
                        this.currentMenuOption = 5;

                        // On supprime toute donnée en cours de partie.
                        Stage.destroy();
                        Paddle.destroy();
                        Ball.destroy();
                        Capsule.destroy();
                        Effect.destroy();
                    } else {
                        // Passe au niveau suivant.
                        this.nextStage();
                    }

                    // Joue un son.
                    Sound.play(this.sndConfirm);
                }

                break;
            }

            case Constants.SCREEN_CONGRATS: {
                // Ecran de félicitations
                // ----------------------

                // Gère les déplacements de la balle.
                Ball.update(dt);

                // Gère les déplacements de la raquette.
                Paddle.update(dt);

                // Gère les déplacements des capsules.
                Capsule.update(dt);

                // Gère les éléments qui constituent le niveau.
                Stage.update(dt);

                // Gère les effets spéciaux.
                Effect.update(dt);

                if ((Input.isKeyPressed("KeyFire")) && Stage.readyToGoNext) {
                    // On retourne à l'écran-titre.
                    this.screen = Constants.SCREEN_TITLE;
                    this.currentMenuOption = 1;

                    // On supprime toute donnée en cours de partie. Le score ne sera 
                    // pas sauvegardé.
                    Stage.destroy();
                    Paddle.destroy();
                    Ball.destroy();
                    Capsule.destroy();
                    Effect.destroy();

                    // Joue un son.
                    Sound.play(this.sndConfirm);
                }

                break;
            }

            case Constants.SCREEN_OPTIONS: {
                // Ecran des options
                // -----------------

                // Gère les déplacement des effets spéciaux.
                Effect.update(dt);

                if (Input.isKeyPressed("KeyUp")) {
                    if (this.currentMenuOption > 1) {
                        // Sélectionne l'option précédente.
                        this.currentMenuOption--;

                        // Joue un son.
                        Sound.play(this.sndSelect);
                    } else {
                        // Joue un son.
                        Sound.play(this.sndBlock);
                    }
                }

                if (Input.isKeyPressed("KeyDown")) {
                    if (this.currentMenuOption < (this.debug ? 6 : 5)) {
                        // Sélectionne l'option suivante.
                        this.currentMenuOption++;

                        // Joue un son.
                        Sound.play(this.sndSelect);
                    } else {
                        // Joue un son.
                        Sound.play(this.sndBlock);
                    }
                }

                if (Input.isKeyPressed("KeyLeft")) {
                    if (this.currentMenuOption == 3) {
                        // Active/désactive les effets sonores.
                        Sound.enabled = !Sound.enabled;

                        // Joue un son.
                        Sound.playAnyway(this.sndSelect);
                    } else if (this.currentMenuOption == 4) {
                        // Active/désactive le mode plein écran. 
                        this.settings.fullScreen = !this.settings.fullScreen;
                        Graphics.setFullScreen(this.settings.fullScreen);

                        // Joue un son.
                        Sound.play(this.sndSelect);
                    } else if (this.currentMenuOption == 5) {
                        // Active/désactive l'affichage du FPS. 
                        this.settings.fps = !this.settings.fps;

                        // Joue un son.
                        Sound.play(this.sndSelect);
                    }  else if (this.currentMenuOption == 6) {
                        if (this.selectedStage > 1) {
                            // Sélectionne le niveau précédent.
                            this.selectedStage--;

                            // Joue un son.
                            Sound.play(this.sndSelect);
                        } else {
                            // Joue un son.
                            Sound.play(this.sndBlock);
                        }
                    }
                }

                if (Input.isKeyPressed("KeyRight")) {
                    if (this.currentMenuOption == 3) {
                        // Active/désactive les effets sonores.
                        Sound.enabled = !Sound.enabled;

                        // Joue un son.
                        Sound.playAnyway(this.sndSelect);
                    } else if (this.currentMenuOption == 4) {
                        // Active/désactive le mode plein écran. 
                        this.settings.fullScreen = !this.settings.fullScreen;
                        Graphics.setFullScreen(this.settings.fullScreen);

                        // Joue un son.
                        Sound.play(this.sndSelect);
                    } else if (this.currentMenuOption == 5) {
                        // Active/désactive l'affichage du FPS. 
                        this.settings.fps = !this.settings.fps;

                        // Joue un son.
                        Sound.play(this.sndSelect);
                    } else if (this.currentMenuOption == 6) {
                        if (this.selectedStage < Constants.MAX_STAGES) {
                            // Sélectionne le niveau suivant.
                            this.selectedStage++;

                            // Joue un son.
                            Sound.play(this.sndSelect);
                        } else {
                            // Joue un son.
                            Sound.play(this.sndBlock);
                        }
                    }
                }

                if (Input.isKeyPressed("KeyFire")) {
                    switch (this.currentMenuOption) {
                        case 1: {
                            // On retourne à l'écran-titre.
                            this.screen = Constants.SCREEN_TITLE;
                            this.currentMenuOption = 2;

                            // Joue un son.
                            Sound.play(this.sndConfirm);

                            break;
                        }

                        case 2: {
                            // Affiche le menu de redéfinition des contrôles.
                            if (Input.controls == Constants.CTRL_KEYBOARD) {
                                this.screen = Constants.SCREEN_KBD_CONTROLS;
                            } else {
                                this.screen = Constants.SCREEN_PAD_CONTROLS;
                            }
                            this.currentMenuOption = 1;

                            // Joue un son.
                            Sound.play(this.sndConfirm);

                            break;
                        }

                        case 3: {
                            // Active/désactive les effets sonores.
                            Sound.enabled = !Sound.enabled;

                            // Joue un son.
                            Sound.playAnyway(this.sndSelect);

                            break;
                        }

                        case 4: {
                            // Active/désactive le mode plein écran.
                            this.settings.fullScreen = !this.settings.fullScreen;
                            Graphics.setFullScreen(this.settings.fullScreen);
    
                            // Joue un son.
                            Sound.play(this.sndSelect);

                            break;
                        }

                        case 5: {
                            // Affiche/masque le nombre d'images dessinées par seconde.
                            this.settings.fps = !this.settings.fps;
    
                            // Joue un son.
                            Sound.play(this.sndSelect);

                            break;
                        }

                        case 6: {
                            // Lance une partie rapide au niveau qui a été sélectionné.
                            this.startGame(this.selectedStage, true);

                            // Joue un son.
                            Sound.play(this.sndConfirm);

                            break;
                        }
                    }
                }

                break;
            }

            case Constants.SCREEN_ABOUT: {
                // Version de l'application
                // ------------------------

                // Gère les déplacement des effets spéciaux.
                Effect.update(dt);

                if (Input.isKeyPressed("KeyFire")) {
                    // On retourne à l'écran-titre.
                    this.screen = Constants.SCREEN_TITLE;
                    this.currentMenuOption = 3;

                    // Joue un son.
                    Sound.play(this.sndConfirm);
                }

                break;
            }

            case Constants.SCREEN_KBD_CONTROLS: {
                // Ecran de redéfinition des contrôles (clavier)
                // ---------------------------------------------

                // Gère les déplacement des effets spéciaux.
                Effect.update(dt);

                if (Input.isKeyPressed("KeyUp")) {
                    if (this.currentMenuOption > 1) {
                        // Sélectionne l'option précédente.
                        this.currentMenuOption--;

                        // Joue un son.
                        Sound.play(this.sndSelect);
                    } else {
                        // Joue un son.
                        Sound.play(this.sndPlant);
                    }
                }

                if (Input.isKeyPressed("KeyDown")) {
                    if (this.currentMenuOption < 10) {
                        // Sélectionne l'option suivante.
                        this.currentMenuOption++;

                        // Joue un son.
                        Sound.play(this.sndSelect);
                    } else {
                        // Joue un son.
                        Sound.play(this.sndPlant);
                    }
                }

                if (Input.isKeyPressed("KeyFire")) {
                    switch (this.currentMenuOption) {
                        case 1: {
                            // On retourne au menu des options.
                            this.screen = Constants.SCREEN_OPTIONS;
                            this.currentMenuOption = 2;

                            // Joue un son.
                            Sound.play(this.sndConfirm);

                            break;
                        }

                        case 2: {
                            // Redéfinition de la touche GAUCHE.
                            Input.keyMap["KeyLeft"] = "?";
                            Input.keyRedefine = "KeyLeft";

                            // Joue un son.
                            Sound.play(this.sndSelect);

                            break;
                        }

                        case 3: {
                            // Redéfinition de la touche DROITE.
                            Input.keyMap["KeyRight"] = "?";
                            Input.keyRedefine = "KeyRight";

                            // Joue un son.
                            Sound.play(this.sndSelect);

                            break;
                        }

                        case 4: {
                            // Redéfinition de la touche HAUT.
                            Input.keyMap["KeyUp"] = "?";
                            Input.keyRedefine = "KeyUp";

                            // Joue un son.
                            Sound.play(this.sndSelect);

                            break;
                        }

                        case 5: {
                            // Redéfinition de la touche BAS.
                            Input.keyMap["KeyDown"] = "?";
                            Input.keyRedefine = "KeyDown";

                            // Joue un son.
                            Sound.play(this.sndSelect);

                            break;
                        }

                        case 6: {
                            // Redéfinition de la touche FIRE.
                            Input.keyMap["KeyFire"] = "?";
                            Input.keyRedefine = "KeyFire";

                            // Joue un son.
                            Sound.play(this.sndSelect);

                            break;
                        }

                        case 7: {
                            // Redéfinition de la touche ACTION 1.
                            Input.keyMap["KeyAction1"] = "?";
                            Input.keyRedefine = "KeyAction1";

                            // Joue un son.
                            Sound.play(this.sndSelect);

                            break;
                        }

                        case 8: {
                            // Redéfinition de la touche ACTION 2.
                            Input.keyMap["KeyAction2"] = "?";
                            Input.keyRedefine = "KeyAction2";

                            // Joue un son.
                            Sound.play(this.sndSelect);

                            break;
                        }

                        case 9: {
                            // Redéfinition de la touche PAUSE.
                            Input.keyMap["KeyPause"] = "?";
                            Input.keyRedefine = "KeyPause";

                            // Joue un son.
                            Sound.play(this.sndSelect);

                            break;
                        }

                        case 10: {
                            // Réinitialise les contrôles par défaut.
                            Input.restoreDefaults("keyboard");

                            // Joue un son.
                            Sound.play(this.sndConfirm);

                            break;
                        }
                    }
                }

                break;
            }

            case Constants.SCREEN_PAD_CONTROLS: {
                // Ecran de redéfinition des contrôles (manette)
                // ---------------------------------------------

                // Gère les déplacement des effets spéciaux.
                Effect.update(dt);

                if (Input.isKeyPressed("KeyUp")) {
                    if (this.currentMenuOption > 1) {
                        // Sélectionne l'option précédente.
                        this.currentMenuOption--;

                        // Joue un son.
                        Sound.play(this.sndSelect);
                    } else {
                        // Joue un son.
                        Sound.play(this.sndPlant);
                    }
                }

                if (Input.isKeyPressed("KeyDown")) {
                    if (this.currentMenuOption < 9) {
                        // Sélectionne l'option suivante.
                        this.currentMenuOption++;

                        // Joue un son.
                        Sound.play(this.sndSelect);
                    } else {
                        // Joue un son.
                        Sound.play(this.sndPlant);
                    }
                }

                if (Input.isKeyPressed("KeyFire")) {
                    switch (this.currentMenuOption) {
                        case 1: {
                            // On retourne au menu des options.
                            this.screen = Constants.SCREEN_OPTIONS;
                            this.currentMenuOption = 2;

                            // Joue un son.
                            Sound.play(this.sndConfirm);

                            break;
                        }

                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 8: {
                            // Joue un son.
                            Sound.play(this.sndPlant);

                            break;
                        }

                        case 6: {
                            // Redéfinition de la touche ACTION 1.
                            Input.buttonMap["KeyAction1"] = "?";
                            Input.buttonRedefine = "KeyAction1";

                            // Joue un son.
                            Sound.play(this.sndSelect);

                            break;
                        }

                        case 7: {
                            // Redéfinition de la touche ACTION 2.
                            Input.buttonMap["KeyAction2"] = "?";
                            Input.buttonRedefine = "KeyAction2";

                            // Joue un son.
                            Sound.play(this.sndSelect);

                            break;
                        }

                        case 9: {
                            // Réinitialise les contrôles par défaut.
                            Input.restoreDefaults("gamepad");

                            // Joue un son.
                            Sound.play(this.sndConfirm);

                            break;
                        }
                    }
                }
            }
        }

        //Input.ack();
    }
})
