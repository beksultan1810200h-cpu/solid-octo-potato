<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>businessbot.kg — WhatsApp AI</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <!-- AUTH -->
    <div id="auth" class="auth-wrap">
      <div class="auth-card">
        <div class="brand"><span class="dot"></span> businessbot.kg</div>

        <!-- login -->
        <form id="loginForm" class="pane">
          <h2>Вход</h2>
          <input name="username" placeholder="Логин или email" autocomplete="username" />
          <input name="password" type="password" placeholder="Пароль" autocomplete="current-password" />
          <button type="submit">Войти</button>
          <p class="switch">Нет аккаунта? <a data-go="register">Регистрация</a></p>
          <div class="err" data-err></div>
        </form>

        <!-- register -->
        <form id="registerForm" class="pane hidden">
          <h2>Регистрация</h2>
          <input name="username" placeholder="Логин" />
          <input name="email" type="email" placeholder="Ваш email" />
          <input name="password" type="password" placeholder="Пароль (мин. 8 символов)" />
          <select name="niche">
            <option value="stroyka">Стройматериалы</option>
            <option value="sushi">Суши / доставка еды</option>
            <option value="clothes">Одежда</option>
            <option value="tech">Электроника</option>
          </select>
          <button type="submit">Получить код</button>
          <p class="switch">Уже есть аккаунт? <a data-go="login">Вход</a></p>
          <div class="err" data-err></div>
        </form>

        <!-- verify -->
        <form id="verifyForm" class="pane hidden">
          <h2>Подтверждение</h2>
          <p class="hint">Код из 6 символов отправлен администратору. Введите его и выберите срок действия аккаунта.</p>
          <input name="code" placeholder="Код (6 символов)" maxlength="6" style="text-transform:uppercase;letter-spacing:6px;text-align:center" />
          <label class="lbl">Срок действия аккаунта</label>
          <div class="plans">
            <label><input type="radio" name="plan" value="1m" checked /> 1 месяц</label>
            <label><input type="radio" name="plan" value="1y" /> 1 год</label>
          </div>
          <button type="submit">Активировать</button>
          <div class="err" data-err></div>
        </form>
      </div>
    </div>

    <!-- APP -->
    <div id="app" class="app hidden">
      <aside class="side">
        <div class="side-top">
          <div class="brand"><span class="dot"></span> businessbot.kg</div>
          <button id="logoutBtn" class="ghost">Выйти</button>
        </div>
        <div id="account" class="account"></div>
        <div id="connectBox" class="connect">
          <div id="waStatus" class="wa-status">Статус: не подключён</div>
          <div id="qrBox" class="qr"></div>
          <button id="connectBtn">Подключить WhatsApp</button>
        </div>
        <div id="chatList" class="chat-list"></div>
      </aside>

      <main class="main">
        <div id="chatHeader" class="chat-header hidden">
          <div id="chatTitle"></div>
          <label class="ap"><input type="checkbox" id="autopilot" checked /> Автопилот (ИИ)</label>
        </div>
        <div id="messages" class="messages">
          <div class="empty">Выберите чат или подключите WhatsApp</div>
        </div>
        <form id="sendForm" class="send hidden">
          <input id="sendInput" placeholder="Сообщение оператора…" autocomplete="off" />
          <button type="submit">Отправить</button>
        </form>
      </main>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script src="/app.js"></script>
  </body>
</html>
