class LoadingScreen {

    constructor() {
        this.loader = document.getElementById("loader");
        if (!this.loader) {
            console.error("no element with id loader found");
            return;
        }
    }

    hide() {
        document.getElementById("loading-screen").style.display = "none";
    }

    update(xhr) {
        this.loader.style.width = `${(xhr.loaded / xhr.total) * window.innerWidth}px`;
    }
}

export default LoadingScreen;
