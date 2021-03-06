'use strict';
const har = require('chrome-har');
const {FileSystemHelper} = require('./FileSystemHelper');

const observe = [
    'Page.loadEventFired',
    'Page.domContentEventFired',
    'Page.frameStartedLoading',
    'Page.frameAttached',
    'Page.frameScheduledNavigation',
    'Network.requestWillBeSent',
    'Network.requestServedFromCache',
    'Network.dataReceived',
    'Network.responseReceived',
    'Network.resourceChangedPriority',
    'Network.loadingFinished',
    'Network.loadingFailed',
];

const events = [{}];

class HarHelper {

    constructor(page, path = './artifacts/har/') {
        this._page = page;
        this._fileSystemHelper = new FileSystemHelper(path);
    }

    async start() {
        const client = await this._page.target().createCDPSession();

        await client.send('Page.enable');
        await client.send('Network.enable');

        observe.forEach(method => {
            client.on(method, params => {
                events.push({method, params});
            });
        });
    }

    stop() {
        const _har = har.harFromMessages(events);
        const name = `${new Date().valueOf()}_PID_${process.pid}_chrome_browser_log.har`;

        this._fileSystemHelper.makeDir();
        this._fileSystemHelper.writeFileStream(JSON.stringify(_har), name);

        return Promise.resolve();
    }
}

module.exports = {HarHelper};
