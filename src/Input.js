import Constants from "@/Constants.js";
import Sound from "@/Sound.js";
import Utils from "@/Utils.js";

import sndPowerUp from "@assets/snd/powerup.ogg";
import sndBlock from "@assets/snd/block.ogg";

export default ({
    // Constantes.
    BUTTON_A: 0,
    BUTTON_B: 1,
    BUTTON_X: 2,
    BUTTON_Y: 3,
    BUTTON_MENU: 9,
    BUTTON_UP: 12,
    BUTTON_DOWN: 13,
    BUTTON_LEFT: 14,
    BUTTON_RIGHT: 15,
    BUTTON_UNDEFINED: -1,

    vpad: null,
    vpadLeft: null,
    vpadRight: null,
    vpadUp: null,
    vpadDown: null,
    vpadKeyX: null,
    vpadKeyC: null,
    vpadKeyD: null,
    vpadKeyF: null,
    vpadPause: null,
    vpadBack: null,
    gamepads: [],
    controls: 0,

    sndPowerUp: null,
    sndBlock: null,

    // Contrôles.
    keyLeftPressed: false,
    keyRightPressed: false,
    keyUpPressed: false,
    keyDownPressed: false,
    keyAction1Pressed: false,
    keyAction2Pressed: false,
    keyAction3Pressed: false,
    keyAction4Pressed: false,
    keyBackPressed: false,
    keyPausePressed: false,
    keys: {
        KeyLeft: false,
        KeyRight: false,
        KeyUp: false,
        KeyDown: false,
        KeyFire: false,
        KeyPause: false,
        KeyAction1: false,
        KeyAction2: false,
        KeyAction3: false,
        KeyAction4: false,
    },
    buttons: {
        0: false,
        1: false,
        2: false,
        3: false,
        9: false,
        12: false,
        13: false,
        14: false,
        15: false,
    },
    keyMap: null,
    buttonMap: null,
    buttonKeyCorrespondance: {
        0: "KeyAction1",
        1: "KeyAction2",
        2: "KeyAction3",
        3: "KeyAction4",
        9: "KeyPause",
        12: "KeyUp",
        13: "KeyDown",
        14: "KeyLeft",
        15: "KeyRight",
    },
    buttonsText: {
        0: "a",
        1: "b",
        2: "x",
        3: "y",
        9: "menu",
        12: "up",
        13: "down",
        14: "left",
        15: "right",
        "?": "?"
    },

    keyRedefine: null,
    buttonRedefine: null,
    
    init: async function() {
        // Chargement des ressources.
        this.sndPowerUp = await Sound.loadAsset(sndPowerUp);
        this.sndBlock = await Sound.loadAsset(sndBlock);

        // Par défaut, les contrôles se font au clavier.
        this.controls = Constants.CTRL_KEYBOARD;

        // Définit les contrôles par défaut.
        this.restoreDefaults("keyboard");
        this.restoreDefaults("gamepad");

        // Enregistre deux fonctions pour gérer les appuis sur les touches
        // du clavier.
        window.addEventListener("keydown", (e) => {
            this.onKeyDown({
                code: e.code,
                ctrl: e.ctrlKey,
                alt: e.altKey,
                shift: e.shiftKey,
                meta: e.metaKey,
            });
        });
        window.addEventListener("keyup", (e) => {
            this.onKeyUp({
                code: e.code,
                ctrl: e.ctrlKey,
                alt: e.altKey,
                shift: e.shiftKey,
                meta: e.metaKey,
            });
        });

        // Initialisation des boutons du gamepad virtuel.
        this.vpad = document.querySelector("#gamepad");
        this.vpadLeft = document.querySelector("#gamepad-left .button-left");
        this.vpadRight = document.querySelector("#gamepad-left .button-right");
        this.vpadUp = document.querySelector("#gamepad-left .button-up");
        this.vpadDown = document.querySelector("#gamepad-left .button-down");
        this.vpadKeyX = document.querySelector("#gamepad-right .button-action1");
        this.vpadKeyC = document.querySelector("#gamepad-right .button-action2");
        this.vpadKeyD = document.querySelector("#gamepad-right .button-action3");
        this.vpadKeyF = document.querySelector("#gamepad-right .button-action4");
        this.vpadPause = document.querySelector("#gamepad-right .button-pause");

        if (Utils.isMobile()) {
            // Affiche la manette virtuelle.
            document.querySelector("#gamepad").classList.remove("hidden");

            // Enregistre trois fonctions pour gérer le clic sur un bouton de la manette virtuelle.
            this.vpad.addEventListener("touchstart", (event) => { this.onTouchStart(event) });
            this.vpad.addEventListener("touchmove", (event) => { this.onTouchMoved(event) });
            this.vpad.addEventListener("touchend", (event) => { this.onTouchEnd(event) });

            // Sur smartphone et tablettes, les contrôles se font désormais sur l'écran tactile
            // via la manette virtuelle.
            this.controls = Constants.CTRL_TOUCH;
        }
        
        // Enregistre deux autre fonctions pour gérer la connexion et la déconnexion
        // d'une manette à l'ordinateur.
        window.addEventListener("gamepadconnected", (e) => {
            console.log("Input: gamepad connected: ", e.gamepad);

            // Une manette vient d'être connectée à l'ordinateur. On gère cette manette.
            this.handleGamepad(e, true);
        }, false);
        window.addEventListener("gamepaddisconnected", (e) => {
            console.log("Input: gamepad disconnected: ", e.gamepad);

            // Une manette vient d'être déconnectée à l'ordinateur.
            this.handleGamepad(e, false);
        }, false);
    },
    handleGamepad: function(event, state) {
        // Récupère les informations concernant la manette qui vient d'être
        // connectée/déconnectée.
        let gamepad = event.gamepad;
        
        if (state) {
            // La manette vient de se connecter. On stocke ses informations dans la
            // liste des manettes.
            this.gamepads.push(gamepad);

            // Les contrôles se font maintenant à la manette.
            this.controls = Constants.CTRL_GAMEPAD;
        } else {
            // La manette vient d'être déconnectée. On retirer ses informations de la
            // liste des manettes.
            let index = this.gamepads.indexOf(gamepad);
            if (index >= 0) {
                this.gamepads.splice(index, 1);
            }

            if (this.gamepads.length === 0) {
                if (Utils.isMobile()) {
                    // Sur smartphone et tablettes, les contrôles se font désormais sur l'écran tactile
                    // via la manette virtuelle.
                    this.controls = Constants.CTRL_TOUCH;
                } else {
                    // Les contrôles se font au clavier.
                    this.controls = Constants.CTRL_KEYBOARD;
                }
            }
        }
    },
    pollGamePads: function() {
        for (let gamepad of this.gamepads) {
            let buttons = gamepad.buttons.entries();
            for (const [buttonIndex, button] of buttons) {
                if (button.pressed) {
                    // Bouton pressé
                    // -------------

                    //console.log("(pad pressed) button ID = ", buttonIndex);

                    if (!this.buttons[buttonIndex]) {
                        if (this.buttonRedefine) {
                            // Une redéfinition d'un contrôle a été demandé. Le bouton qui vient d'être pressé sera
                            // assigné à ce contrôle. 
                            let found = false;
                            for (let k in this.buttonMap) {
                                if (this.buttonMap[k] == buttonIndex) {
                                    // Ce bouton est déjà assigné ailleurs.
                                    found = true;
                
                                    // Joue un son.
                                    Sound.play(this.sndBlock);
                
                                    break;
                                }
                            }
                
                            if (!found) {
                                // Assigne le bouton qui vient d'être pressé au contrôle.
                                this.buttonMap[this.buttonRedefine] = buttonIndex;
                                this.buttonRedefine = "DONE";
                            }
                        } else {
                            // A partir du numéro du bouton qui vient d'être pressé, on essaie de savoir
                            // à quelle contrôle ça correspond.
                            let key = "";
                            for (let k in this.buttonMap) {
                                if (this.buttonMap[k] == buttonIndex) {
                                    key = k;
                                    break;
                                }
                            }

                            //console.log("button down = ", key);

                            // Traitement du bouton qui vient d'être préssé.
                            this.doControl(key, true);
                        }

                        this.buttons[buttonIndex] = true;
                    }
                } else {
                    // Bouton relaché
                    // --------------

                    if (this.buttons[buttonIndex]) {
                        this.buttons[buttonIndex] = false;
                        if (this.buttonRedefine == "DONE") {
                            // Une redéfinition d'un contrôle a été demandé, et il vient d'être assigné à une touche.
                            this.buttonRedefine = null;
                
                            // Joue un son.
                            Sound.play(this.sndPowerUp);
                        } else if (!this.buttonRedefine) {
                            // A partir du scancode de la touche qui vient d'être relachée, on essaie de savoir
                            // à quelle contrôle ça correspond.
                            let key = "";
                            for (let k in this.buttonMap) {
                                if (this.buttonMap[k] == buttonIndex) {
                                    key = k;
                                    break;
                                }
                            }
                
                            //console.log("button up = ", key);
                
                            // Traitement du bouton qui vient d'être relaché.
                            this.doControl(key, false);
                        }
                    }
                }
            }
        }
    },
    ack: function() {
        this.keyLeftPressed = false;
        this.keyRightPressed = false;
        this.keyUpPressed = false;
        this.keyDownPressed = false;
        this.keyAction1Pressed = false;
        this.keyAction2Pressed = false;
        this.keyAction3Pressed = false;
        this.keyAction4Pressed = false;
        this.keyBackPressed = false;
        this.keyPausePressed = false;
    },
    onTouchStart: function(event) {
        if (event.changedTouches.length > 0) {
            for (let touch of event.changedTouches) {
                let element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element) {
                    let key = element.dataset.key;
                    if (key) {
                        this.onTouchDown(key);
                    }
                }
            }
        }
    },
    onTouchMoved: function(event) {
        if (event.changedTouches.length > 0) {
            for (let touch of event.changedTouches) {
                let element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element) {
                    let key = element.dataset.key;
                    if (key) {
                        this.onTouchDown(key);
                    } else {
                        this.onTouchUp(12);
                        this.onTouchUp(13);
                        this.onTouchUp(14);
                        this.onTouchUp(15);
                        this.onTouchUp(0);
                        this.onTouchUp(1);
                        this.onTouchUp(2);
                        this.onTouchUp(3);
                    }
                }
            }
        }
    },
    onTouchEnd: function(event) {
        if (event.changedTouches.length > 0) {
            for (let touch of event.changedTouches) {
                let element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element) {
                    let key = element.dataset.key;
                    if (key) {
                        this.onTouchUp(key);
                    }
                }
            }
        }
    },
    onTouchDown: function(buttonIndex) {
        if (!this.buttons[buttonIndex]) {
            if (this.buttonRedefine) {
                // Une redéfinition d'un contrôle a été demandé. Le bouton qui vient d'être pressé sera
                // assigné à ce contrôle. 
                let found = false;
                for (let k in this.buttonMap) {
                    if (this.buttonMap[k] == buttonIndex) {
                        // Ce bouton est déjà assigné ailleurs.
                        found = true;
    
                        // Joue un son.
                        Sound.play(this.sndBlock);
    
                        break;
                    }
                }
    
                if (!found) {
                    // Assigne le bouton qui vient d'être pressé au contrôle.
                    this.buttonMap[this.buttonRedefine] = buttonIndex;
                    this.buttonRedefine = "DONE";
                }
            } else {
                // A partir du numéro du bouton qui vient d'être pressé, on essaie de savoir
                // à quelle contrôle ça correspond.
                let key = "";
                for (let k in this.buttonMap) {
                    if (this.buttonMap[k] == buttonIndex) {
                        key = k;
                        break;
                    }
                }

                //console.log("button down = ", key);

                //if (!this.keys[key]) {
                    // Traitement du bouton qui vient d'être préssé.
                    this.doControl(key, true);
                //}
            }

            this.buttons[buttonIndex] = true;
        }
    },
    onTouchUp: function(buttonIndex) {
        if (this.buttons[buttonIndex]) {
            this.buttons[buttonIndex] = false;
            if (this.buttonRedefine == "DONE") {
                // Une redéfinition d'un contrôle a été demandé, et il vient d'être assigné à une touche.
                this.buttonRedefine = null;
    
                // Joue un son.
                Sound.play(this.sndPowerUp);
            } else if (!this.buttonRedefine) {
                // A partir du scancode de la touche qui vient d'être relachée, on essaie de savoir
                // à quelle contrôle ça correspond.
                let key = "";
                for (let k in this.buttonMap) {
                    if (this.buttonMap[k] == buttonIndex) {
                        key = k;
                        break;
                    }
                }
    
                //console.log("button up = ", key);
    
                //if (this.keys[key]) {
                    // Traitement du bouton qui vient d'être relaché.
                    this.doControl(key, false);
                //}
            }
        }
    },
    isKeyPressed: function(key) {
        let result = false;

        switch (key) {
            case "KeyLeft": {
                result = this.keyLeftPressed;
                this.keyLeftPressed = false;

                break;
            } 

            case "KeyRight": {
                result = this.keyRightPressed;
                this.keyRightPressed = false;

                break;
            } 

            case "KeyUp": {
                result = this.keyUpPressed;
                this.keyUpPressed = false;

                break;
            } 

            case "KeyDown": {
                result = this.keyDownPressed;
                this.keyDownPressed = false;

                break;
            } 

            case "KeyAction1": {
                result = this.keyAction1Pressed;
                this.keyAction1Pressed = false;

                break;
            } 

            case "KeyAction2": {
                result = this.keyAction2Pressed;
                this.keyAction2Pressed = false;

                break;
            } 

            case "KeyAction3": {
                result = this.keyAction3Pressed;
                this.keyAction3Pressed = false;

                break;
            } 

            case "KeyAction4": {
                result = this.keyAction4Pressed;
                this.keyAction4Pressed = false;

                break;
            } 

            case "KeyFire": {
                result = this.keyAction1Pressed;
                this.keyAction1Pressed = false;

                break;
            } 

            case "KeyPause": {
                result = this.keyPausePressed;
                this.keyPausePressed = false;

                break;
            } 

            default: {
                // Touche inconnue.
                break;
            }
        }

        return result;
    },
    onKeyDown: function(event) {
        //console.log("(key down) event = ", event);

        if (this.keyRedefine) {
            // Une redéfinition d'un contrôle a été demandé. La touche qui vient d'être pressée sera
            // assignée à ce contrôle. 
            let found = false;
            for (let k in this.keyMap) {
                if (this.keyMap[k] == event.code) {
                    // Cette touche est déjà assignée ailleurs.
                    found = true;

                    // Joue un son.
                    Sound.play(this.sndBlock);

                    break;
                }
            }

            if (!found) {
                // Assigne la touche qui vient d'être pressée au contrôle.
                this.keyMap[this.keyRedefine] = event.code;
                this.keyRedefine = "DONE";
            }
        } else {
            // A partir du scancode de la touche qui vient d'être pressée, on essaie de savoir
            // à quelle contrôle ça correspond.
            let key = "";
            for (let k in this.keyMap) {
                if (this.keyMap[k] == event.code) {
                    key = k;
                    break;
                }
            }

            //console.log("key down = ", key);

            // Traitement de la touche qui vient d'être préssée.
            this.doControl(key, true);
        }
    },
    onKeyUp: function(event) {
        //console.log("(key up) event = ", event);

        if (this.keyRedefine == "DONE") {
            // Une redéfinition d'un contrôle a été demandé, et il vient d'être assigné à une touche.
            this.keyRedefine = null;

            // Joue un son.
            Sound.play(this.sndPowerUp);
        } else if (!this.keyRedefine) {
            // A partir du scancode de la touche qui vient d'être relachée, on essaie de savoir
            // à quelle contrôle ça correspond.
            let key = "";
            for (let k in this.keyMap) {
                if (this.keyMap[k] == event.code) {
                    key = k;
                    break;
                }
            }

            //console.log("key up = ", key);

            // Traitement de la touche qui vient d'être relachée.
            this.doControl(key, false);
        }
    },
    doControl: function(key, state) {
        if (state) {
            // Touche pressée
            // --------------

            switch (key) {
                case "KeyLeft": {
                    // La touche GAUCHE a été pressée.
                    if (!this.keys["KeyLeft"]) {
                        this.keyLeftPressed = true;
                    } else {
                        this.keyLeftPressed = false;
                    }
                    break;
                }

                case "KeyRight": {
                    // La touche DROITE a été pressée.
                    if (!this.keys["KeyRight"]) {
                        this.keyRightPressed = true;
                    } else {
                        this.keyRightPressed = false;
                    }
                    break;
                }

                case "KeyUp": {
                    // La touche HAUT a été pressée.
                    if (!this.keys["KeyUp"]) {
                        this.keyUpPressed = true;
                    } else {
                        this.keyUpPressed = false;
                    }
                    break;
                }

                case "KeyDown": {
                    // La touche BAS a été pressée.
                    if (!this.keys["KeyDown"]) {
                        this.keyDownPressed = true;
                    } else {
                        this.keyDownPressed = false;
                    }
                    break;
                }

                case "KeyAction1": {
                    // La touche ACTION 1 a été pressée.
                    if (!this.keys["KeyAction1"]) {
                        this.keyAction1Pressed = true;
                    } else {
                        this.keyAction1Pressed = false;
                    }
                    break;
                }

                case "KeyAction2": {
                    // La touche ACTION 2 a été pressée.
                    if (!this.keys["KeyAction2"]) {
                        this.keyAction2Pressed = true;
                    } else {
                        this.keyAction2Pressed = false;
                    }
                    break;
                }

                case "KeyAction3": {
                    // La touche ACTION 3 a été pressée.
                    if (!this.keys["KeyAction3"]) {
                        this.keyAction3Pressed = true;
                    } else {
                        this.keyAction3Pressed = false;
                    }
                    break;
                }

                case "KeyAction4": {
                    // La touche ACTION 4 a été pressée.
                    if (!this.keys["KeyAction4"]) {
                        this.keyAction4Pressed = true;
                    } else {
                        this.keyAction4Pressed = false;
                    }
                    break;
                }

                case "KeyFire": {
                    // La touche FEU a été pressée.
                    if (!this.keys["KeyFire"]) {
                        this.keyAction1Pressed = true;
                    } else {
                        this.keyAction1Pressed = false;
                    }
                    break;
                }

                case "KeyPause": {
                    // La touche P a été pressée.
                    if (!this.keys["KeyPause"]) {
                        this.keyPausePressed = true;
                    } else {
                        this.keyPausePressed = false;
                    }
                    break;
                }

                default: {
                    // Touche inconnue.
                    break;
                }
            }

            if (key in this.keys) {
                this.keys[key] = true;
            }
        } else {
            // Touche relachée
            // ---------------

            if (key in this.keys) {
                this.keys[key] = false;
            }
        }
    },
    restoreDefaults: function(controls) {
        switch (controls) {
            case "keyboard": {
                // Redéfinit les contrôles par défaut du clavier.
                this.keyMap = {
                    KeyLeft: "ArrowLeft",
                    KeyRight: "ArrowRight",
                    KeyUp: "ArrowUp",
                    KeyDown: "ArrowDown",
                    KeyFire: "Space",
                    KeyPause: "KeyP",
                    KeyAction1: "KeyX",
                    KeyAction2: "KeyC",
                    KeyAction3: "KeyD",
                    KeyAction4: "?"
                };

                break;
            }

            case "gamepad": {
                // Redéfinit les contrôles par défaut de la manette.
                this.buttonMap = {
                    KeyLeft: this.BUTTON_LEFT,
                    KeyRight: this.BUTTON_RIGHT,
                    KeyUp: this.BUTTON_UP,
                    KeyDown: this.BUTTON_DOWN,
                    KeyFire: this.BUTTON_UNDEFINED,
                    KeyPause: this.BUTTON_MENU,
                    KeyAction1: this.BUTTON_A,
                    KeyAction2: this.BUTTON_B,
                    KeyAction3: this.BUTTON_X,
                    KeyAction4: this.BUTTON_UNDEFINED
                };

                break;
            }
        }
    }
});
