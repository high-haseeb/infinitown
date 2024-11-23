
class Config {
    constructor() {
        this.container = document.getElementById('config-container');
    }

    hide() {
        this.container.style.display = 'none';
    }

    addButton(title, onClick) {
        const configEl = document.createElement('div');
        configEl.classList.add('config-item');
        configEl.append(title);

        const label = document.createElement('label');
        label.classList.add('switch');
        const input = document.createElement('input');
        input.type = 'checkbox';
        const span = document.createElement('span');
        span.classList.add('slider', 'round');
        label.appendChild(input);
        label.appendChild(span);
        input.onclick = (s) => onClick(s.target.checked);

        configEl.appendChild(label);
        this.container.appendChild(configEl);
    }

    addRange(title, onChange, min = 1, max = 100, value = 5, step = 1) {
        const configEl = document.createElement('div');
        const rangeValue = document.createElement('div');
        rangeValue.style.width = '2rem';
        rangeValue.innerHTML = value;
        configEl.classList.add('config-item');
        configEl.append(title);
        const sliderEl = document.createElement('input');
        sliderEl.type = 'range';
        sliderEl.min = min;
        sliderEl.max = max;
        sliderEl.value = value;
        sliderEl.onmousemove = (s) => { 
            onChange(s.target.value) 
            rangeValue.innerHTML = s.target.value;
        };
        configEl.appendChild(sliderEl);
        configEl.appendChild(rangeValue);
        this.container.appendChild(configEl);

    }
}

const config = new Config();

export default config;
