export default ({
    isMobile() {
        let check = false, userAgent = (navigator.userAgent || navigator.vendor || window.opera);

        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0, 4))) {
            check = true;
        }

        return check;
    },
    getDisplayMode: function() {
        if (document.referrer.startsWith('android-app://'))
            return 'twa';
        if (window.matchMedia('(display-mode: browser)').matches)
            return 'browser';
        if (window.matchMedia('(display-mode: standalone)').matches)
            return 'standalone';
        if (window.matchMedia('(display-mode: minimal-ui)').matches)
            return 'minimal-ui';
        if (window.matchMedia('(display-mode: fullscreen)').matches)
            return 'fullscreen';
        if (window.matchMedia('(display-mode: window-controls-overlay)').matches)
            return 'window-controls-overlay';

        return 'unknown';
    },
	delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	},
	isJson(item) {
		if (typeof item !== "string") {
			return false;
		}

		let value = typeof item !== "string" ? JSON.stringify(item) : item;

		try {
			value = JSON.parse(value);
		} catch (error) {
			return false;
		}

		return typeof value === "object" && value !== null;
	},
	isObject(object) {
		var type = typeof object;
		return type === 'function' || type === 'object' && !!object;
	},
    padZeros(number, size) {
        var s = "000000000" + number;
        return s.substr(s.length - size);
    },
    padSpaces(number, size) {
        var s = "        " + number;
        return s.substr(s.length - size);
    },
    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    checkCollision(shapeA, shapeB) {
        let vx = (shapeA.x + (shapeA.w / 2)) - (shapeB.x + (shapeB.w / 2));
        let vy = (shapeA.y + (shapeA.h / 2)) - (shapeB.y + (shapeB.h / 2));
        let hw = (shapeA.w / 2) + (shapeB.w / 2);
        let hh = (shapeA.h / 2) + (shapeB.h / 2);

        if (Math.abs(vx) < hw && Math.abs(vy) < hh) {
            let ox = hw - Math.abs(vx);
            let oy = hh - Math.abs(vy);

            if (ox >= oy) {
                if (vy > 0) {
                    // La collision a eu lieu en dessous.
                    return {
                        direction: "under",
                        ox: 0,
                        oy: oy,
                    };
                } else {
                    // La collision a eu lieu au dessus.
                    return {
                        direction: "on",
                        ox: 0,
                        oy: -oy,
                    };
                }
            } else {
                if (vx > 0) {
                    // La collision a eu lieu à gauche.
                    return {
                        direction: "left",
                        ox: ox,
                        oy: 0,
                    };
                } else {
                    // La collision a eu lieu à droite.
                    return {
                        direction: "right",
                        ox: -ox,
                        oy: 0,
                    };
                }
            }
        }

        return {
            direction: "none",
            ox: 0,
            oy: 0,
        };
    },
    isElectron() {
        if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
            return true;
        }
        if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
            return true;
        }
        if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
            return true;
        }
    
        return false;
    }
});
