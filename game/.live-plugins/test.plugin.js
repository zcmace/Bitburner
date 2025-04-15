importPackage(java.text)

const actionId = 'ShowTime'

ide.actions.registerAction(actionId, "Show Time", (e) => {
        const time = new SimpleDateFormat("HH:mm").format(new Date())
        ide.notification.notify("Current time", '<html><body><h1>' + time + '</h1></body></html>')
    }
)

ide.addShortcut(actionId, "ctrl 1")