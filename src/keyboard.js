const kb = require('./keyboard-buttons')

module.exports = {
    home: [
        [kb.home.dbwork]
    ],
    functions: [
        [kb.functions.showData, kb.functions.insertData],
        [kb.functions.updateData, kb.functions.deleteData],
        [kb.back]
    ]
}