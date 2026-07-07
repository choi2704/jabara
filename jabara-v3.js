(() => {
  'use strict';
  const T = window.JABARA_TABLE;
  const $ = id => document.getElementById(id);

  const state = {
    type: '일반형',
    open: '편개형',
    material: 'SUS201',
    height: 'H1200',
    wheel: '앵글바퀴',
    houseHeight: '1350',
    houseMaterial: 'SUS201',
    houseDepthIndex: 0
  };

  const e = {
    typeOptions: $('typeOptions'), openOptions: $('openOptions'), materialOptions: $('materialOptions'), heightOptions: $('heightOptions'), wheelOptions: $('wheelOptions'),
    length: $('length'), qty: $('qty'), minus: $('minus'), plus: $('plus'), meterText: $('meterText'),
    houseUse: $('houseUse'), housePanel: $('housePanel'), houseHeightOptions: $('houseHeightOptions'), houseMaterialOptions: $('houseMaterialOptions'), houseDepthOptions: $('houseDepthOptions'),
    total: $('total'), typeText: $('typeText'), openText: $('openText'), materialText: $('materialText'), heightText: $('heightText'), wheelText: $('wheelText'), lengthText: $('lengthText'),
    meterRateText: $('meterRateText'), jabaraTotalText: $('jabaraTotalText'), houseText: $('houseText'), housePriceText: $('housePriceText'), qtyText: $('qtyText'), guideText: $('guideText'),
    copy: $('copy'), toggleTable: $('toggleTable'), tables: $('tables'), jabaraTable: $('jabaraTable'), houseTable: $('houseTable')
  };

  function comma(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function won(n) { return n == null ? '별도문의' : comma(n) + '원'; }
  function selectedWheel() { return T.wheels.find(w => w.name === state.wheel) || T.wheels[0]; }
  function baseRate() { return T.prices[state.type][state.material][state.height]; }
  function meterRate() { return baseRate() + selectedWheel().addPerM; }
  function housePrice() {
    if (!e.houseUse.checked) return 0;
    return T.house.prices[state.houseHeight][state.houseMaterial][state.houseDepthIndex];
  }

  function makeBtn(container, value, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'optBtn';
    btn.dataset.value = value;
    btn.textContent = value;
    btn.onclick = onClick;
    container.appendChild(btn);
  }

  function renderOptions() {
    e.typeOptions.innerHTML = ''; e.openOptions.innerHTML = ''; e.materialOptions.innerHTML = ''; e.heightOptions.innerHTML = ''; e.wheelOptions.innerHTML = '';
    e.houseHeightOptions.innerHTML = ''; e.houseMaterialOptions.innerHTML = ''; e.houseDepthOptions.innerHTML = '';

    T.types.forEach(v => makeBtn(e.typeOptions, v, () => { state.type = v; active(); calculate(); }));
    ['편개형', '양개형'].forEach(v => makeBtn(e.openOptions, v, () => { state.open = v; active(); calculate(); }));
    T.materials.forEach(v => makeBtn(e.materialOptions, v, () => { state.material = v; active(); calculate(); }));
    T.heights.forEach(v => makeBtn(e.heightOptions, v, () => { state.height = v; active(); calculate(); }));
    T.wheels.forEach(w => makeBtn(e.wheelOptions, w.name, () => { state.wheel = w.name; active(); calculate(); }));

    T.house.heights.forEach(v => makeBtn(e.houseHeightOptions, v, () => { state.houseHeight = v; active(); calculate(); }));
    T.house.materials.forEach(v => makeBtn(e.houseMaterialOptions, v, () => { state.houseMaterial = v; active(); calculate(); }));
    T.house.depths.forEach((v, i) => makeBtn(e.houseDepthOptions, v, () => { state.houseDepthIndex = i; active(); calculate(); }));

    active();
  }

  function active() {
    [...e.typeOptions.children].forEach(b => b.classList.toggle('isActive', b.dataset.value === state.type));
    [...e.openOptions.children].forEach(b => b.classList.toggle('isActive', b.dataset.value === state.open));
    [...e.materialOptions.children].forEach(b => b.classList.toggle('isActive', b.dataset.value === state.material));
    [...e.heightOptions.children].forEach(b => b.classList.toggle('isActive', b.dataset.value === state.height));
    [...e.wheelOptions.children].forEach(b => b.classList.toggle('isActive', b.dataset.value === state.wheel));
    [...e.houseHeightOptions.children].forEach(b => b.classList.toggle('isActive', b.dataset.value === state.houseHeight));
    [...e.houseMaterialOptions.children].forEach(b => b.classList.toggle('isActive', b.dataset.value === state.houseMaterial));
    [...e.houseDepthOptions.children].forEach((b, i) => b.classList.toggle('isActive', i === state.houseDepthIndex));
  }

  function renderTables() {
    let html = '<tr><th>종류</th><th>재질</th><th>H1200</th><th>H1500</th></tr>';
    T.types.forEach(type => {
      T.materials.forEach(mat => {
        html += `<tr><td>${type}</td><td>${mat}</td><td>${won(T.prices[type][mat].H1200)}</td><td>${won(T.prices[type][mat].H1500)}</td></tr>`;
      });
    });
    e.jabaraTable.innerHTML = html;

    let h = '<tr><th>높이</th><th>깊이</th><th>SUS201</th><th>SUS304</th></tr>';
    T.house.heights.forEach(ht => {
      T.house.depths.forEach((depth, i) => {
        h += `<tr><td>${ht}</td><td>${depth}</td><td>${won(T.house.prices[ht].SUS201[i])}</td><td>${won(T.house.prices[ht].SUS304[i])}</td></tr>`;
      });
    });
    e.houseTable.innerHTML = h;
  }

  function reset(qty) {
    e.total.textContent = e.houseUse.checked && housePrice() === null ? '별도문의' : '0원';
    e.meterText.textContent = '0.00m';
    e.typeText.textContent = state.type;
    e.openText.textContent = state.open;
    e.materialText.textContent = state.material;
    e.heightText.textContent = state.height;
    e.wheelText.textContent = state.wheel;
    e.lengthText.textContent = '길이를 입력해주세요';
    e.meterRateText.textContent = won(meterRate());
    e.jabaraTotalText.textContent = '0원';
    updateHouseText();
    e.qtyText.textContent = qty + '대';
    e.guideText.textContent = '길이를 입력하면 예상 견적이 자동 계산됩니다.';
  }

  function updateHouseText() {
    if (!e.houseUse.checked) {
      e.houseText.textContent = '선택 안 함';
      e.housePriceText.textContent = '0원';
      return;
    }
    const depth = T.house.depths[state.houseDepthIndex];
    const hp = housePrice();
    e.houseText.textContent = `${state.houseHeight} / ${state.houseMaterial} / ${depth}`;
    e.housePriceText.textContent = won(hp);
  }

  function calculate() {
    const raw = String(e.length.value).trim();
    const qty = Math.max(1, Number(e.qty.value || 1));
    e.housePanel.classList.toggle('show', e.houseUse.checked);

    if (!raw) {
      reset(qty);
      return { lengthMm: 0, meter: 0, qty, jabaraTotal: 0, housePrice: housePrice(), total: 0 };
    }

    const inputLengthMm = Math.max(0, Number(raw));
    const lengthMm = inputLengthMm > 0 && inputLengthMm < 3000 ? 3000 : inputLengthMm;
    const meter = lengthMm / 1000;
    const mr = meterRate();
    const jabaraTotal = meter * mr * qty;
    const hp = housePrice();
    const total = hp === null ? null : jabaraTotal + hp;

    e.total.textContent = total === null ? '별도문의' : won(total);
    e.meterText.textContent = meter.toFixed(2) + 'm';
    e.typeText.textContent = state.type;
    e.openText.textContent = state.open;
    e.materialText.textContent = state.material;
    e.heightText.textContent = state.height;
    e.wheelText.textContent = state.wheel;
    e.lengthText.textContent = inputLengthMm < 3000 ? `${inputLengthMm}mm 입력 → 최소 3000mm 적용 / ${meter.toFixed(2)}m` : `${lengthMm}mm / ${meter.toFixed(2)}m`;
    e.meterRateText.textContent = won(mr);
    e.jabaraTotalText.textContent = won(jabaraTotal);
    updateHouseText();
    e.qtyText.textContent = qty + '대';
    e.guideText.textContent = total === null ? '선택하신 하우스 구간은 별도문의 대상입니다.' : (inputLengthMm < 3000 ? '최소 주문 길이 3000mm 기준으로 계산되었습니다.' : `${state.type} ${state.open} ${state.material} ${state.height} 기준으로 계산된 예상 견적입니다.`);

    return { lengthMm, inputLengthMm, meter, qty, meterRate: mr, jabaraTotal, housePrice: hp, total };
  }

  async function copyEstimate() {
    const r = calculate();
    const houseLine = e.houseUse.checked ? `${state.houseHeight} / ${state.houseMaterial} / ${T.house.depths[state.houseDepthIndex]} / ${won(r.housePrice)}` : '선택 안 함';
    const text = `강동자바라 자바라 견적 문의\n\n제품 종류: ${state.type}\n개폐 방식: ${state.open}\n재질: ${state.material}\n높이: ${state.height}\n바퀴: ${state.wheel}\n길이: ${r.inputLengthMm && r.inputLengthMm < 3000 ? r.inputLengthMm + 'mm 입력 → 최소 3000mm 적용' : r.lengthMm + 'mm'} / ${r.meter.toFixed(2)}m\n수량: ${r.qty}대\n적용 1m 단가: ${won(r.meterRate)}\n자바라 금액: ${won(r.jabaraTotal)}\n하우스 옵션: ${houseLine}\n총 예상금액: ${won(r.total)}\n\n※ 운임·시공비 별도\n문의: 010-7595-0484\n네이버 톡톡: https://talk.naver.com/ct/w4a85f?frm=psf`;

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
    e.houseUse.addEventListener('change', calculate);
    e.minus.onclick = () => { e.qty.value = Math.max(1, Number(e.qty.value || 1) - 1); calculate(); };
    e.plus.onclick = () => { e.qty.value = Number(e.qty.value || 1) + 1; calculate(); };
    e.copy.onclick = copyEstimate;
    e.toggleTable.onclick = () => e.tables.classList.toggle('open');
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderOptions();
    renderTables();
    bind();
    calculate();
  });
})();
