(() => {
  'use strict';

  const T = window.JABARA_TABLE;
  const $ = id => document.getElementById(id);

  const state = {
    material: 'SUS201',
    height: 'H1200',
    wheel: '앵글바퀴'
  };

  const e = {
    materialOptions: $('materialOptions'),
    heightOptions: $('heightOptions'),
    wheelOptions: $('wheelOptions'),
    length: $('length'),
    qty: $('qty'),
    minus: $('minus'),
    plus: $('plus'),
    meterText: $('meterText'),
    total: $('total'),
    materialText: $('materialText'),
    heightText: $('heightText'),
    wheelText: $('wheelText'),
    lengthText: $('lengthText'),
    baseRateText: $('baseRateText'),
    wheelRateText: $('wheelRateText'),
    meterRateText: $('meterRateText'),
    qtyText: $('qtyText'),
    guideText: $('guideText'),
    copy: $('copy'),
    toggleTable: $('toggleTable'),
    tables: $('tables')
  };

  function comma(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function won(n) {
    return comma(n) + '원';
  }

  function selectedWheel() {
    return T.wheels.find(w => w.name === state.wheel) || T.wheels[0];
  }

  function renderOptions() {
    e.materialOptions.innerHTML = '';
    e.heightOptions.innerHTML = '';
    e.wheelOptions.innerHTML = '';

    T.materials.forEach(value => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'optBtn';
      btn.dataset.value = value;
      btn.textContent = value;
      btn.onclick = () => { state.material = value; active(); calculate(); };
      e.materialOptions.appendChild(btn);
    });

    T.heights.forEach(value => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'optBtn';
      btn.dataset.value = value;
      btn.textContent = value;
      btn.onclick = () => { state.height = value; active(); calculate(); };
      e.heightOptions.appendChild(btn);
    });

    T.wheels.forEach(wheel => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'optBtn';
      btn.dataset.value = wheel.name;
      btn.textContent = wheel.name;
      btn.onclick = () => { state.wheel = wheel.name; active(); calculate(); };
      e.wheelOptions.appendChild(btn);
    });

    active();
  }

  function active() {
    [...e.materialOptions.children].forEach(btn => btn.classList.toggle('isActive', btn.dataset.value === state.material));
    [...e.heightOptions.children].forEach(btn => btn.classList.toggle('isActive', btn.dataset.value === state.height));
    [...e.wheelOptions.children].forEach(btn => btn.classList.toggle('isActive', btn.dataset.value === state.wheel));
  }

  function reset(qty) {
    e.total.textContent = '0원';
    e.meterText.textContent = '0.00m';
    e.materialText.textContent = state.material;
    e.heightText.textContent = state.height;
    e.wheelText.textContent = state.wheel;
    e.lengthText.textContent = '길이를 입력해주세요';
    e.baseRateText.textContent = won(T.prices[state.material][state.height]);
    e.wheelRateText.textContent = won(selectedWheel().addPerM) + '/m';
    e.meterRateText.textContent = won(T.prices[state.material][state.height] + selectedWheel().addPerM);
    e.qtyText.textContent = qty + '대';
    e.guideText.textContent = '길이를 입력하면 예상 견적이 자동 계산됩니다.';
  }

  function calculate() {
    const raw = String(e.length.value).trim();
    const qty = Math.max(1, Number(e.qty.value || 1));

    if (!raw) {
      reset(qty);
      return { lengthMm: 0, meter: 0, qty, baseRate: T.prices[state.material][state.height], wheelRate: selectedWheel().addPerM, meterRate: T.prices[state.material][state.height] + selectedWheel().addPerM, total: 0 };
    }

    const lengthMm = Math.max(0, Number(raw));
    const meter = lengthMm / 1000;
    const baseRate = T.prices[state.material][state.height];
    const wheelRate = selectedWheel().addPerM;
    const meterRate = baseRate + wheelRate;
    const unitTotal = meter * meterRate;
    const total = unitTotal * qty;

    e.total.textContent = won(total);
    e.meterText.textContent = meter.toFixed(2) + 'm';
    e.materialText.textContent = state.material;
    e.heightText.textContent = state.height;
    e.wheelText.textContent = state.wheel;
    e.lengthText.textContent = `${lengthMm}mm / ${meter.toFixed(2)}m`;
    e.baseRateText.textContent = won(baseRate);
    e.wheelRateText.textContent = won(wheelRate) + '/m';
    e.meterRateText.textContent = won(meterRate);
    e.qtyText.textContent = qty + '대';
    e.guideText.textContent = `${state.material} ${state.height} 기준, ${state.wheel} 사양으로 계산된 예상 견적입니다.`;

    return { lengthMm, meter, qty, baseRate, wheelRate, meterRate, unitTotal, total };
  }

  async function copyEstimate() {
    const r = calculate();
    const text = `강동자바라 자바라 견적 문의\n\n재질: ${state.material}\n높이: ${state.height}\n바퀴: ${state.wheel}\n길이: ${r.lengthMm}mm / ${r.meter.toFixed(2)}m\n수량: ${r.qty}대\n1m 기본단가: ${won(r.baseRate)}\n바퀴 추가단가: ${won(r.wheelRate)}/m\n적용 1m 단가: ${won(r.meterRate)}\n예상금액: ${won(r.total)}\n\n※ 운임·시공비 별도\n문의: 010-7595-0484\n네이버 톡톡: https://talk.naver.com/ct/w4a85f?frm=psf`;

    try {
      await navigator.clipboard.writeText(text);
      alert('견적내용이 복사되었습니다.');
    } catch (err) {
      prompt('아래 내용을 복사해주세요.', text);
    }
  }

  function bind() {
    e.length.addEventListener('input', calculate);
    e.qty.addEventListener('input', calculate);
    e.minus.onclick = () => { e.qty.value = Math.max(1, Number(e.qty.value || 1) - 1); calculate(); };
    e.plus.onclick = () => { e.qty.value = Number(e.qty.value || 1) + 1; calculate(); };
    e.copy.onclick = copyEstimate;
    e.toggleTable.onclick = () => e.tables.classList.toggle('open');
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderOptions();
    bind();
    calculate();
  });
})();
