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

    /**
     * TODO: stopで一旦止めたあと、Startを押さないと正常に動かない
     *   間違ってRestartを押すと通知がバグる
     */
    $start.on('click', async () => {
        if (await isStarted()) {
            const {remainingMin, remainingSec} = await fetchRemainingTime();
            min = remainingMin;
            sec = remainingSec;
        } else {
            initializeTime();
        }
        TIMER = setInterval(() => {
            viewTime(min, sec);
            countDown();
        }, EVERY_SECOND);
        sendRequestToBackground({
            type: START,
            settingMin: min,
            settingSec: sec
        });
    });

    /**
     * TODO: Stopを押したとき、秒数が1秒少なく登録される
     */
    $stop.on('click', async () => {
        clearInterval(TIMER);
        await setRemainingTime();
        sendRequestToBackground({ type: STOP });
    });

    $restart.on('click', () => {
        TIMER = setInterval(() => {
            viewTime(min, sec);
            countDown();
        }, EVERY_SECOND);
        sendRequestToBackground({type: RESTART});
    });

    $reset.on('click', async () => {
        initializeTime();
        viewTime(min, sec);
        await setIsNotStarted();
        sendRequestToBackground({
            type: RESET,
            settingMin: min,
            settingSec: sec
        });
    });

    let min = 0;
    let sec = 0;

    /**
     * 既にタイマーがスタートしている。
     * @return {Promise<boolean>}
     */
    const isStarted = () => {
        return new Promise(resolve => {
            chrome.storage.local.get(['isStarted'], result => {
                if (!Object.keys(result).length) {
                    return resolve(false);
                }
                return resolve(result.isStarted);
            });
        });
    };

    /**
     * Storageから残り時間を取得する。
     * @return {Promise<Object>}
     */
    const fetchRemainingTime = () => {
        return new Promise(resolve => {
            chrome.storage.local.get(['remainingMin', 'remainingSec'], result => {
                return resolve({
                    remainingMin: result.remainingMin,
                    remainingSec: result.remainingSec
                });
            });
        });
    };

    /**
     * 残り時間を保存する。
     * @return {Promise<void>}
     */
    const setRemainingTime = () => {
        return new Promise(resolve => {
            chrome.storage.local.set({
                isStarted: true,
                remainingMin: min,
                remainingSec: sec
            }, () => resolve());
        });
    };

    /**
     * 残り時間を保存する。
     * @return {Promise<void>}
     */
    const setIsNotStarted = () => {
        return new Promise(resolve => {
            chrome.storage.local.set({isStarted: false}, () => resolve());
        });
    };

    /**
     * 残り時間をリセットする。
     */
    const initializeTime = () => {
        min = 0;
        // min = Number($workTime.val());
        sec = 30;
    };

    /**
     * カウントダウンする。
     */
    const countDown = () => {
        if (isTimeUp(min, sec)) {
          $workTimeCount.text('Time up!');
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
    const viewTime = (viewMin, viewSec) => {
      $workTimeCount.text(`${zeroPadding(viewMin)}:${zeroPadding(viewSec)}`);
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

    /**
     * 時間の初期表示をする。
     * TODO: const定義のため、上で宣言するともろもろのメソッドが使えない。
     *   眠くて適当に持ってきたので、修正必須
     * @return {Promise<void>}
     */
    const initViewTime = async () => {
        let initViewMin = 0;
        let initViewSec = 0;
        if (await isStarted()) {
            const {remainingMin, remainingSec} = await fetchRemainingTime();
            initViewMin = remainingMin;
            initViewSec = remainingSec;
        } else {
            initViewMin = 25;
            initViewSec = 0;
        }

        viewTime(initViewMin, initViewSec);
    };
    initViewTime();

});