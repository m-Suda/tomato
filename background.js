const EVERY_SECOND = 1000;

const START = 'start';
const STOP = 'stop';
const RESET = 'reset';

/**
 * 残り時間オブジェクト
 * @type {{
 *      min: number,
 *      sec: number,
 *      initialize: (function(number, number): void),
 *      isDisplayed: (function(): void)
 * }}
 */
const remainingTime = {
    min: 0,
    sec: 0,
    initialize: function(settingMin, settingSec) {
        this.min = settingMin;
        this.sec = settingSec;
    },
    isDisplayed: function() {
        console.log(`${zeroPadding(this.min)}:${zeroPadding(this.sec)}`);
    }
};

/**
 * タイマーオブジェクト
 * @type {{
 *      value: number
 *      start: (function(): void),
 *      stop: (function(): void),
 *      countDown: (function(): void),
 *      isFinish: (function(): boolean),
 *      hasPassedOneMinute: (function(): boolean),
 * }}
 */
const timer = {
    value: 0,
    start: function() {
        this.value = setInterval(() => {
            this.countDown();
            remainingTime.isDisplayed();
        }, EVERY_SECOND);
    },
    stop: function() {
        clearInterval(this.value);
    },
    countDown: function() {
        if (this.hasPassedOneMinute()) {
            remainingTime.min--;
            remainingTime.sec = 59;
        } else {
            remainingTime.sec--;
        }

        if (this.isFinish()) {
            showNotification();
            this.stop();
        }
    },
    isFinish: function() {
        return remainingTime.min === 0 && remainingTime.sec === 0;
    },
    hasPassedOneMinute: function() {
        return remainingTime.sec === 0;
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const {type, settingMin, settingSec} = request;
    switch (type) {
        case START:
            start({settingMin, settingSec});
            break;
        case STOP:
            stop();
            break;
        case RESET:
            reset({settingMin, settingSec});
            break;
        case 'getRemainingTime':
            sendResponse({remainingMin: remainingTime.min, remainingSec: remainingTime.sec});
    }
});

const start = ({settingMin, settingSec}) => {
    remainingTime.initialize(settingMin, settingSec);
    timer.start();
};

const stop = () => {
    timer.stop();
};

const reset = ({settingMin, settingSec}) => {
    remainingTime.initialize(settingMin, settingSec);
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
 * Chromeの通知を作成し、表示する。
 */
const showNotification = () => {
    chrome.storage.local.clear();
    chrome.notifications.create(
        '',
        {
            type: 'basic',
            title: '時間だよ！',
            iconUrl: 'img/tomato_128.png',
            message: '1ポモドーロよく頑張りました！'
        },
        (notificationId) => {
            console.log(`通知が表示されました。通知ID: ${notificationId}`);
    });
};
