module.exports = {

    logStart() {
        console.log('Bot started')
    },

    getChatId(m) {
        return m.chat.id
    }

}