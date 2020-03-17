const fs = require('fs');
const inquirer = require('inquirer');
const {exec} = require('child_process');
const compressing = require('compressing');
const chalk = require('chalk');

main()

async function main() {
    let userHasFinishToProcess = false
    console.log(chalk.bgGreen('                                 '))
    console.log(chalk.bgGreen('           ' + chalk.black.bold('AWS MANAGER') + chalk.bgGreen('           ')))
    console.log(chalk.bgGreen('                                 '))
    console.log(('                                 '))
    console.log(('                                 '))
    while (!userHasFinishToProcess) {
        const {action} = await inquirer.prompt({
            choices: ['Deployer un lambdas', 'Créer un lambdas'],
            type: 'list',
            name: 'action',
            message: chalk.blue.bold('Choisir la fonction a executé')
        })

        const resolveFunction = ({
            'Deployer un lambdas': deployFunction,
            'Créer un lambdas': createFunction
        })[action]

        await resolveFunction()

        console.log(('                                 '))
        const {endOfScript} = await inquirer.prompt({
            choices: ['Oui', 'Non'],
            type: 'list',
            name: 'endOfScript',
            message: chalk.yellow.bold(`Voulez-vous effectuer d'autres actions ? `)
        })
        if (endOfScript === 'Non') {
            console.log(('                                 '))
            console.log(('                                 '))
            console.log(chalk.bgGreen('                                 '))
            console.log(chalk.bgGreen('           ' + chalk.black.bold('AUREVOIR !') + chalk.bgGreen('            ')))
            console.log(chalk.bgGreen('                                 '))
            userHasFinishToProcess = true
        }
    }
}

const deployFunction = async () => {
    try {
        console.log('Start deployScript')
        const listOfFiles = fs.readdirSync('./', {withFileTypes: true})
        const listOfDirectory = listOfFiles.reduce((all, file) => {
            if (file.isDirectory() && !file.name.includes('.') && !file.name.includes('node_modules')) {
                all.push(file.name)
            }
            return all
        }, [])

        const {nameOfFunction} = await inquirer.prompt({
            type: 'list',
            choices: listOfDirectory,
            name: 'nameOfFunction',
            message: 'Choisir quel dossier deployer : '
        })

        const listInDirectory = fs.readdirSync(`./${nameOfFunction}`)
        if (listInDirectory.includes('webpack')) {
            console.log('Build de la fonction')
            // const build = await exec('npm run build', {
            //     cwd: `./${nameOfFunction}/index.js`
            // })
            console.log('Build de la fonction terminé !')
        }
        compressing.gzip.compressFile(`./${nameOfFunction}/index.js`, './index.js.gzip')
        // await exec(`aws lambda update-function-code --function-name ${nameOfFunction} --zip-file ./compress.js.gzip`)
        console.log(chalk.green('✅   Deploiement terminé !'))
    } catch (e) {
        showError(e)
    }
}

const createFunction = async () => {
    try {
        const {nameOfFunction} = await inquirer.prompt({
            type: 'input',
            name: 'nameOfFunction',
            message: `Comment s'appelle la fonction à créer ?`
        })
        const {userIsSure} = await inquirer.prompt({
            type: 'list',
            name: 'userIsSure',
            choices: ['Oui', 'Non'],
            message: `Êtes vous sur du nom suivant : ${nameOfFunction} ? `
        })

        if (userIsSure === 'Oui') {
            // await exec(`aws lamnda `)
            await createBoilerPlateForFunction(nameOfFunction)
            await instalDependencies(nameOfFunction)
            console.log(chalk.green('✅   Création terminée !'))
        } else {
            console.log(chalk.red('Création de fonction annulée'))
        }
    } catch (e) {
        showError(e)
    }
}

const createBoilerPlateForFunction = async (nameOfFunction) => {
    try {
        const PATH = `./${nameOfFunction}`
        fs.mkdirSync(PATH)
        const listOfFile = fs.readDirSync('./.boilerplate')
        listOfFile.forEach(file => {
            fs.copyFileSync(`./.boilerplate/${file}`, PATH + `/${file}`)
        })
    } catch (e) {
        showError(e)
    }
}

const instalDependencies = async(nameOfFunction) => {
    const {userIsSure} = await inquirer.prompt({
        type: 'list',
        name: 'userIsSure',
        choices: ['Oui', 'Non'],
        message: `Voulez-vous installer les dépendances pour la fonction suivante : ${nameOfFunction} ? `
    })

    if (userIsSure === 'Oui') {
        exec(`cd ./${nameOfFunction} && npm install`)
    }
}

const showError = (e) => {
    console.log(chalk.red.bold('Error during execution of script : '))
    console.log(e)
}