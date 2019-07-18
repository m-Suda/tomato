const EVERY_SECOND = 1000;

const START = 'start';
const STOP = 'stop';
const RESTART = 'restart';
const RESET = 'reset';

let TIMER = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const {type, settingMin, settingSec} = request;
    switch (type) {
        case START:
            start({settingMin, settingSec});
            break;
        case STOP:
            stop();
            break;
        case RESTART:
            restart();
            break;
        case RESET:
            reset({settingMin, settingSec});
    }
});

const start = ({settingMin, settingSec}) => {
    initializeTime(settingMin, settingSec);
    TIMER = setInterval(() => {
        viewTime();
        countDown();
    }, EVERY_SECOND);
};

const restart = () => {
    TIMER = setInterval(() => {
        viewTime();
        countDown();
    }, EVERY_SECOND);
};

const stop = () => {
    clearInterval(TIMER);
};

const reset = ({settingMin, settingSec}) => {
    initializeTime(settingMin, settingSec);
    viewTime();
};

let min = 0;
let sec = 0;

/**
 * カウントダウンする
 */
const countDown = () => {
    if (isTimeUp(min, sec)) {
        clearInterval(TIMER);
        showNotification();
        return;
    }

    if (hasPassedOneMinute(sec)) {
        min--;
        sec = 59;
    } else {
        sec--;
    }
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
 * 残り時間をリセットする
 * @param settingMin
 * @param settingSec
 */
const initializeTime = (settingMin, settingSec) => {
    min = settingMin;
    sec = settingSec;
};

/**
 * 時間を表示する。
 */
const viewTime = () => {
    console.log(`${zeroPadding(min)}:${zeroPadding(sec)}`);
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
