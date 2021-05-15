const TelegramBot = require('node-telegram-bot-api')
const config = require('./config')
const helper = require('./helper')
const keyboard = require('./keyboard')
const kb = require('./keyboard-buttons')
const mongoose = require('mongoose')

helper.logStart()

mongoose.connect(config.DB_URL, {
    useMongoClient: true
}).then(() => console.log('Mongo is work'))

require('./Models/Coffee.model')
const Coffee = mongoose.model('coffees')

const bot = new TelegramBot(config.TOKEN, {
    polling: true
})

let data = {
    coffe: [
        {
            "uuid": "",
            "name": "",
            "percent": "",
            "price": ""
        }
    ]
}

let CoffeeId = ''

bot.on('message', m => {

    switch (m.text) {
        case kb.home.dbwork: {
            bot.sendMessage(helper.getChatId(m), 'Оберіть дію:', {
                reply_markup: {keyboard: keyboard.functions}})
            break
        }

        case kb.functions.showData: {
            ShowCoffeeByQuery(helper.getChatId(m), {})
            break
        }
        case kb.functions.insertData: {
            bot.sendMessage(helper.getChatId(m), 'Відправте нові дані за допомогою команд:\n/id - new ID\n/name new coffee name\n/percent percent for coffee\n/price price this coffee\nПісля відправлення нових даних натисніть "Додати дані"')
            if (kb.functions.insertData) {
                bot.onText(/\/name (.+)/, t => {
                    data.coffe[0].name = ""
                    data.coffe[0].name = t.text.slice(6)
                })
                if (data.coffe[0].name.length > 0){
                    // console.log(data.coffe[0].name)
                }


                bot.onText(/\/id (.+)/, t => {
                    data.coffe[0].uuid = ""
                    data.coffe[0].uuid = t.text.slice(4)
                })
                if (data.coffe[0].uuid.length > 0){
                    // console.log(data.coffe[0].uuid)
                }


                bot.onText(/\/percent (.+)/, t => {
                    data.coffe[0].percent = ""
                    data.coffe[0].percent = t.text.slice(9) + '%'
                })
                if (data.coffe[0].percent.length > 0){
                    // console.log(data.coffe[0].percent)
                }


                bot.onText(/\/price (.+)/, t => {
                    data.coffe[0].price = ""
                    data.coffe[0].price = t.text.slice(7) + ' Грн'
                })
                if (data.coffe[0].price.length > 0){
                    // console.log(data.coffe[0].price)
                }
            }
            console.log(data.coffe[0])
            data.coffe.forEach(coffe => new Coffee(coffe).save())
            data.coffe[0].uuid = ''
            data.coffe[0].name = ''
            data.coffe[0].percent = ''
            data.coffe[0].price = ''
            break
        }
        case kb.functions.updateData: {
            bot.sendMessage(helper.getChatId(m), 'Відправте нові дані за допомогою команд:\n/i - Відправте ID кави яку хочете редагувати\n/n new coffee name\n/pe percent for coffee\n/pr price this coffee\nПісля відправлення нових даних натисніть "Редагувати дані"')

            if (kb.functions.updateData) {
                bot.onText(/\/i (.+)/, t => {
                    CoffeeId = t.text.slice(3)
                })

                bot.onText(/\/n (.+)/, t => {
                    Coffee.find({"uuid": CoffeeId}).then(c => {
                        c.forEach(elem => {
                            elem.name = t.text.slice(3)
                            new Coffee(elem).save()
                        })
                    })
                })

                bot.onText(/\/pe (.+)/, t => {
                    Coffee.find({"uuid": CoffeeId}).then(c => {
                        c.forEach(elem => {
                            elem.percent = t.text.slice(4) + '%'
                            new Coffee(elem).save()
                        })
                    })
                })

                bot.onText(/\/pr (.+)/, t => {
                    Coffee.find({"uuid": CoffeeId}).then(c => {
                        c.forEach(elem => {
                            elem.price = t.text.slice(4) + ' Грн'
                            new Coffee(elem).save()
                        })
                    })
                })
            }
            break
        }
        case kb.functions.deleteData: {
            bot.sendMessage(helper.getChatId(m), 'За допомогою команди  /delete відправте ID кави яку хочете видалити:  /delete ID кави\nПісля чого натисніть клавішу "Видалити" для підтвердження')
            if (kb.functions.deleteData) {
                bot.onText(/\/delete (.+)/, d => {
                    let deleteId = d.text.slice(8)

                        Coffee.find({"uuid": deleteId}).then(c => {
                        c.forEach(elem => {
                            new Coffee(elem).deleteOne()
                        })
                    })
                })
            }
            break
        }

        case kb.back: {
            if (kb.back) {
                bot.sendMessage(helper.getChatId(m), 'Оберіть команду для початку роботи:', {
                    reply_markup: {keyboard: keyboard.home}
                })
            }
            break
        }
    }
})

bot.onText(/\/start/, m => {

    const text = `Привіт ${m.from.first_name}\nОберіть команду для початку роботи:`

    bot.sendMessage(helper.getChatId(m), text, {
        reply_markup: {
            keyboard: keyboard.home
        }
    })
})






//==========================================

function ShowCoffeeByQuery(chatId, query) {
    Coffee.find(query).then(coffees => {
        const html = coffees.map((c, i) => {
            return `<b>#${i + 1}</b>\n<b>ID: ${c.uuid}</b> \n<b>Coffee name:</b> ${c.name} \n<b>Percent:</b> ${c.percent} \n<b>Price:</b> ${c.price} \n`
        }).join('\n\n')

        SendHtml(chatId, html, 'functions')
    })
}

function SendHtml(chatId, html, kbName = null) {
    const options = {
        parse_mode: 'HTML'
    }

    if (kbName) {
        options['reply_markup'] = {
            keyboard: keyboard[kbName]
        }
    }

    bot.sendMessage(chatId, html, options)
}

//