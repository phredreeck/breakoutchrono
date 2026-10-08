import Utils from "@/Utils";

export default {
	verbose: false,
	appKey: "app-breakout-",
	exists(key) {
		// Vérifie si la variable spécifiée existe bien dans le stockage local. Pour cela, on tente de lire
		// cette valeur. Si on obtient NULL, alors la variable n'existe pas.
		let result = (localStorage.getItem(this.appKey + key) !== null);

		if (this.verbose) {
			console.log("Storage.exists() <- : " + this.appKey + key + " " + (result ? "existe" : "n'existe pas"));
		}

		return result;
	},
	read(key, clear = false) {
		let value = null, result = null;

		try {
			// Récupère la valeur de la variable spécifiée.
			value = localStorage.getItem(this.appKey + key);

			// Si la valeur est un JSON, on le parse de façon à pouvoir renvoyer l'objet tel quel.
			if (Utils.isJson(value)) {
				result = JSON.parse(value);
			} else {
				result = value;
			}

			if (this.verbose) {
				console.log("Storage.write() <- " + this.appKey + key + " = ", result);
			}
		} catch (e) {
			// Si une exception est déclenchée, cela veut dire que le stockage local est inacessible ou
			// que la donnée lue n'est pas en JSON. On renvoit donc la valeur brute ou NULL.
			result = value;
		}

		if (clear) {
			// Supprime la variable.
			this.clear(this.appKey + key);
		}

		return result;
	},
	write(key, value) {
		let result = true;

		try {
			let _value = value;

			if (Array.isArray(value)) {
				// Si la valeur est un tableau, alors celui-ci sera enregistré en JSON dans le stockage
				// local.
				_value = JSON.stringify(value);
			}

			if (Utils.isObject(value)) {
				// Si la valeur est un objet, alors celui-ci sera enregistré en JSON dans le stockage
				// local.
				_value = JSON.stringify(value);
			}

			if (this.verbose) {
				console.log("Storage.write() " + this.appKey + key + " = ", value);
			}

			// Enregistre la valeur dans le stockage local.
			localStorage.setItem(this.appKey + key, _value);
		} catch (e) {
			// Si une exception est déclenchée, cela veut dire que l'espace allouée au stockage local pour
			// l'application est plein.
			console.error("Erreur: ", e);
			result = false;
		}

		return result;
	},
	clear(key) {
		if (this.verbose) {
			console.log("Storage.clear() " + this.appKey + key + " effacé");
		}

		// Supprime la variable spécifiée du stockage local.
		localStorage.removeItem(this.appKey + key);
	},
};
