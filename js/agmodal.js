class AgModal{
    constructor(el){
        this.el = document.querySelector(el);
        this.closeDiv = this.el.querySelector('span.modal-close');
        if (!this.closeDiv){
            this.closeDiv = document.createElement('div');
            this.closeDiv.classList.add('modal-close');
            this.el.prepend(this.closeDiv);
        }
        this.overlay = document.querySelector('#overlay');
        if (!this.overlay){
            this.overlay = document.createElement('div');
            this.overlay.id = "overlay";
            document.body.append(this.overlay);
        }
        this.escListener = this.onEscKey.bind(this);
        this.closeDivEvt = this.close.bind(this);
    }

    open(){
        document.body.classList.add('modal-on');
        this.el.style.display = 'grid';
        window.setTimeout(_=>{
            this.overlay.style.display = 'block';
            this.el.classList.add('modal-open');
        },50);
        this.overlay.addEventListener(
            'click',
            this.closeDivEvt
        );
        this.closeDiv.addEventListener(
            'click',
            this.closeDivEvt
        );
        window.addEventListener(
            'keydown',
            this.escListener
        );
    }
            
    close(){
        this.closeDiv.removeEventListener(
            'click',
            this.closeDivEvt
        );
        this.overlay.removeEventListener(
            'click',
            this.closeDivEvt
        );
        let that = this;
        window.removeEventListener('keydown', this.escListener);
        this.el.classList.remove('modal-open');
        this.el.addEventListener('transitionend', e =>{
            that.el.style.display = 'none';
            that.overlay.style.display = 'none';
            document.body.classList.remove('modal-on');
        }, {once: true});
    }

    onEscKey(e){
        if (e.key === "Escape") {
            this.close();
        }
    }
}