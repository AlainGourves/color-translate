
class MyColor {
    constructor(input) {
        // Valeurs normalisées sur l'intervalle [0,1]
        this._r;
        this._g;
        this._b;
        this._h; // intervalle [0,360]
        this._s;
        this._l;
        this._a = 1; // transparence default
        this._type; // 'rgb', 'hsl', 'hex'
        
        this.regexHex = /#([0-9a-f]{3,8})/i;
        this.regexRgb = /rgba?\((.*?)\)/i;
        this.regexHsl = /hsla?\((.*?)\)/i;
        
        this.sep = ', '; // par défaut, accepte aussi ' '
        this.sepAlpha = ', '; // par défaut, accepte aussi ' / '

        this.hexField = document.getElementById('clr-hex');
        this.rgbField = document.getElementById('clr-rgb');
        this.hslField = document.getElementById('clr-hsl');
        this.sample = document.getElementById('clr-sample');
        
        this.hexField.value = '';
        this.rgbField.value = '';
        this.hslField.value = '';

        try {
            if (this.regexHex.test(input)) {
                this._type = 'hex'
            } else if (this.regexRgb.test(input)) {
                this._type = 'rgb'
            } else if (this.regexHsl.test(input)) {
                this._type = 'hsl'
            } else {
                let err = new Error(`La chaîne "${input}" ne correspond à aucun type accepté.`);
                throw err;
            }

            switch (this._type) {
                case 'hex':
                    this._getValuesFromHex(input);
                    this._rgb2hsl();
                    break;

                case 'rgb':
                    this._getValuesFromRGB(input);
                    this._rgb2hsl();
                    break;

                case 'hsl':
                    this._getValuesFromHSL(input);
                    this._hsl2rgb();
                    // conversion en RGB
                    break;
            }

            const lastCheck = [this._r, this._g, this._b, this._h, this._s, this._l, this._a];
            const tags = ['R', 'G', 'B', 'H', 'S', 'L', 'A'];

            lastCheck.forEach((v,i) =>{
                if (isNaN(v)) {
                    let err = new Error(`Problème avec la valeur de "${tags[i]}".`);
                    throw err;
                }
            });

            this.hexField.value = this.HEX();
            this.rgbField.value = this.RGB();
            this.hslField.value = this.HSL();
            this.sample.style.backgroundColor = this.RGB();
        } catch (err) {
            console.error(err.message);
        }
    }

    _hsl2rgb() {
        // l'algorythme vient de https://en.wikipedia.org/wiki/HSL_and_HSV#Color_conversion_formulae
        const a = this._s * (Math.min(this._l, 1 - this._l));
        const theFunc = function (n, that) {
            const k = (n + (that._h / 30)) % 12;
            return that._l - (a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
        }
        this._r = theFunc(0, this);
        this._g = theFunc(8, this);
        this._b = theFunc(4, this);
    }

    _rgb2hsl() {
        const xmax = Math.max(this._r, this._g, this._b);
        const xmin = Math.min(this._r, this._g, this._b);
        const chroma = xmax - xmin;
        if (chroma == 0){
            this._h = 0;
        }else if (xmax == this._r) {
            this._h = 60 * (((this._g - this._b) / chroma) % 6);
        }else if (xmax == this._g) {
            this._h = 60 * (((this._b - this._r) / chroma + 2) % 6);
        }else if (xmax == this._b) {
            this._h = 60 * (((this._r - this._g) / chroma + 4) % 6);
        }
        this._h = Math.round(this._h);
        this._l = (xmax + xmin) / 2;
        this._s = (xmax == 0) ? 0 : chroma / (1 - Math.abs(2 * xmax - chroma - 1));
    }

    _getValues(input) {
        const regex = /(\d+\.?\d*(?:%|deg)?)[,| ]\s*(\d+\.?\d*\%?)[,| ]\s*(\d+\.?\d*\%?)\s*[,|/]?\s*(\d*[.|%]\d*)?/gi; // (?:...) parenthèse non capturante
        const result = [...input.matchAll(regex)];
        if (result.length > 0) {
            return result[0].slice(1); // l'item 0 contient la chaîne qui matche tout le regex, on en n'a pas besoin
        } else {
            let err = new Error(`La chaîne "${input}" ne correspond à aucun pattern.`);
            throw err;
        }
    }

    _getValuesFromHSL(input) {
        try {
            let vals = this._getValues(input);

            // H est dans l'intervalle 0-360 (et pas un %)
            if (vals[0].indexOf('%') != -1 || vals[0] < 0 || vals[0] > 360) {
                let err = new Error(`Hue doit être compris entre 0 et 360 : ${vals[0]}.`);
                throw err;
            } else if (vals[0].toLowerCase().indexOf('deg') != -1) {
                // Supprime le 'deg' s'il est présent
                vals[0] = vals[0].substr(0, vals[0].toLowerCase().indexOf('deg'));
            }

            for (let i = 1; i < 3; i++) {
                // S et L doivent être des %
                if (vals[i].indexOf('%') == -1) {
                    let err = new Error(`"${vals[i]}" doit être un pourcentage.`);
                    throw err;
                } else {
                    // on ne stocke pas le '%'
                    vals[i] = (vals[i].substr(0, vals[i].length - 1) / 100).toFixed(3);
                }
            }
            // transparence
            if (vals[3] != undefined) {
                // possibité d'un %
                if (vals[3].indexOf('%') > -1) {
                    vals[3] = (vals[3].substr(0, vals[3].length - 1) / 100).toFixed(3); // valeur entre 0 et 1, avec 3 décimales;
                }
            }

            this._h = vals[0] / 1; // /1 permet de supprimer les 0 inutiles en décimale
            this._s = vals[1] / 1;
            this._l = vals[2] / 1;
            if (vals[3] != undefined) this._a = vals[3] / 1
        } catch (err) {
            console.error(err);
            return;
        }
    }

    _getValuesFromRGB(input) {
        try {
            let vals = this._getValues(input);

            // valeurs R, G et B
            for (let i = 0; i < 3; i++) {
                // possibilité d'avoir une valeur en %
                if (vals[i].indexOf('%') > -1) {
                    vals[i] = vals[i].substr(0, vals[i].length - 1) / 100;
                } else {
                    vals[i] = vals[i] / 255
                }
                vals[i] = (vals[i]).toFixed(3); // limite à 3 décimales
            }
            // transparence
            if (vals[3] != undefined) {
                // possibité d'un %
                if (vals[3].indexOf('%') > -1) {
                    vals[3] = vals[3].substr(0, vals[3].length - 1) / 100;
                }
            }

            this._r = vals[0] / 1; // /1 permet de supprimer les 0 inutiles en décimale
            this._g = vals[1] / 1;
            this._b = vals[2] / 1;
            if (vals[3] != undefined) this._a = vals[3] / 1
        } catch (err) {
            console.error(err);
            return;
        }
    }

    _getValuesFromHex(input) {
        try {
            let hex = input.match(this.regexHex)[1];
            if (hex.length == 3) {
                // ramène à une chaîne de 6 caractères
                hex = hex.replace(/(.)(.)(.)/, '$1$1$2$2$3$3');
            }
            if (hex.length == 4) {
                // ramène à une chaîne de 8 caractères
                hex = hex.replace(/(.)(.)(.)(.)/, '$1$1$2$2$3$3$4$4');
            }
            if ((hex.length !== 6) && (hex.length !== 8)) {
                // le compte n'est pas bon : erreur TODO
                let err = new Error(`La chaîne "${input}" n'est pas correcte.`);
                throw err;
            }
            // Sépare les valeurs R,G,B,[A] et les renvoit sous forme de array
            const regex = /^(..)(..)(..)(..)?$/g;
            const matches = [...hex.matchAll(regex)];

            this._r = (parseInt('0x' + matches[0][1], 16) / 255).toFixed(3) / 1;
            this._g = (parseInt('0x' + matches[0][2], 16) / 255).toFixed(3) / 1;
            this._b = (parseInt('0x' + matches[0][3], 16) / 255).toFixed(3) / 1;
            if (matches[0][4] !== undefined) {
                this._a = (parseInt('0x' + matches[0][4], 16) / 255).toFixed(3) / 1;
            }
        } catch (err) {
            console.error(err);
            return;
        }
    }

    RGB() {
        let output = (this._a < 1) ? 'rgba(' : 'rgb(';
        output += Math.round(this._r * 255) + this.sep + Math.round(this._g * 255) + this.sep + Math.round(this._b * 255);
        if (this._a < 1) {
            output += this.sepAlpha + this._a;
        }
        output += ')';
        return output;
    }

    HSL() {
        let output = (this._a < 1) ? 'hsla(' : 'hsl(';
        output += this._h + this.sep + Math.round(this._s * 100) + '%' + this.sep + Math.round(this._l * 100) + '%';
        if (this._a < 1) {
            output += this.sepAlpha + this._a;
        }
        output += ')';
        return output;
    }
    
    HEX() {
        let r, g, b;
        r = Math.round(this._r * 255).toString(16);
        if (r.length == 1) r = '0' + r;
        g = Math.round(this._g * 255).toString(16);
        if (g.length == 1) g = '0' + g;
        b = Math.round(this._b * 255).toString(16);
        if (b.length == 1) b = '0' + b;
        let output = r + g + b;
        if (this._a < 1) output += Math.round(this._a * 255).toString(16);
        // on essaye de compacter le code sur 3/4 caractères si c'est possible
        const regex = /^(.)\1(.)\2(.)\3(?:(.)\4)?$/g;
        const matches = [...output.matchAll(regex)];
        if (matches.length > 0){
            output = matches[0][1] + matches[0][2] + matches[0][3];
            if (this._a < 1) output += matches[0][4];
        }
        return '#' + output;
    }
}