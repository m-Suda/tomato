$(() => {

    const EVERY_SECOND = 1000;

    const START = 'start';
    const STOP = 'stop';
    const RESET = 'reset';

    const $workTime = $('#work-time');

    const $viewWorkTime = $('#work-time-count');

    const $start = $('#count-down-start');
    const $stop = $('#count-down-stop');
    const $reset = $('#timer-reset');

    /**
     * 残り時間オブジェクト
     * @type {{
     *      sec: number,
     *      min: number,
     *      initialize: initialize,
     *      isDisplayed: isDisplayed,
     *      saveToStorage: (function(): Promise<void>),
     *      fetchFromStorage: (function(): Promise<Object>),
     *      fetchFromBackground: (function(): Promise<Object>)
     * }}
     */
    const remainingTime = {
        min: 0,
        sec: 0,
        initialize: function() {
            this.min = Number($workTime.val());
            this.sec = 0;
        },
        isDisplayed: function() {
            $viewWorkTime.text(`${zeroPadding(this.min)}:${zeroPadding(this.sec)}`);
        },
        saveToStorage: function() {
            return new Promise(resolve => {
                chrome.storage.local.set({
                    remainingMin: this.min,
                    remainingSec: this.sec
                }, () => resolve());
            });
        },
        fetchFromStorage: function() {
            return new Promise(resolve => {
                chrome.storage.local.get(['remainingMin', 'remainingSec'], result => {
                    return resolve({
                        remainingMin: result.remainingMin,
                        remainingSec: result.remainingSec
                    });
                });
            });
        },
        fetchFromBackground: function() {
            return new Promise(resolve => {
                chrome.runtime.sendMessage(
                    {type: 'getRemainingTime'},
                    ({remainingMin, remainingSec}) => {
                        resolve({remainingMin, remainingSec});
                    });
            });
        }
    };

    /**
     * ステータスオブジェクト
     * @type {{
     *      isStop: (function(): Promise<void>),
     *      saveStart: (function(): Promise<void>),
     *      saveStop: (function(): Promise<boolean>),
     *      isStart: (function(): Promise<boolean>)
     * }}
     */
    const status = {
        saveStart: function() {
            return new Promise(resolve => {
                chrome.storage.local.set({status: START}, () => resolve());
            });
        },
        saveStop: function() {
            return new Promise(resolve => {
                chrome.storage.local.set({status: STOP}, () => resolve());
            });
        },
        isStart: function() {
            return new Promise(resolve => {
                chrome.storage.local.get(['status'], result => {
                    console.dir(result);
                    if (!Object.keys(result).length) {
                        // 空の時初回インストール時か、TimeUp後のためfalse
                        return resolve(false);
                    }
                    return resolve(result.status === START);
                });
            });
        },
        isStop: function() {
            return new Promise(resolve => {
                chrome.storage.local.get(['status'], result => {
                    if (!Object.keys(result).length) {
                        // 空のときはインストール時、TimeUp後のため、true
                        return resolve(true);
                    }
                    return resolve(result.status === STOP);
                });
            });
        }
    };

    /**
     * タイマーオブジェクト
     * @type {{
     *      value: number
     *      stop: (function(): void),
     *      start: (function(): void),
     *      countDown: (function(): void),
     *      hasPassedOneMinute: (function(): boolean),
     *      isFinish: (function(): boolean),
     * }}
     */
    const timer = {
        value: 0,
        start: function() {
            this.value = setInterval(function() {
                timer.countDown();
                remainingTime.isDisplayed();
            }, EVERY_SECOND);
        },
        stop: function() {
            clearInterval(this.value);
        },
        countDown: function() {
            if (this.hasPassedOneMinute()) {
                remainingTime.sec = 59;
                remainingTime.min--;
            } else {
                remainingTime.sec--;
            }

            if (this.isFinish()) {
                $viewWorkTime.text('Time up!');
                this.stop();
            }
        },
        hasPassedOneMinute: function() {
            return remainingTime.sec === 0;
        },
        isFinish: function() {
            return remainingTime.min === 0 && remainingTime.sec === 0;
        }
    };

    /**
     * 時間変更イベント
     */
    $workTime.on('change', () => {
        $viewWorkTime.text(`${$workTime.val()}:00`);
    });

    /**
     * STARTボタンクリックイベント
     */
    $start.on('click', async () => {
        $start.hide();
        $stop.show();
        $reset.hide();
        timer.start();
        await status.saveStart();
        sendRequestToBackground({
            type: START,
            settingMin: remainingTime.min,
            settingSec: remainingTime.sec
        });
    });

    /**
     * STOPボタンクリックイベント
     */
    $stop.on('click', async () => {
        $start.show();
        $stop.hide();
        $reset.show();
        timer.stop();
        await remainingTime.saveToStorage();
        await status.saveStop();
        sendRequestToBackground({ type: STOP });
    });

    /**
     * リセットボタンクリックイベント
     */
    $reset.on('click', async () => {
        remainingTime.initialize();
        await remainingTime.saveToStorage();
        remainingTime.isDisplayed();
        chrome.storage.local.clear();
        sendRequestToBackground({
            type: RESET,
            settingMin: remainingTime.min,
            settingSec: remainingTime.sec
        });
    });

    /**
     * バックグラウンドにメッセージを送る
     * @param request
     */
    const sendRequestToBackground = request => {
        chrome.runtime.sendMessage(request);
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
     * ボタンと時間の初期表示をする。
     * @return {Promise<void>}
     */
    const initView = async () => {
        if (await status.isStart()) {
            $start.hide();
            $stop.show();
            $reset.hide();

            /**
             * カウントダウン中に開くとbackground側とポップアップ側の秒数がズレるため、
             * background側を一旦止めて、再度ポップアップと調整して同期を図る。
             */
            $stop.click();
            const {remainingMin, remainingSec} = await remainingTime.fetchFromBackground();
            /**
             * タイマー起動中にchromeを閉じ、残り時間が0になった後に再度tomatoを開くと-のカウントダウンが始まるため、
             * ステータスがstart状態で分,秒がともに0の場合はリセットする。
             */
            if (remainingMin === 0 && remainingSec === 0) {
                remainingTime.initialize();
                remainingTime.isDisplayed();
                return;
            }
            remainingTime.min = remainingMin;
            remainingTime.sec = remainingSec;
            remainingTime.isDisplayed();
            $start.click();
            return;
        }

        $start.show();
        $stop.hide();
        $reset.show();

        const {remainingMin, remainingSec} = await remainingTime.fetchFromStorage();
        remainingTime.min = remainingMin || Number($workTime.val());
        remainingTime.sec = remainingSec || 0;
        remainingTime.isDisplayed();
    };
    initView();

});