const fs = require('fs')
const getProjectsNames = async () =>
  (await fs.promises.readdir('./projects', { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

const deepl = require('./Router Web Interface/node_modules/deepl-node')
const authKey = "ecc7fd55-6e59-4457-b036-62580a7f43b0:fx";
const translator = new deepl.Translator(authKey)
const LANGUAGE_CODES = ['ar','bg','cs','da','de','el','es','et','fi','fr','hu','id','it','ja','ko','lt','lv','nb','nl','pl','ro','ru','sk','sl','sv','tr','uk','zh']

const getTranslation = ({
    text,
    sourceLanguageCode = 'en',
    targetLanguageCode,
}) => {
    if(text.constructor === Array) {
        text = text.map(subText => subText.replaceAll('{', '<ignore>').replaceAll('}', '</ignore>'))

    } else {
        text = text.replaceAll('{', '<ignore>').replaceAll('}', '</ignore>')
    }


    return translator.translateText(
        text,
        sourceLanguageCode,
        targetLanguageCode,
        {
            ignoreTags: ['ignore'],
            tagHandling: 'xml'
        }
    );
}

const updateTranslations = async (projectName = 'Wild Heist Showdown') => {
    let sourceDictionary

    try {
        sourceDictionary = JSON.parse(fs.readFileSync('./projects/' + projectName + '/assets/translations/en.json', 'utf8'))
    } catch(e) {
        return console.log('english dictionary not found for project ' + projectName)
    }

    const sourceKeys = Object.keys(sourceDictionary)

    for (languageCode of LANGUAGE_CODES) {

        console.log(languageCode)
        let targetDictionary = {}
        const pathToFile = './projects/' + projectName + '/assets/translations/' + languageCode + '.json'

        try {
            targetDictionary = JSON.parse(fs.readFileSync(pathToFile, 'utf8'))
        } catch(e) {}

        const dictionaryPartToBeTranslated = {}

   
        for (sourceKey of sourceKeys) {
            if (!targetDictionary[sourceKey]) {
                dictionaryPartToBeTranslated[sourceKey] = sourceDictionary[sourceKey]
            }
        }

        const keys = Object.keys(dictionaryPartToBeTranslated)
        const values = Object.values(dictionaryPartToBeTranslated)

        if (!values.length) continue

        const translatedValues = await getTranslation({
            text: values,
            targetLanguageCode: languageCode
        })

        keys.forEach((key, i) => {
            targetDictionary[key] = translatedValues[i].text.replaceAll('<ignore>', '{').replaceAll('</ignore>', '}')
        })

        fs.writeFileSync(pathToFile, JSON.stringify(targetDictionary, null, " "))
    }
}


// updateTranslations()




getProjectsNames().then(async projects => {
    const argument = process.argv[2] ?? 'all'
    const finalProjectsNames = (argument === 'all') ? projects : [argument.replaceAll('-', ' ')]
    
    for(const projectName of finalProjectsNames) {
        console.log(projectName)
        await updateTranslations(projectName)
    }
})

