(function ($) {

  // Константы и необходимые определения

  // Основная функция
  $.fn.chat = function (options) {
    // Предустановки
    var settings = $.extend({
      partnerId: null,
      participants: null,
      socket: null
    }, options);

    var self = this; // Чтобы избежать ошибок при обращении в замыканиях

    if (settings.socket && typeof settings.socket === 'object'
      && settings.partnerId && settings.participants) // Проверка необходимых полей
    {
      // Обработка ошибок
      settings.socket.on('error', function (error) {
        // Проблемы с токеном
        if (error && error.type && error.type === 'UnauthorizedError') {
          console.error('Невозможно авторизовать пользователя, проверьте токен JWT');
          // TODO: Добавить какое-то уведомление для пользователя
        }
        // Не передали partnerId
        if (error === 'PartnerIdIsNotProvidedError') {
          console.error('Не был передан идентификатор собеседника');
        }
      });

      // Подключились к серверу
      settings.socket.on('connect', function () {
        if(settings.socket.connected) {
          console.log('Соединение с сервером успешно установлено');
          // Очищаем список сообщений
          self.find('ul.chat').html(null);
          sendGetMessagesRequest(0); // Отправляем запрос на получение последних сообщений
        }
      });

      // Потеряли подключение
      settings.socket.on('disconnect', function () {
        console.warn('Соединение с сервером потеряно')
      });

      // Отправить запрос на получение сообщений из переписки
      function sendGetMessagesRequest(page) { // Постраничная загрузка
        settings.socket.emit('GET_MESSAGES', page);
      }

      // Отправить сообщение в переписку по нажатию на кнопку отправить
      self.find('#btn-chat').click(function (e) {
        e.preventDefault();
        var msgInput = self.find('#btn-input');
        var msg = msgInput.val();
        if (msg.length) { // Если пользователь ввел сообщение
          settings.socket.emit('SEND_MESSAGE', msg); // Отправляем сообщение в сокет
          msgInput.val(null); // Очищаем поле ввода
        }
      });

      // Добавить HTML сообщения в чат
      function addMessageToChat (message, toTheEnd = true) {
        // Формируем html-код
        var isSentByMe = message.sender !== settings.partnerId;
        var align = isSentByMe ? 'left' : 'right'; // Проверяем, от кого сообщение
        var meOrPartner = isSentByMe ? 'me' : 'partner';
        var mHtml = [
          '<li class="clearfix ' + align + '">',
          '<span class="chat-img pull-' + align + '">',
          '<img src="' + settings.participants[meOrPartner].avatar + '" alt="User Avatar" class="img-circle"/>',
          '</span>',
          '<div class="chat-body clearfix"><div class="header">',
          '<small class="' + (isSentByMe ? 'pull-right' : '') + ' text-muted"><span class="glyphicon glyphicon-time"></span>' + message.createdAt + '</small>',
          '<strong class="' + (!isSentByMe ? 'pull-right' : '') + ' primary-font">' + settings.participants[meOrPartner].name + '</strong>',
          '</div><p>' + message.body + '</p></div>',
          '</li>',
        ].join('\n');
        // Вставляем в переписку
        if (toTheEnd) {
          self.find('ul.chat').append(mHtml); // В конец
        } else {
          self.find('ul.chat').prepend(mHtml); // В начало
        }
      }

      // Получили новое сообщение
      settings.socket.on('NEW_MESSAGE', function (message) {
        addMessageToChat(message);
      });

      // Получили список сообщений
      settings.socket.on('MESSAGES_LIST', function (messages) {
        messages.forEach(function (message) {
          addMessageToChat(message, false); // Вставляем сообщения в начало диалога один за одним
        })
      });

      settings.socket.open(); // Открываем соединение
    } else {
      console.error('Не переданы все необходимые параметры для инициализации чата');
    }

    return this; // Разрешить цепочку
  };

}(jQuery));