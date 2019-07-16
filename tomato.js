$(() => {

    const $workTime = $('#work-time');
    const $breakTime = $('#break-time');

    const $workTimeCount = $('#work-time-count');
    const $breakTimeCount = $('#break-time-count');

    const $start = $('#count-down-start');

    $workTimeCount.text(`${$workTime.val()}:00`);
    $breakTimeCount.text(`${$breakTime.val()}:00`);

    $workTime.on('change', () => {
        $workTimeCount.text(`${$workTime.val()}:00`);
    });
    $breakTime.on('change', () => {
        $breakTimeCount.text(`${$breakTime.val()}:00`);
    });

    $start.on('click', () => {

        let min = Number($workTime.val());
        let sec = 0;
        // テスト用
        // let min = 0;
        // let sec = 5;
        const intervalId = setInterval(() => {

            if (isTimeUp(min, sec)) {
                $workTimeCount.text('Time up!');
                createNotification();
                clearInterval(intervalId);
                return;
            }

            if (hasPassedOneMinute(sec)) {
                sec = 59;
                min--;
            } else {
                sec--;
            }

            $workTimeCount.text(`${zeroPadding(min)}:${zeroPadding(sec)}`);

        }, 1000);
    });

    function createNotification() {
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
    }

    /**
     * 残り時間が無くなった
     * @param {number} remainingTimeMinutes
     * @param {number} remainingSecond
     * @return {boolean}
     */
    function isTimeUp(remainingTimeMinutes, remainingSecond) {
        return remainingTimeMinutes === 0 && remainingSecond === 0;
    }

    /**
     * 1分が経過した
     * @param second
     * @return {boolean}
     */
    function hasPassedOneMinute(second) {
        return second === 0;
    }

    /**
     * 2桁までを0埋めする
     * @param {number} num
     * @return {string}
     */
    function zeroPadding(num) {
        return String(num).padStart(2, '0');
    }
});