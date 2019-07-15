const testNotification = document.getElementById('notification-test');

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