$(() => {

    const EVERY_SECOND = 1000;

    const $workTime = $('#work-time');
    const $breakTime = $('#break-time');

    const $workTimeCount = $('#work-time-count');
    const $breakTimeCount = $('#break-time-count');

    const $buttonArea = $('#button-area');
    const $start = $('#count-down-start');
    const $restart = $('#count-down-restart');
    const $stop = $('#count-down-stop');
    const $reset = $('#timer-reset');

    let TIMER = '';

    $workTime.on('change', () => {
        $workTimeCount.text(`${$workTime.val()}:00`);
    });
    $breakTime.on('change', () => {
        $breakTimeCount.text(`${zeroPadding($breakTime.val())}:00`);
    });

    $start.on('click', () => {
        initializeTime();
        TIMER = setInterval(() => {
            countDown();
            viewTime();
        }, EVERY_SECOND);
    });

    // TODO: イベントページを想定し、Chrome.alarmsを試してみたやつ
    // $start.on('click', () => {
    //   chrome.alarms.create('hogeAlarms', {
    //     delayInMinutes: 1
    //   });
    // });

    // chrome.alarms.onAlarm.addListener(alarm => {
    //   showNotification();
    //   chrome.alarms.clear('hogeAlarms', bool => {});
    // });

    $stop.on('click', () => {
        clearInterval(TIMER);
    });

    $restart.on('click', () => {
        TIMER = setInterval(() => {
            countDown();
            viewTime();
        }, EVERY_SECOND);
    });

    $reset.on('click', () => {
        initializeTime();
        viewTime();
    });

    let min = 0;
    let sec = 0;

    /**
     * 残り時間をリセットする。
     */
    const initializeTime = () => {
        min = Number($workTime.val());
        sec = 0;
        // テスト用
        // min = 0;
        // sec = 5;
    };

    /**
     * カウントダウンする。
     */
    const countDown = () => {
        if (isTimeUp(min, sec)) {
          $workTimeCount.text('Time up!');
          showNotification();
          clearInterval(TIMER);
          return;
        }

        if (hasPassedOneMinute(sec)) {
          sec = 59;
          min--;
        } else {
          sec--;
        }
    };

    /**
     * 時間を表示する。
     */
    const viewTime = () => {
      $workTimeCount.text(`${zeroPadding(min)}:${zeroPadding(sec)}`);
    };

    /**
     * Chromeの通知を作成し、表示する。
     */
    const showNotification = () => {
        chrome.notifications.create(
            '',
            {
                type: 'basic',
                title: '通知テストだよー',
                iconUrl: 'img/tomato_128.png',
                message: 'これは通知の確認用テストです。'
            },
            (notificationId) => {
                console.log(`通知が表示されました。通知ID: ${notificationId}`);
            });
    };

    /**
     * 残り時間が無くなった
     * @param {number} remainingTimeMinutes
     * @param {number} remainingSecond
     * @return {boolean}
     */
    const isTimeUp = (remainingTimeMinutes, remainingSecond) => {
        return remainingTimeMinutes === 0 && remainingSecond === 0;
    };

    /**
     * 1分が経過した
     * @param second
     * @return {boolean}
     */
    const hasPassedOneMinute = second => {
        return second === 0;
    };

    /**
     * 2桁までを0埋めする
     * @param {number} num
     * @return {string}
     */
    const zeroPadding = num => {
        return String(num).padStart(2, '0');
    };
});