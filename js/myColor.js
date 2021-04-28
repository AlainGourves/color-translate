// "use strict";
class MyColor {
    constructor() {
        // Valeurs normalisées sur l'intervalle [0,1]
        this._r;
        this._g;
        this._b;
        this._h; // intervalle [0,360]
        this._s;
        this._l;
        this._a = 1; // transparence default
        this._type; // 'rgb', 'hsl', 'hex'

        this.isError = false;
        this.isNamed = false;
        this.errorMessage;

        this.regexHex = /#([0-9a-f]{3,8})/i;
        this.regexRgb = /rgba?\((.*?)\)/i;
        this.regexHsl = /hsla?\((.*?)\)/i;
        this.regexColor = /^([a-z]{3,})$/i;

        this.container = document.querySelector('main');
        this.hexField = document.querySelector('#clr-hex');
        this.rgbField = document.querySelector('#clr-rgb');
        this.hslField = document.querySelector('#clr-hsl');
        this.colorInput = document.querySelector('#clr-input');
        this.settingsInput = document.querySelector('#settings');
        this.colorsList = document.querySelector('#colors-list')

        if (!this._loadSettings()) {
            this.settings = {
                'separator': true,
                'forceTransparency': false,
                'RGBPercentages': false,
                'HSLDegrees': false
            };
        }

        this.hexField.value = '';
        this.rgbField.value = '';
        this.hslField.value = '';

        // event listeners ------------------------------------
        // input
        this.colorInput.addEventListener('change', e => {
            this.updateColor(e.target.value);
        });
        this.colorInput.addEventListener('input', e => {
            if (this.isError) this._clearError();
            let q = e.target.value;
            let regex = /^[a-z]+$/i;
            if (q.length > 0 && regex.test(q)) {
                regex = new RegExp(`^${q}`, 'i');
                let matches = namedColors.filter(c => {
                    return regex.test(c);
                });
                if (matches.length > 0) {
                    this.colorsList.innerHTML = '';
                    let optionList = '';
                    for (let c of matches) {
                        optionList += '<option value="' + c + '"></option>';
                    }
                    this.colorsList.innerHTML = optionList;
                } else {
                    this.colorsList.innerHTML = '';
                }
            }
        });
        // auto-complétion des parenthèses
        this.colorInput.addEventListener('keydown', e => {
            if (e.key === '(' || e.key === 'Backspace') {
                let val = [...e.target.value];
                let pos = e.target.selectionStart;
                let changed = false;
                switch (e.key) {
                    case '(':
                        val.splice(pos, 0, ')');
                        changed = true;
                        break;
                    case 'Backspace':
                        let delenda = val[pos - 1];
                        if (delenda === '(' && val[pos] === ')') {
                            val.splice(pos, 1);
                            changed = true;
                        }
                        break;
                }
                if (changed) {
                    e.target.value = val.join('');
                    e.target.selectionEnd = pos;
                }
            }
        });
        // "Copy" buttons
        this.container.querySelectorAll('.copy').forEach(b => this._btnCopy(b));
        // settings
        this.settingsInput.addEventListener('change', e => {
            this._updateSettings(e.target.dataset.id)
        });

        // gestion langues pour les messages d'erreur
        this.lang = this._getLanguage();
        this.messages = {
            'badType': {
                'fr': "_ ne correspond à aucun type de couleur accepté.",
                'en': "_ doesn't match any accepted color type."
            },
            'badValue': {
                'fr': "Problème avec la valeur de _.",
                'en': "Problem with the value of _."
            },
            'noMatch': {
                'fr': "_ ne correspond à aucun pattern.",
                'en': "_ doesn't match any pattern."
            },
            'badHue': {
                'fr': "La valeur de Hue doit être comprise entre 0 et 360 (_).",
                'en': "The Hue value must be between 0 and 360."
            },
            'badSatLig': {
                'fr': "_ doit être un pourcentage.",
                'en': "_ must be a percentage."
            },
            'badInput': {
                'fr': "La longueur de la chaîne _ n'est pas correcte.",
                'en': "The length of the string _ is not correct."
            },
            'badColor': {
                'fr': "_ n'est pas un nom de couleur reconnu.",
                'en': "_ is not a known named color."
            }
        }
    }

    updateColor(input) {
        if (input.length > 0) {
            this._reset();
            try {
                if (this.regexHex.test(input)) {
                    this._type = 'hex'
                } else if (this.regexRgb.test(input)) {
                    this._type = 'rgb'
                } else if (this.regexHsl.test(input)) {
                    this._type = 'hsl'
                } else if (this.regexColor.test(input)) {
                    this._type = 'namedColor'
                } else {
                    let err = new Error(input);
                    err.name = 'badType';
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

                    case 'namedColor':
                        this._getValuesFromName(input);
                        this._rgb2hsl();
                        break;
                }

                const lastCheck = [this._r, this._g, this._b, this._h, this._s, this._l, this._a];
                const tags = ['R', 'G', 'B', 'H', 'S', 'L', 'A'];

                lastCheck.forEach((v, i) => {
                    if (isNaN(v)) {
                        let err = new Error(tags[i]);
                        err.name = 'badValue';
                        throw err;
                    }
                });

                this.update();
            } catch (err) {
                this._displayError(err.name, err.message);
                this._reset();
                return;
            }
        } else {
            this._reset();
        }
    }

    _reset() {
        this._r = undefined;
        this._g = undefined;
        this._b = undefined;
        this._h = undefined;
        this._s = undefined;
        this._l = undefined;
        this._a = 1;
        this._type = '';
        this.hexField.value = ''
        this.rgbField.value = '';
        this.hslField.value = '';
        if (this._isNamed) {
            this.container.querySelector('#leNamedColor').remove();
            this._isNamed = false;
        }
        this.container.classList.add('disabled');
        document.body.style.backgroundColor = 'var(--fondPage)';
    }

    update() {
        this.hexField.value = this.HEX();
        this.rgbField.value = this.RGB();
        this.hslField.value = this.HSL();
        let namedColor = this._getName();
        if (namedColor && this._type !== 'namedColor') {
            this._displayName(namedColor);
        }
        this.container.classList.remove('disabled');
        document.body.style.backgroundColor = this.HEX();
    }

    _hsl2rgb() {
        // les algorithmes viennent de https://en.wikipedia.org/wiki/HSL_and_HSV#Color_conversion_formulae
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
        if (chroma == 0) {
            this._h = 0;
        } else if (xmax == this._r) {
            this._h = 60 * (((this._g - this._b) / chroma) % 6);
        } else if (xmax == this._g) {
            this._h = 60 * (((this._b - this._r) / chroma + 2) % 6);
        } else if (xmax == this._b) {
            this._h = 60 * (((this._r - this._g) / chroma + 4) % 6);
        }
        this._h = Math.round(this._h);
        if (this._h < 0) this._h += 360;
        this._l = (xmax + xmin) / 2;
        this._s = (xmax == 0 || this._l == 1) ? 0 : chroma / (1 - Math.abs(2 * xmax - chroma - 1));
    }

    _getValues(input) {
        const regex = /(\d+\.?\d*(?:%|deg)?)[,| ]\s*(\d+\.?\d*\%?)[,| ]\s*(\d+\.?\d*\%?)\s*[,|/]?\s*(\d*[.|%]\d*)?/gi; // (?:...) parenthèse non capturante
        const result = [...input.matchAll(regex)];
        if (result.length > 0) {
            return result[0].slice(1); // l'item 0 contient la chaîne qui matche tout le regex, on en n'a pas besoin
        } else {
            let err = new Error(input);
            err.name = 'noMatch';
            throw err;
        }
    }

    _getValuesFromHSL(input) {
        let vals = this._getValues(input);

        // H est dans l'intervalle 0-360 (et pas un %)
        if (vals[0].indexOf('%') != -1 || vals[0] < 0 || vals[0] > 360) {
            let err = new Error(vals[0]);
            err.name = 'badHue';
            throw err;
        } else if (vals[0].toLowerCase().indexOf('deg') != -1) {
            // Supprime le 'deg' s'il est présent
            vals[0] = vals[0].substr(0, vals[0].toLowerCase().indexOf('deg'));
        }

        for (let i = 1; i < 3; i++) {
            // S et L doivent être des %
            if (vals[i].indexOf('%') == -1) {
                let err = new Error(vals[i]);
                err.name = 'badSatLig';
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
        if (this._l == 1 || this.l == 0) {
            // Blanc et Noir : si L = 100% (blanc) ou 0% (noir), H & S =0
            this._h = 0;
            this._s = 0;
        }
        if (vals[3] != undefined) this._a = vals[3] / 1
    }

    _getValuesFromRGB(input) {
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
    }

    _getValuesFromHex(input) {
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
            let err = new Error(input);
            err.name = 'badInput';
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
    }

    _getValuesFromName(input) {
        let name = input.match(this.regexColor)[1];
        // Vérifier que c'est bien une couleur nommée
        let idx = namedColors.findIndex(e => {
            return (e === name);
        });
        if (idx !== -1) {
            this._r = (namedColors_r[idx] / 255).toFixed(4) / 1;
            this._g = (namedColors_g[idx] / 255).toFixed(4) / 1;
            this._b = (namedColors_b[idx] / 255).toFixed(4) / 1;
        } else {
            let err = new Error(name);
            err.name = 'badColor';
            throw err;
        }
    }

    RGB() {
        let sep = (this.settings.separator) ? ', ' : ' ';
        let sepAlpha = (sep == ', ') ? ', ' : ' / ';

        let output = (this._a < 1 || this.settings.forceTransparency) ? 'rgba(' : 'rgb(';
        if (this.settings.RGBPercentages) {
            output += Math.round(this._r * 100) + '%' + sep + Math.round(this._g * 100) + '%' + sep + Math.round(this._b * 100) + '%';
        } else {
            output += Math.round(this._r * 255) + sep + Math.round(this._g * 255) + sep + Math.round(this._b * 255);
        }
        if (this._a < 1 || this.settings.forceTransparency) {
            output += sepAlpha + this._a;
        }
        output += ')';
        return output;
    }

    HSL() {
        let sep = (this.settings.separator) ? ', ' : ' ';
        let sepAlpha = (sep == ', ') ? ', ' : ' / ';
        let deg = (this.settings.HSLDegrees) ? 'deg' : '';

        let output = (this._a < 1 || this.settings.forceTransparency) ? 'hsla(' : 'hsl(';
        output += this._h + deg + sep + ((this._s * 100).toFixed(1) / 1) + '%' + sep + ((this._l * 100).toFixed(1) / 1) + '%';
        if (this._a < 1 || this.settings.forceTransparency) {
            output += sepAlpha + this._a;
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
        if (this._a < 1 || this.settings.forceTransparency) output += Math.round(this._a * 255).toString(16);
        // on essaye de compacter le code sur 3/4 caractères si c'est possible
        const regex = /^(.)\1(.)\2(.)\3(?:(.)\4)?$/g;
        const matches = [...output.matchAll(regex)];
        if (matches.length > 0) {
            output = matches[0][1] + matches[0][2] + matches[0][3];
            if (this._a < 1 || this.settings.forceTransparency) output += matches[0][4];
        }
        return '#' + output;
    }

    _updateSettings(what) {
        // el contient l'id de l'input modifié
        const el = document.querySelector(`#${what}`)

        if (what === 'check-val' || what === 'check-trans') {
            let grandPa = el.parentElement.parentElement;
            let choices = grandPa.querySelectorAll('.choice');
            if (what === 'check-val') {
                this.settings.separator = el.checked;
            }
            if (el.checked) {
                choices[0].classList.remove('disabled');
                choices[1].classList.add('disabled');
            } else {
                choices[0].classList.add('disabled');
                choices[1].classList.remove('disabled');
            }
        } else if (what === 'force-trans') {
            this.settings.forceTransparency = el.checked;
        } else if (what === 'rgb-perc') {
            this.settings.RGBPercentages = el.checked;
        } else if (what === 'hsl-deg') {
            this.settings.HSLDegrees = el.checked;
        }
        // enregistrement localStorage
        localStorage.setItem("settings", JSON.stringify(this.settings));
        if (this._r !== undefined) {
            this.update();
        }
    }

    _loadSettings() {
        // chargement localStorage
        if (localStorage.getItem("settings")) {
            this.settings = JSON.parse(localStorage.getItem("settings"));
            // Màj des inputs
            const el = document.querySelector('#settings');
            el.querySelector('#check-val').checked = this.settings.separator;
            el.querySelector('#force-trans').checked = this.settings.forceTransparency;
            el.querySelector('#rgb-perc').checked = this.settings.RGBPercentages;
            el.querySelector('#hsl-deg').checked = this.settings.HSLDegrees;
            return true;
        } else {
            return false;
        }
    }

    _getLanguage() {
        const l = navigator.language;
        if ((/^fr/i).test(l)) {
            return 'fr'
        } else {
            return 'en'
        }
    }

    _displayError(errName, errValue) {
        const template = document.getElementById('tmpl_error');
        const clone = template.content.firstElementChild.cloneNode(true);
        let message = this.messages[errName][this.lang];
        let insert = `<span>${errValue}</span>`;
        message = message.replace('_', insert);
        clone.querySelector('p').innerHTML = message;
        this.isError = true;
        // insère en tant que 2e enfant de <main>
        const sections = this.container.querySelectorAll('section');
        this.errorMessage = this.container.insertBefore(clone, sections[1]);
        this.container.classList.add('error');
    }

    _clearError() {
        if (this.isError) {
            this.errorMessage.addEventListener('transitionend', e => {
                e.target.remove();
            }, {
                once: true
            })
        }
        this.container.classList.remove('error');
    }

    _getName() {
        let r = Math.round(this._r * 255);
        let g = Math.round(this._g * 255);
        let b = Math.round(this._b * 255);
        // liste les index des couleurs nommées dont la valeur de R correspond
        // (c'est pour R qu'il y a le moins de valeurs différentes)
        let sameR = namedColors_r.reduce((arr, x, idx) => {
            if (x === r) arr.push(idx);
            return arr;
        }, [] /*Accumulator to store the found indexes.*/ );
        if (sameR.length > 0) {
            // cherche les couleurs où G correspond aussi
            let sameG = [];
            sameR.forEach(x => {
                if (namedColors_g[x] === g) sameG.push(x)
            });
            if (sameG.length > 0) {
                // Cherche si une valeur correspond aussi à B
                for (let i = 0; i < sameG.length; i++) {
                    // pas de forEach() => on ne peut pas en sortir avant la fin
                    if (namedColors_b[sameG[i]] === b) {
                        // renvoit la première correspondance
                        //(ne tient pas compte des synomnymes : 'gray'/'grey')
                        return namedColors[sameG[i]];
                    }
                }
                return false;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    _displayName(name) {
        // Affiche une nouvelle section pour les couleurs nommées
        const template = document.getElementById('tmpl_namedColor');
        const clone = template.content.firstElementChild.cloneNode(true);
        clone.querySelector('[type="text"').value = name;
        this._btnCopy(clone.querySelector('button.copy'));
        this.container.appendChild(clone);
        this._isNamed = true;
    }

    _btnCopy(btn) {
        btn.addEventListener('click', e => {
            const duration = window.getComputedStyle(e.target).transitionDuration;
            const parent = e.target.parentElement;
            const field = parent.querySelector('input[type=text]');
            const t = field.value;
            if (t.length > 0) {
                e.target.style.transitionDuration = '1s';
                e.target.classList.add('copied'); // start animation
                this._toClipboard(t); // copying
                e.target.addEventListener('transitionend', _ => {
                    e.target.style.transitionDuration = duration; //restore initial value
                    e.target.classList.remove('copied');
                }, {
                    once: true
                });
            }
        });
    }

    async _toClipboard(code) {
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(code);
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        } else {
            // alternative method with `document.execCommand('copy')`
            const pasteboard = document.createElement('input');
            pasteboard.setAttribute('readonly', 'readonly');
            pasteboard.className = 'hidden';
            pasteboard.value = code;
            document.body.appendChild(pasteboard);
            // save & restore user's selection
            const selected = (document.getSelection().rangeCount > 0) ? document.getSelection().getRangeAt(0) : false;
            pasteboard.select();
            const result = document.execCommand('copy');
            document.body.removeChild(pasteboard);
            if (selected) {
                document.getSelection().removeAllRanges();
                document.getSelection().addRange(selected);
            }
        }
    }

}