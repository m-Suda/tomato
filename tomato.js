const workTime = document.getElementById('work-time');
const breakTime = document.getElementById('break-time');
const testNotification = document.getElementById('notification-test');

const workTimeCount = document.getElementById('work-time-count');
const breakTimeCount = document.getElementById('break-time-count');

workTimeCount.innerText = `${workTime.value}:00`;
breakTimeCount.innerText = `${breakTime.value}:00`;

testNotification.addEventListener('click', () => {
    createNotification();
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