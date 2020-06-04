import { browser, by, element, protractor } from 'protractor';

export class RegisterPage {

  private userData = {
    email: (new Date().getTime()) + 'explorerE2Etest@test.com',
    password: '12345678',
    name: 'Explorer Test',
    surname: 'Explorer e2e test',
    address: 'False Street 123',
    phone: '954123345'
  };


  navigateTo() {
    return browser.get('/register');
  }

  getRoleText() {
    return browser.wait(function() {
        return element(by.id('role')).getAttribute('value').then(function(value) {
          return value;
        });
    });
  }

  fillRegister(data: any = this.userData) {
    const EC = protractor.ExpectedConditions;
    browser.ignoreSynchronization = true;
    const registerButton = element(by.id('buttonregister'));
    element(by.id('email')).sendKeys(data.email);
    element(by.id('password')).sendKeys(data.password);
    element(by.id('name')).sendKeys(data.name);
    element(by.id('surname')).sendKeys(data.surname);
    element(by.id('address')).sendKeys(data.address);

    // Scroll to an element
    return browser.executeScript(function () { arguments[0].scrollIntoView(); }, registerButton.getWebElement()).then(function () {
        browser.wait(EC.visibilityOf(element(by.id('phone'))), 5000, 'Element did not appear');
        element(by.id('phone')).sendKeys(data.phone);
        browser.wait(EC.elementToBeClickable(registerButton), 5000);
        registerButton.click();
        browser.wait(EC.visibilityOf(element(by.css('.swal-modal'))), 10000);
        browser.sleep(10000);
        return element(by.css('.swal-modal')).getText();
    });
  }

}
