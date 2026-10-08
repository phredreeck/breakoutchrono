export default ({
    context: null,
    enabled: true,

    loadAsset: async function(assetName) {
        if (!this.context) {
            // Initialisation de l'API Web Audio.
            this.context = new AudioContext({ latencyHint: "interactive" });
        }

        // Chargement du fichier.
        const response = await fetch(assetName);
        const buffer = await response.arrayBuffer();

        // Décodage du fichier.
        const decodedBuffer = await this.context.decodeAudioData(buffer.slice(0));

        return decodedBuffer;
    },
    play: function(sound) {
        if (sound && this.enabled) {
            this.playAnyway(sound);
        }
    },
    playAnyway: async function(sound) {
        if (sound) {
            // Création de la source.
            const source = this.context.createBufferSource();
            source.buffer = sound;
            source.connect(this.context.destination);
            source.start(); 
        }
    }
});
