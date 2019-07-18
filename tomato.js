$(() => {

    const EVERY_SECOND = 1000;

    const START = 'start';
    const STOP = 'stop';
    const RESTART = 'restart';
    const RESET = 'reset';

    const $workTime = $('#work-time');
    const $breakTime = $('#break-time');

    const $workTimeCount = $('#work-time-count');
    const $breakTimeCount = $('#break-time-count');

    const $buttonArea = $('#button-area');
    const $start = $('#count-down-start');
    const $restart = $('#count-down-restart');
    const $stop = $('#count-down-stop');
    const $reset = $('#timer-reset');

    let TIMER = 0;

    $workTime.on('change', () => {
        $workTimeCount.text(`${$workTime.val()}:00`);
    });
    $breakTime.on('change', () => {
        $breakTimeCount.text(`${zeroPadding(Number($breakTime.val()))}:00`);
    });

    $start.on('click', () => {
        initializeTime();
        TIMER = setInterval(() => {
            viewTime();
            countDown();
        }, EVERY_SECOND);
        sendRequestToBackground({
            type: START,
            settingMin: min,
            settingSec: sec
        });
    });

    $stop.on('click', () => {
        clearInterval(TIMER);
        sendRequestToBackground({ type: STOP });
    });

    $restart.on('click', () => {
        TIMER = setInterval(() => {
            viewTime();
            countDown();
        }, EVERY_SECOND);
        sendRequestToBackground({type: RESTART});
    });

    $reset.on('click', () => {
        initializeTime();
        viewTime();
        sendRequestToBackground({
            type: RESET,
            settingMin: min,
            settingSec: sec
        });
    });

    let min = 0;
    let sec = 0;

    /**
     * 残り時間をリセットする。
     */
    const initializeTime = () => {
        // min = Number($workTime.val());
        min = 0;
        sec = 10;
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
      console.log(`${zeroPadding(min)}:${zeroPadding(sec)}`);
      // $workTimeCount.text(`${zeroPadding(min)}:${zeroPadding(sec)}`);
    };

    /**
     * バックグラウンドにメッセージを送る
     * @param request
     */
    const sendRequestToBackground = request => {
        chrome.runtime.sendMessage(request);
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