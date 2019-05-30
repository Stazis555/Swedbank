const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai')

describe('Swedbank login', () => {
    const width = 1250, height = 1250;
    const driver = new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().windowSize({ height: height, width: width })).build();
    //const driver = new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().windowSize({ height: height, width: width }).headless()).build(); // to run this in headless mode
    const baseURL = 'https://www.swedbank.ee/';
    const mySwedAccount = '';
    const myID = ''

    const wrongDetailsMsg = 'Sisestatud kasutajatunnus või parool ei ole õige.\n\nPalun jälgige juhiseid ja proovige uuesti. Kasutaja blokeeritakse pärast 5 ebaõnnestunud katset.';
    const emptyDetailsMsg = 'Sisestage palun kasutajatunnus';
    const translation = {
        english: {
            login_option: 'Log in with',
            account_number: 'User ID',
            account_ID: 'Personal code',
            submit_button: 'Enter'
        },
        estonian: {
            login_option: 'Logi sisse',
            account_number: 'Kasutajatunnus',
            account_ID: 'Isikukood',
            submit_button: 'Sisenen'
        },
        russian: {
            login_option: 'Вход',
            account_number: 'Номер пользователя',
            account_ID: 'Личный код',
            submit_button: 'Войти'
        }
    }

    const randomString = (length) => {
        let result = '';
        const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            result += charSet.charAt(Math.floor(Math.random() * charSet.length));
        }
        return result;
    }

    beforeEach(async () => {
        await driver.get(baseURL); // reload the page between each test
    });

    describe ('SmartId login',  () => {
        beforeEach (async () => {
            await driver.findElement(By.xpath('//ul[@class="tabsList"]//li[@id="loginTab_SMART_ID"]//a')).click();  //Choose SmartId login option
        });

        it ('ID input field is not visible on startup', async () => {
            let res = true;

            try {
                res = await driver.findElement(By.xpath('//span[@id="passwordFieldContainer"]')).isDisplayed();
            } catch (e) {
                res = false;
            }

            expect(res).to.be.false;
        });

        it('ID input field is not shown when 5 symbols or less are inserted in account number field', async () => {
            await driver.findElement(By.xpath('//input[@id="userId"]')).sendKeys(randomString(5));
            let result = true;
            try {
                result = await driver.findElement(By.xpath('//span[@id="authPwdBlockLabel"]')).isDisplayed();
            } catch (e) {
                result = false;
            }
            expect(result).to.be.false;
        });

        it ('ID input field is shown when more than 5 symbols are inserted in account number field', async () => {
            await driver.findElement(By.xpath('//input[@id="userId"]')).sendKeys(randomString(6));
            expect(await driver.findElement(By.xpath('//span[@id="authPwdBlockLabel"]')).isDisplayed()).to.be.true;
        });

        it('Login using SpaceBar', async () => {
            await driver.findElement(By.xpath('//div[@id="loginButton"]//a')).sendKeys(Key.SPACE);
            expect(await driver.findElement(By.xpath('//div[@class="errorMsg"]')).getText()).to.be.eq(emptyDetailsMsg);
        });

        it('Login using click', async () => {
            await driver.findElement(By.xpath('//div[@id="loginButton"]')).click();
            expect(await driver.findElement(By.xpath('//div[@class="errorMsg"]')).getText()).to.be.eq(emptyDetailsMsg);
        });

        it('Login using correct account details, submit with Enter', async () => {
            //Asume here are used correct account details to login, and login is successful.
            // await driver.findElement(By.xpath('//input[@id="userId"]')).sendKeys(mySwedAccount);
            // await driver.findElement(By.xpath('//input[@id="authPwd"]')).sendKeys(myID, Key.ENTER);
            // expect(await driver.findElement(By.xpath('//span[@class="login-challenge-title"]')).getText()).to.be.eq('Ваш контрольный код:')
        });

        it('Login using incorrect account details, shows error message', async () => {
            await driver.findElement(By.xpath('//input[@id="userId"]')).sendKeys(randomString(7));
            await driver.findElement(By.xpath('//input[@id="authPwd"]')).sendKeys(randomString(11), Key.ENTER);
            expect(await driver.findElement(By.xpath('//div[@class="errorMsg"]')).getText()).to.be.eq(wrongDetailsMsg);
        });

        it('Login using empty details, shows error message', async () => {
            await driver.findElement(By.xpath('//input[@id="userId"]')).sendKeys(Key.ENTER);
            expect(await driver.findElement(By.xpath('//div[@class="errorMsg"]')).getText()).to.be.eq(emptyDetailsMsg);
        });

        it ('Putting more than maximum characters in a account input field', async () => {
            const maxChars = randomString(15); //15 characters, maximum is 14
            await driver.findElement(By.xpath('//input[@id="userId"]')).sendKeys(maxChars);
            expect(await driver.findElement(By.xpath('//input[@id="userId"]')).getAttribute('value')).to.be.eq(maxChars.substring(0, maxChars.length - 1)); // last symbol is lost
        });

        it('Putting more than maximum characters in a password input field', async () => {
            const maxChars = randomString(17) //17 characters, maximum is 16
            await driver.findElement(By.xpath('//input[@id="userId"]')).sendKeys("1111111"); //to make authPwd visible
            await driver.findElement(By.xpath('//input[@id="authPwd"]')).sendKeys(maxChars);
            expect(await driver.findElement(By.xpath('//input[@id="authPwd"]')).getAttribute('value')).to.be.eq(maxChars.substring(0, maxChars.length - 1)); // last symbol is lost
        });

        it('Putting maximum characters in a account input field', async () => {
            const maxChars = randomString(14); //14 characters, maximum is 14
            await driver.findElement(By.xpath('//input[@id="userId"]')).sendKeys(maxChars);
            expect(await driver.findElement(By.xpath('//input[@id="userId"]')).getAttribute('value')).to.be.eq(maxChars);
        });

        it('Putting maximum characters in a password input field', async () => {
            const maxChars = randomString(16) //16 characters, maximum is 16
            await driver.findElement(By.xpath('//input[@id="userId"]')).sendKeys("1111111"); //to make authPwd visible
            await driver.findElement(By.xpath('//input[@id="authPwd"]')).sendKeys(maxChars);
            expect(await driver.findElement(By.xpath('//input[@id="authPwd"]')).getAttribute('value')).to.be.eq(maxChars);
        });

        it('Checking english language transaltion', async () => {
            await driver.findElement(By.xpath('//div[@class="language"]//div//a')).click();
            await driver.findElement(By.xpath('//div[@class="language"]//div//div//a[@aria-label="ENG"]')).click();
            expect(await driver.findElement(By.xpath('//h2[@id="login-title-label"]')).getText()).to.be.eq(translation.english.login_option);
            expect(await driver.findElement(By.xpath('//label[@for="userId"]')).getText()).to.be.eq(translation.english.account_number);
            await driver.findElement(By.xpath('//input[@id="userId"]')).sendKeys(randomString(7));
            expect(await driver.findElement(By.xpath('//span[@id="authPwdBlockLabel"]')).getText()).to.be.eq(translation.english.account_ID);
            expect(await driver.findElement(By.xpath('//div[@id="loginButton"]//a')).getText()).to.be.eq(translation.english.submit_button);
        });

        it('Checking estonian language transaltion', async () => {
            expect(await driver.findElement(By.xpath('//h2[@id="login-title-label"]')).getText()).to.be.eq(translation.estonian.login_option);
            expect(await driver.findElement(By.xpath('//label[@for="userId"]')).getText()).to.be.eq(translation.estonian.account_number);
            await driver.findElement(By.xpath('//input[@id="userId"]')).sendKeys(randomString(7));
            expect(await driver.findElement(By.xpath('//span[@id="authPwdBlockLabel"]')).getText()).to.be.eq(translation.estonian.account_ID);
            expect(await driver.findElement(By.xpath('//div[@id="loginButton"]//a')).getText()).to.be.eq(translation.estonian.submit_button);
        });

        it('Checking russian language transaltion', async () => {
            await driver.findElement(By.xpath('//div[@class="language"]//div//a')).click();
            await driver.findElement(By.xpath('//div[@class="language"]//div//div//a[@aria-label="RUS"]')).click();
            expect(await driver.findElement(By.xpath('//h2[@id="login-title-label"]')).getText()).to.be.eq(translation.russian.login_option);
            expect(await driver.findElement(By.xpath('//label[@for="userId"]')).getText()).to.be.eq(translation.russian.account_number);
            await driver.findElement(By.xpath('//input[@id="userId"]')).sendKeys(randomString(7));
            expect(await driver.findElement(By.xpath('//span[@id="authPwdBlockLabel"]')).getText()).to.be.eq(translation.russian.account_ID);
            expect(await driver.findElement(By.xpath('//div[@id="loginButton"]//a')).getText()).to.be.eq(translation.russian.submit_button);
        });
    });


    // describe('PIN-calc login', async () => {
    //     beforeEach (async () => {
    //         await driver.findElement(By.xpath('//ul[@class="tabsList"]//li[@id="loginTab_PIN_CALCULATOR"]//a')).click();          //choose pin-calc option
    //     });

    //     it ('Login using right account details', async () => {
    //         //await driver.findElement(By.xpath('//input[@id="userId"]')).sendKeys(mySwedAccount);
    //         //await driver.findElement(By.xpath('//input[@id="authPwd"]')).sendKeys(myPINCalcPass); I dont have one
    //         // expect login to be succesful
    //     });

    //     it ('Login using false account details, shows error message', async () => {
    //         await driver.findElement(By.xpath('//input[@id="userId"]')).sendKeys(randomString(7));
    //         await driver.findElement(By.xpath('//input[@id="authPwd"]')).sendKeys(randomString(7), Key.ENTER);
    //         expect(await driver.findElement(By.xpath('//div[@class="errorMsg"]')).getText()).to.be.eq(wrongDetailsMsg);
    //     });

    //     it ('Login using empty account details, shows error message', async () => {
    //         await driver.findElement(By.xpath('//input[@id="userId"]')).sendKeys(Key.ENTER);
    //         expect(await driver.findElement(By.xpath('//div[@class="errorMsg"]')).getText()).to.be.eq(emptyDetailsMsg);
    //     });
    // });

    after(async () => driver.quit());
})