import Browser from 'webextension-polyfill'
import './searchWorker'


Browser.runtime.onInstalled.addListener(async () => openChatGPTWebpage())

function openChatGPTWebpage() {
    Browser.tabs.create({
        url: "https://chat.openai.com/chat",
    })
}


Browser.action.onClicked.addListener(openChatGPTWebpage)


Browser.commands.onCommand.addListener(async (command) => {
    if (command === "toggle-web-access") {
        Browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            if (tabs[0].url.startsWith("https://chat.openai.com/")) {
                Browser.tabs.sendMessage(tabs[0].id, "toggle-web-access")
            }
        })
    }
})


Browser.runtime.onMessage.addListener((request) => {
    if (request === "show_options") {
        Browser.runtime.openOptionsPage()
    }

})



// Firefox does not support declarativeNetRequest.updateDynamicRules yet
Browser.declarativeNetRequest.updateDynamicRules({
    addRules: [
        {
            id: 1,
            priority: 1,
            action: {
                type: "modifyHeaders",
                requestHeaders: [
                    {
                        header: "Origin",
                        operation: "set",
                        value: "https://lite.duckduckgo.com"
                    },
                ],
            },

            condition: {
                urlFilter: "https://lite.duckduckgo.com/*",
                resourceTypes: ["xmlhttprequest"],
            },
        },
    ],
    removeRuleIds: [1],
})

if (Browser.runtime.getManifest().version == '2') {
    Browser.browserAction.onClicked.addListener(openChatGPTWebpage)
    update_origin_for_ddg_in_firefox()
} else {
    Browser.action.onClicked.addListener(openChatGPTWebpage)
}

function update_origin_for_ddg_in_firefox() {
    Browser.webRequest.onBeforeSendHeaders.addListener(
        (details) => {
            for (let i = 0; i < details.requestHeaders.length; ++i) {
                if (details.requestHeaders[i].name === 'Origin')
                    details.requestHeaders[i].value = "https://lite.duckduckgo.com"
            }

            return {
                requestHeaders: details.requestHeaders
            }
        }, {
        urls: ["https://lite.duckduckgo.com/*"],
    },
        ["blocking", "requestHeaders"]
    )
}