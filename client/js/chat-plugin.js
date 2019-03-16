(function ($) {

  // Константы и необходимые определения

  // Основная функция
  $.fn.chat = function (options) {
    // Предустановки
    var settings = $.extend({
      partnerId: null,
      participants: null,
      socket: null,
      dateFormat: null
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
        if (settings.socket.connected) {
          console.log('Соединение с сервером успешно установлено');
          // Очищаем список сообщений
          self.find('ul.chat').html(null);
          if (self.data('page') === 1) {
            sendGetMessagesRequest();
          }
        }
      });

      // Потеряли подключение
      settings.socket.on('disconnect', function () {
        console.warn('Соединение с сервером потеряно')
      });

      // Отправить запрос на получение сообщений из переписки
      function sendGetMessagesRequest() { // Постраничная загрузка
        var page = self.data('page');
        settings.socket.emit('GET_MESSAGES', page - 1); // Отправляем запрос на получение последних сообщений
      }

      function scrollMessagesToTheLastOne() {
        self.find('.panel-body').animate({scrollTop: self.find('ul.chat').prop('scrollHeight')}); // Автоматически прокручиваем в конец
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
      function addMessageToChat(message, toTheEnd = true) {
        // Формируем html-код
        var isSentByMe = message.sender === settings.partnerId;
        var align = isSentByMe ? 'left' : 'right'; // Проверяем, от кого сообщение
        var meOrPartner = isSentByMe ? 'me' : 'partner';
        var messageDate = settings.dateFormat === null ? message.createdAt : settings.dateFormat(message.createdAt);
        var mHtml = [
          '<li class="clearfix ' + align + '">',
          '<span class="chat-img pull-' + align + '">',
          '<img src="' + settings.participants[meOrPartner].avatar + '" alt="User Avatar" class="img-circle"/>',
          '</span>',
          '<div class="chat-body clearfix"><div class="header">',
          '<small class="' + (isSentByMe ? 'pull-right' : '') + ' text-muted"><span class="glyphicon glyphicon-time"></span>' + messageDate + '</small>',
          '<strong class="' + (!isSentByMe ? 'pull-right' : '') + ' primary-font">' + settings.participants[meOrPartner].name + '</strong>',
          '</div><p>' + message.body + '</p></div>',
          '</li>',
        ].join('\n');
        // Вставляем в переписку
        var chatElem = self.find('ul.chat');
        if (toTheEnd) {
          chatElem.append(mHtml); // В конец
          scrollMessagesToTheLastOne();
        } else {
          chatElem.prepend(mHtml); // В начало
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
        });
        // Если первая страница, значит надо прокрутить в конец
        var page = self.data('page') || 1;
        if (page === 1) {
          self.find('.panel-body').animate({scrollTop: self.find('ul.chat').prop('scrollHeight')}); // Автоматически прокручиваем в конец
        }
        self.data('page', page + 1);
        // Добавляем кнопку загрузить еще
        self.find('#load-more').remove(); // Но сначала удалим прежний
        if (messages.length) { // Если получили пустой список, значит дальше ничего не будет
          self.find('ul.chat').prepend('<div class="text-center" id="load-more"><span class="badge">Загрузить более старые</span></div>');
          self.find('#load-more').click(onLoadMoreClickHandler);
        }
      });

      // Получили событие очистки чата
      settings.socket.on('DELETE_MESSAGES', function (userId) {
        if (userId !== settings.partnerId) {
          self.find('ul.chat').html(null);
        }
      });

      // Обработка нажатия на кнопку очистить
      self.find('#clear-chat').click(function (e) {
        e.preventDefault();
        if (confirm('Удалить все сообщения из переписки?')) {
          settings.socket.emit('DELETE_MESSAGES');
        }
      });

      // Обработчик нажатия на кнопку загрузить еще
      function onLoadMoreClickHandler(e) {
        e.preventDefault();
        sendGetMessagesRequest();
      }

      settings.socket.open(); // Открываем соединение
    } else {
      console.error('Не переданы все необходимые параметры для инициализации чата');
    }

    return this; // Разрешить цепочку
  };

}(jQuery));