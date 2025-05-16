<script setup>
  const emit = defineEmits([
    'close',
  ])
</script>

<template>
  <div class="wild-heist-popup wild-heist-popup--paytable">
    <div class="wild-heist-popup__header">
      <h2 class="wild-heist-popup__title">Paytable</h2>
      <button class="wild-heist-popup__close"
        @click = "emit('close')"
      >
      </button>
    </div>
    <div class="wild-heist-popup__content scrollbar">
      <h2 class="wild-heist-popup__subhead">Выплаты за символ</h2>
      <div class="wild-heist-symbols">
        <div class="wild-heist-symbol">
          <div class="wild-heist-symbol-ico wild-heist-symbol-ico--wild"></div>
          <p class="wild-heist-symbol__name">Символ Wild</p>
        </div>
        <div class="wild-heist-symbol">
          <div class="wild-heist-symbol-ico wild-heist-symbol-ico--scatter"></div>
          <p class="wild-heist-symbol__name">Символ Scatter</p>
        </div>

        <div class="wild-heist-symbol">
          <div class="wild-heist-symbol-ico wild-heist-symbol-ico--cowboy"></div>
          <ol class="wild-heist-symbol-list">
            <li class="wild-heist-symbol-list__item">10</li>
            <li class="wild-heist-symbol-list__item">20</li>
            <li class="wild-heist-symbol-list__item">30</li>
            <li class="wild-heist-symbol-list__item">50</li>
          </ol>
        </div>
        <div class="wild-heist-symbol">
          <div class="wild-heist-symbol-ico wild-heist-symbol-ico--gun"></div>
          <ol class="wild-heist-symbol-list">
            <li class="wild-heist-symbol-list__item">10</li>
            <li class="wild-heist-symbol-list__item">20</li>
            <li class="wild-heist-symbol-list__item">30</li>
            <li class="wild-heist-symbol-list__item">50</li>
          </ol>
        </div>


        <div class="wild-heist-symbol">
          <div class="wild-heist-symbol-ico wild-heist-symbol-ico--hat"></div>
          <ol class="wild-heist-symbol-list">
            <li class="wild-heist-symbol-list__item">10</li>
            <li class="wild-heist-symbol-list__item">20</li>
            <li class="wild-heist-symbol-list__item">30</li>
            <li class="wild-heist-symbol-list__item">50</li>
          </ol>
        </div>
        <div class="wild-heist-symbol">
          <div class="wild-heist-symbol-ico wild-heist-symbol-ico--whiskey"></div>
          <ol class="wild-heist-symbol-list">
            <li class="wild-heist-symbol-list__item">10</li>
            <li class="wild-heist-symbol-list__item">20</li>
            <li class="wild-heist-symbol-list__item">30</li>
            <li class="wild-heist-symbol-list__item">50</li>
          </ol>
        </div>

        <div class="wild-heist-symbol">
          <div class="wild-heist-symbol-ico wild-heist-symbol-ico--letter-a"></div>
          <ol class="wild-heist-symbol-list">
            <li class="wild-heist-symbol-list__item">10</li>
            <li class="wild-heist-symbol-list__item">20</li>
            <li class="wild-heist-symbol-list__item">30</li>
            <li class="wild-heist-symbol-list__item">50</li>
          </ol>
        </div>
        <div class="wild-heist-symbol">
          <div class="wild-heist-symbol-ico wild-heist-symbol-ico--letter-k"></div>
          <ol class="wild-heist-symbol-list">
            <li class="wild-heist-symbol-list__item">10</li>
            <li class="wild-heist-symbol-list__item">20</li>
            <li class="wild-heist-symbol-list__item">30</li>
            <li class="wild-heist-symbol-list__item">50</li>
          </ol>
        </div>

        <div class="wild-heist-symbol">
          <div class="wild-heist-symbol-ico wild-heist-symbol-ico--letter-q"></div>
          <ol class="wild-heist-symbol-list">
            <li class="wild-heist-symbol-list__item">10</li>
            <li class="wild-heist-symbol-list__item">20</li>
            <li class="wild-heist-symbol-list__item">30</li>
            <li class="wild-heist-symbol-list__item">50</li>
          </ol>
        </div>
        <div class="wild-heist-symbol">
          <div class="wild-heist-symbol-ico wild-heist-symbol-ico--letter-j"></div>
          <ol class="wild-heist-symbol-list">
            <li class="wild-heist-symbol-list__item">10</li>
            <li class="wild-heist-symbol-list__item">20</li>
            <li class="wild-heist-symbol-list__item">30</li>
            <li class="wild-heist-symbol-list__item">50</li>
          </ol>
        </div>
      </div>
      <ol class="wild-heist-popup__list wild-heist-popup-list">
        <li class="wild-heist-popup-list__item">Символ Wild заменяет все символы, кроме символа Scatter.</li>
        <li class="wild-heist-popup-list__item">Символы в позолоченной рамке выпадают только на барабанах 3 и 4.</li>
        <li class="wild-heist-popup-list__item">В игре используется базовая ставка со значением 20
          и 3.600 способа выигрыша (фиксированных), уровень ставки от 1 до 10 и размер ставки от 0,01 до 0,50.</li>
      </ol>
      <h3 class="wild-heist-popup__subtitle">Символы в позолоченной рамке</h3>
      <div class="wild-heist-popup__pic"></div>
      <ol class="wild-heist-popup__list wild-heist-popup-list">
        <li class="wild-heist-popup-list__item">Во время любого вращения некоторые символы (кроме символов Wild и Scatter) на барабанах 3 и/или 4 могут появляться в позолоченной рамке.</li>
        <li class="wild-heist-popup-list__item">После того как сверху на поле выпали новые символы, каждый символ в позолоченной рамке, вошедший в выигрышную комбинацию в предыдущем вращении, трансформируется в символ Wild.</li>
      </ol>
      <h3 class="wild-heist-popup__subtitle">Множитель</h3>
      <div class="wild-heist-popup__coeff">
        <picture>
          <!--<source srcset="/VUI/factor.webp" />-->
          <!--<img src="/VUI/factor.png" class="wild-heist-img" alt="" />-->
        </picture>
      </div>
      <ol class="wild-heist-popup__list wild-heist-popup-list">
        <li class="wild-heist-popup-list__item">В начале любого вращения основной игры множитель выигрыша равен х1.</li>
        <li class="wild-heist-popup-list__item">Если во время любого вращения на барабанах выпадает один или несколько выигрышных символов, то после выплаты выигрышей и выпадения новых символов множитель выигрыша удваивается.</li>
        <li class="wild-heist-popup-list__item">Максимальный множитель выигрыша составляет x1.024.</li>
      </ol>
      <h3 class="wild-heist-popup__subtitle">Бесплатные вращения</h3>
      <div class="wild-heist-popup__scatter"></div>
      <ol class="wild-heist-popup__list wild-heist-popup-list">
        <li class="wild-heist-popup-list__item">3 символа Scatter, выпадающие в любом месте, активируют бонусный раунд бесплатных игр с 10 бесплатными вращениями. Каждый дополнительный символ Scatter активирует еще 2 бесплатные игры.</li>
        <li class="wild-heist-popup-list__item">В начале каждого бесплатного вращения множитель выигрыша равен х8.</li>
        <li class="wild-heist-popup-list__item">Если во время любого бесплатного вращения на барабанах появляются один или несколько выигрышных символов, то после выплаты выигрышей и выпадения новых символов множитель выигрыша удваивается.</li>
        <li class="wild-heist-popup-list__item">Бесплатные вращения могут быть активированы повторно.</li>
      </ol>
      <h3 class="wild-heist-popup__subtitle">Максимальный выигрыш</h3>
      <p class="wild-heist-popup__text">Максимальная сумма выигрыша составляет 5.000х от суммы ставки.</p>

      <h3 class="wild-heist-popup__subtitle">Покупка бонусного раунда</h3>
      <div class="wild-heist-popup__bonus">
        <picture>
          <!--<source srcset="/VUI/btn-bonus.webp" />
          <img src="/VUI/btn-bonus.png" class="wild-heist-img" alt="" />-->
        </picture>
      </div>
      <ol class="wild-heist-popup__list wild-heist-popup-list">
        <li class="wild-heist-popup-list__item">Нажмите на кнопку "Покупка бонусного раунда", чтобы открыть меню "Покупка бонусного раунда".</li>
        <li class="wild-heist-popup-list__item">Нажмите на нопку "Начать", чтобы купить Бесплатные спины по цене, указанной в меню "Покупка бонусного раунда".</li>
      </ol>


      <h3 class="wild-heist-popup__subtitle">3 600 способа выигрыша</h3>
      <ol class="wild-heist-popup__list wild-heist-popup-list">
        <li class="wild-heist-popup-list__item">
          <p>
            Выигрышной комбинацией считаются последовательно выпавшие выигрышные символы, начиная с крайнего левого барабана.
          </p>
          <div class="wild-heist-popup__winlines">
            <picture>
              <!-- <source srcset="/VUI/win-comb.webp" />
              <img src="/VUI/win-comb.png" class="wild-heist-img" alt="" /> -->
            </picture>
          </div>
        </li>
        <li class="wild-heist-popup-list__item">
          <p>
            Общее количество выигрышных комбинаций для каждого символа рассчитывается путем умножения количества последовательных выигрышных символов для каждого символа, начиная с крайнего левого барабана.
          </p>
          <p class="wild-heist-popup__text">Из приведенного выше примера:</p>
          <p class="wild-heist-popup__text wild-heist-popup__text--gold">2 * 2 * 2 = 8</p>
        </li>
        <li class="wild-heist-popup-list__item">
          <p>Выплата по выигрышным символам умножается на количество выигрышных комбинаций.</p>
          <div class="wild-heist-popup-dop">
            <div class="wild-heist-popup-dop-left">
              <div class="wild-heist-popup-dop-ico"></div>
              <ol class="wild-heist-popup-dop-list">
                  <li class="wild-heist-popup-dop-list__item wild-heist-popup-dop-list__item--gold">10</li>
                  <li class="wild-heist-popup-dop-list__item">20</li>
                  <li class="wild-heist-popup-dop-list__item">20</li>
                  <li class="wild-heist-popup-dop-list__item">30</li>
              </ol>
            </div>
            <div class="wild-heist-popup-dop-right">
              <p class="wild-heist-popup__text wild-heist-popup__text--gray">
                Общая сумма
                <span>выигрышей в этом примере:</span>
              </p>
              <p class="wild-heist-popup__text wild-heist-popup__text--gold">10*8 = 80</p>
            </div>
          </div>
        </li>
        <li class="wild-heist-popup-list__item">После выплат за каждый раунд все выигрышные символы взрываются, а символы, которые находились над ними, падают каскадом вниз для нового раунда.</li>
        <li class="wild-heist-popup-list__item">Следующие выигрышные комбинации учитываются в каждом раунде до тех пор, пока на барабанах не останется ни одной выигрышной комбинации.</li>
        <li class="wild-heist-popup-list__item">Все выигрыши отображаются в денежном эквиваленте.</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
  .wild-heist-popup--paytable {
    width: 1200px;
		height: 2000px;
    background-color: #30303b;
  }
</style>
